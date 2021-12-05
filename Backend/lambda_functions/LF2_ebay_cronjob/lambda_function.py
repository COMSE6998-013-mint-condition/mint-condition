from ebaysdk.finding import Connection
from ebaysdk.exception import ConnectionError
import os
import datetime
import math
from concurrent.futures import ThreadPoolExecutor
import boto3
import pymysql

MAX_WORKERS = 10

# establish Ebay API client
client = Connection(
    domain='svcs.ebay.com', # SANDBOX: svcs.sandbox.ebay.com
    appid=os.environ['EBAY_PROD_CLIENT_ID'], 
    config_file=None)

# establish database connection
region = 'us-east-1'
s3=boto3.client('s3')

rdsConn = pymysql.connect(host=os.environ['DB_HOST'],
    user=os.environ['DB_USER'],
    password=os.environ['DB_PASSWORD'],
    database=os.environ['DB_DATABASE'],
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)


def rds_insert(data):
    '''
    Insert data into RDS 
    '''
    global rdsConn
    if rdsConn.close:
        rdsConn = pymysql.connect(host=os.environ['DB_HOST'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'],
            database=os.environ['DB_DATABASE'],
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )

    with rdsConn:
        with rdsConn.cursor() as cursor:
            sql = '''
                INSERT INTO `ebay_price_data` 
                    (`card_id`, `timestamp`, `mean_price`, `max_price`, `min_price`, `count`) 
                VALUES (%s, %s, %s, %s, %s, %s)
            '''
            # insert in batches - list of tuples
            cursor.executemany(sql, list([(x['card_id'], x['timestamp'], x['mean_price'], x['max_price'], x['min_price'], x['count'])for x in data]))
            rdsConn.commit()
            insert_id = rdsConn.insert_id()
            print("Successfully inserted:", insert_id)
            return insert_id

def search_ebay(card_id, keywords="", entries=100, num_pages=1):
    '''
    Github Reference: https://github.com/timotheus/ebaysdk-python/wiki/Finding-API-Class
    API Reference: https://developer.ebay.com/DevZone/finding/Concepts/FindingAPIGuide.html
        - Filtering: https://developer.ebay.com/devzone/finding/callref/types/ItemFilterType.html

    Defaults: 
        Location:  
            X-EBAY-C-MARKETPLACE-ID: EBAY-US
        SortOrder:
            BestMatch
    '''
    try:
        total_price = 0
        min_price = math.inf
        max_price = -math.inf
        count = 0
        item_ids = set() # store seen items

        # refine keyword
        if 'card' not in keywords.lower() and 'cards' not in keywords.lower():
            keywords += 'trading card'
        
        for page_num in range(0, num_pages):
            params = {
             "keywords" : keywords.lower(),
             "paginationInput" :
                    {
                        "entriesPerPage" : entries, # max 100.
                        "pageNumber" : page_num+1
                    }
             }
             
            response = client.execute("findItemsAdvanced", params).dict()
            if response['ack'] == 'Success':
                for r in response['searchResult'].get('item',[]):
                    # store if not seen before
                    if r['itemId'] not in item_ids:
                        item_ids.add(r['itemId'])
                        current_price = float(r['sellingStatus']['convertedCurrentPrice']['value']) # in USD
                        max_price = max(current_price, max_price)
                        min_price = min(current_price, min_price)
                        total_price += current_price
                        count += 1
        return {
            'card_id': card_id,
            'keywords' : keywords,
            'timestamp': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'mean_price' : round(total_price / count, 2) if count > 0 else 0,
            'min_price' : round(min_price,2) if count > 0 else 0,
            'max_price' : round(max_price,2) if count > 0 else 0,
            'count' : count
        }

    except ConnectionError as e:
        print("Error extracting ebay data", e)
        print(e.response.dict())

def search_ebay_helper(card):
    '''
    Helper function pass data into search_ebay function via multithreading
    '''
    return search_ebay(card_id=card['card_id'], keywords=card['card_label'].replace(',', ' '), entries=100)

def get_all_cards():
    '''
    Query database for list of cards 
    Condition: last queried/inserted timestamp in `ebay_price_data` is older than today 
    '''
    with rdsConn:
        with rdsConn.cursor() as cursor:
            sql = """
                SELECT 
                    DISTINCT(cards.card_id) as card_id,
                    cards.card_label
                FROM cards
                WHERE cards.card_id NOT IN 
                    (SELECT 
                        DISTINCT(card_id) 
                    FROM ebay_price_data 
                    WHERE timestamp >= NOW() - INTERVAL 24 HOUR
                )
            """
            cursor.execute(sql)
            return [] if cursor.rowcount == 0 else cursor.fetchall() # return list of cards

def lambda_handler(event, context): 
    try:
        cards = get_all_cards()
        if len(cards):
            result = []
            with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
                result.extend(list(executor.map(search_ebay_helper, cards)))
            rds_insert(result)
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept,x-amz-meta-customLabels',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,PUT,GET'
            },
        }
        
    except Exception as e:
        print("Error extracting Ebay Catalog data:", e)
        return {
            'statusCode': 501,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept,x-amz-meta-customLabels',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,PUT,GET'
            }
        }
