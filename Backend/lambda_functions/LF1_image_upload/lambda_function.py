import json
import urllib3
import urllib.parse
import boto3
import pymysql
import os
import time

from ebaysdk.finding import Connection
from ebaysdk.exception import ConnectionError
import datetime
import math


region = 'us-east-1'
s3=boto3.client('s3')

os_host = os.environ['os_url']
os_username = os.environ['os_username']
os_pw = os.environ["os_pw"]
os_index = 'cards'
os_url = os_host + os_index

client = Connection(
    domain='svcs.ebay.com', # SANDBOX: svcs.sandbox.ebay.com
    appid=os.environ['EBAY_PROD_CLIENT_ID'], 
    config_file=None)

def lambda_handler(event, context):
    
    rdsConn = pymysql.connect(host=os.environ['DB_HOST'],
                              user=os.environ['DB_USER'],
                              password=os.environ['DB_PASSWORD'],
                              database=os.environ['DB_DATABASE'],
                              charset='utf8mb4',
                              cursorclass=pymysql.cursors.DictCursor,
                              autocommit=True)

    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    s3_data = get_s3_metadata(key, bucket)
    label = s3_data['ResponseMetadata']['HTTPHeaders']['x-amz-meta-customlabels'] if 'x-amz-meta-customlabels' in s3_data['ResponseMetadata']['HTTPHeaders'] else ""
    time_created = s3_data['LastModified'].strftime("%Y-%m-%dT%H:%M:%S.%fZ") #convert to a time.struct_time object -> will store as a unix timestamp
    user_id = s3_data['ResponseMetadata']['HTTPHeaders']['x-amz-meta-user']
    # user_id = "google_101390119411965147253"
    
    card_id = rds_insert(rdsConn, user_id, label, time_created, bucket, key)

    # ebay API
    ebay_data = search_ebay(card_id=card_id, keywords=label.replace(',', ' ')) # returns dict of pricing data
    if ebay_data:
        rds_insert_ebay(rdsConn, ebay_data)

    #TODO make sure condition is a float value
    condition = invoke_sagemaker(bucket, key) 

    condition_name = rds_update_condition(rdsConn, card_id, condition)

    split_labels = [l.strip() for l in label.split(',')]
    upload_to_opensearch(card_id=card_id, user_id=user_id, created_timestmap=time_created, labels=split_labels, condition=condition_name)
    
    rdsConn.close()
    
    return


# TODO
def invoke_sagemaker(bucket, key):
    return 2.0


def rds_insert(conn, user_id, label, time_created, bucket, key):
    with conn.cursor() as cursor:
        sql = "INSERT INTO `cards` (`card_label`, `card_bucket`, `card_s3_key`, `user_id`, `time_created`) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(sql, (label, bucket, key, str(user_id), time.mktime(time.strptime(time_created, "%Y-%m-%dT%H:%M:%S.%fZ"))))
    return conn.insert_id()


def rds_update_condition(conn, card_id, condition):
    condition_id = None
    card_condition_name = ""

    #TODO implement failure handling - what if nothing is retrieved
    with conn.cursor() as cursor:
        sql = "SELECT `card_condition_id`, `card_condition_name` FROM `card_conditions` WHERE `card_condition_rating` = %s"
        cursor.execute(sql, (condition,))
        result = cursor.fetchone()
        condition_id = result['card_condition_id']
        card_condition_name = result['card_condition_name']
        
        
    with conn.cursor() as cursor:
        sql = "UPDATE `cards` SET `card_condition_id` = %s WHERE `card_id` = %s"
        cursor.execute(sql, (condition_id, card_id))

    return card_condition_name


def upload_to_opensearch(**kwargs):
    http = urllib3.PoolManager()
    headers = urllib3.make_headers(basic_auth=f"{os_username}:{os_pw}")
    headers['Content-Type'] = 'application/json'
    response = http.request('POST',
                    os_url + "/_doc",
                    body = json.dumps(kwargs, default=str),
                    headers = headers,
                    retries = False)
    
    x = json.loads(response.data)
    return x

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
            keywords += ' trading card'
        
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
        return None

def rds_insert_ebay(conn, data):
    '''
    Insert data into RDS 
    '''
    with conn.cursor() as cursor:
        sql = '''
            INSERT INTO `ebay_price_data` 
                (`card_id`, `timestamp`, `mean_price`, `max_price`, `min_price`, `count`) 
            VALUES (%s, %s, %s, %s, %s, %s)
        '''
        # insert in batches - list of tuples
        cursor.execute(sql, (data['card_id'], data['timestamp'], data['mean_price'], data['max_price'], data['min_price'], data['count']))
        insert_id = conn.insert_id()
        print("Successfully inserted:", insert_id)
        return insert_id

def get_s3_metadata(photo, bucket):
    response = s3.head_object(Bucket=bucket, Key=photo)
    return response