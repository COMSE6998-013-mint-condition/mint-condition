import json
import pymysql
import boto3
import urllib3
import os

s3 = boto3.client('s3')

'''
Refer to https://stackoverflow.com/questions/49715482/how-to-access-the-url-that-invoked-my-lambda-function for event schema
'''

region = 'us-east-1'

os_host = os.environ['os_url']
os_username = os.environ['os_username']
os_pw = os.environ["os_pw"]
os_index = 'cards'
os_url = os_host + os_index


def lambda_handler(event, context):
    pathUrl = "http://dcmt4a9xlixn7.cloudfront.net/"

    rdsConn = pymysql.connect(host=os.environ['DB_HOST'],
                              user=os.environ['DB_USER'],
                              password=os.environ['DB_PASSWORD'],
                              database=os.environ['DB_DATABASE'],
                              charset='utf8mb4',
                              cursorclass=pymysql.cursors.DictCursor,
                              autocommit=True)

    path = event["path"]
    user_id = event['requestContext']['authorizer']['claims']['cognito:username']
    httpMethod = event['httpMethod']

    if path == "/cards":
        if httpMethod == "GET":
            with rdsConn.cursor() as cursor:

                sql = """SELECT card_condition_name as condition_label, card_condition_descr as condition_desc, 
                user_id as owner_name, c.card_id, CONCAT(%s, card_s3_key) as path, card_label as label,
                max_price as max_value, min_price as min_value, `count`, mean_price as mean_value, timestamp
                FROM cards c
                LEFT JOIN card_conditions ON c.card_condition_id = card_conditions.card_condition_id
                LEFT JOIN ebay_price_data eb ON eb.ebay_price_data_id = (
                    SELECT MAX(ebay_price_data_id) FROM ebay_price_data WHERE card_id = c.card_id
                )
                WHERE c.user_id = %s"""
                cursor.execute(sql, (pathUrl, str(user_id),))
                cards = {"cards": []} if cursor.rowcount == 0 else {"cards": process_cards_obj(cursor.fetchall())}
                return real_response(cards)
        else:
            return raise_method_not_allowed()

    elif path == "/card":
        if httpMethod == "POST":  # assuming comma separated vals

            if 'id' not in json.loads(event['body']):
                return unexpected_error("id not provided")

            if 'label' not in json.loads(event['body']):
                return unexpected_error("label not provided")

            card_id = json.loads(event['body'])['id']
            labels = json.loads(event['body'])['label']
            oldLabels = None

            with rdsConn.cursor() as cursor:
                sql = """SELECT card_id, card_label
                FROM cards
                WHERE cards.user_id = %s
                    AND cards.card_id = %s"""
                cursor.execute(sql, (str(user_id), str(card_id),))
                if cursor.rowcount == 0:
                    return unexpected_error("card not found for user")

                card = cursor.fetchone()
                oldLabels = card['card_label']

                sql = "UPDATE cards SET card_label = %s WHERE card_id = %s"
                cursor.execute(sql, (labels, str(card_id),))

            if update_card_labels_os(user_id, card_id, labels) == 0:
                with rdsConn.cursor() as cursor:
                    sql = "UPDATE cards SET card_label = %s WHERE card_id = %s"
                    cursor.execute(sql, (oldLabels, str(card_id),))

                unexpected_error('unable to update opensearch')

            # TODO(Taku): update card value based on new labels in database

            with rdsConn.cursor() as cursor:

                sql = """SELECT card_condition_name as condition_label, card_condition_descr as condition_desc, 
                user_id as owner_name, c.card_id, CONCAT(%s, card_s3_key) as path, card_label as label,
                max_price as max_value, min_price as min_value, `count`, mean_price as mean_value, timestamp
                FROM cards c
                LEFT JOIN card_conditions ON c.card_condition_id = card_conditions.card_condition_id
                LEFT JOIN ebay_price_data eb ON eb.ebay_price_data_id = (
                    SELECT MAX(ebay_price_data_id) FROM ebay_price_data WHERE card_id = c.card_id
                )
                WHERE c.user_id = %s
                    AND c.card_id = %s"""

                cursor.execute(sql, (pathUrl, str(user_id), str(card_id),))

                # bad implementation: theoretically could have been deleted between this and first part (cut corners)
                return real_response(process_card_obj(cursor.fetchone()))

        else:
            return raise_method_not_allowed()

    elif "/card/" in path:

        if '/prices' in path:
            if httpMethod == "GET":

                if not 'id' in event['pathParameters']:
                    return unexpected_error("id not provided")

                card_id = event['pathParameters']['id']

                with rdsConn.cursor() as cursor:
                    sql = """SELECT card_id, card_label
                    FROM cards
                    WHERE cards.user_id = %s
                        AND cards.card_id = %s"""

                    cursor.execute(sql, (str(user_id), str(card_id),))
                    if cursor.rowcount == 0:
                        return unexpected_error("card not found for user")

                    sql = """ SELECT max_price as max_value, min_price as min_value, count, mean_price as mean_value, timestamp
                        FROM ebay_price_data
                        WHERE card_id = %s"""
                    cursor.execute(sql, (str(card_id),))

                    prices = { "prices" : [] } if cursor.rowcount == 0 else { "prices": cursor.fetchall() }

                    return real_response(prices)

        elif '/analyze' in path:
            if httpMethod == "POST":

                if not 'id' in event['pathParameters']:
                    return unexpected_error("id not provided")

                card_id = event['pathParameters']['id']

                with rdsConn.cursor() as cursor:
                    pass
                    # TODO (Gursifath): Implement reanalyzing the card in Sagemaker and return the updated card object
                    # Using card id, check the DB and download your image with s3
                    # Invoke sagemaker
                    # Update DB with new condition
                    # Get the new card from the DB and return the card

                return unexpected_error('not implemented')

        if httpMethod == "GET":

            if not 'id' in event['pathParameters']:
                return unexpected_error("id not provided")

            card_id = event['pathParameters']['id']

            with rdsConn.cursor() as cursor:

                sql = """SELECT card_condition_name as condition_label, card_condition_descr as condition_desc, 
                user_id as owner_name, c.card_id, CONCAT(%s, card_s3_key) as path, card_label as label,
                max_price as max_value, min_price as min_value, `count`, mean_price as mean_value, timestamp
                FROM cards c
                LEFT JOIN card_conditions ON c.card_condition_id = card_conditions.card_condition_id
                LEFT JOIN ebay_price_data eb ON eb.ebay_price_data_id = (
                    SELECT MAX(ebay_price_data_id) FROM ebay_price_data WHERE card_id = c.card_id
                )
                WHERE c.user_id = %s
                    AND c.card_id = %s"""

                cursor.execute(sql, (pathUrl, str(user_id), str(card_id),))
                if cursor.rowcount == 0:
                    return unexpected_error("card not found for user")

                card = process_card_obj(cursor.fetchone())

            return real_response(card)

        elif httpMethod == "DELETE":

            if not 'id' in event['pathParameters']:
                return unexpected_error("id not provided")

            card_id = event['pathParameters']['id']

            card = {}
            cardBackupData = {}  # in case we need to revert

            with rdsConn.cursor() as cursor:
                sql = """SELECT card_condition_name as condition_label, card_condition_descr as condition_desc, 
                user_id as owner_name, c.card_id, CONCAT(%s, card_s3_key) as path, card_label as label,
                max_price as max_value, min_price as min_value, `count`, mean_price as mean_value, timestamp
                FROM cards c
                LEFT JOIN card_conditions ON c.card_condition_id = card_conditions.card_condition_id
                LEFT JOIN ebay_price_data eb ON eb.ebay_price_data_id = (
                    SELECT MAX(ebay_price_data_id) FROM ebay_price_data WHERE card_id = c.card_id
                )
                WHERE c.user_id = %s
                    AND c.card_id = %s"""

                cursor.execute(sql, (pathUrl, str(user_id), str(card_id),))

                if cursor.rowcount == 0:
                    return unexpected_error("card not found for user")

                card = process_card_obj(cursor.fetchone())

                sql = """ SELECT * FROM cards WHERE card_id = %s"""
                cursor.execute(sql, (str(card_id),))
                cardBackupData = cursor.fetchone()

            try:
                with rdsConn.cursor() as cursor:
                    sql = "DELETE FROM cards WHERE card_id = %s"
                    cursor.execute(sql, (str(card_id),))

            except:
                return unexpected_error("deletion failed")

            if delete_card_os(user_id, card_id) == 0:
                # undelete card
                with rdsConn.cursor() as cursor:
                    sql = """ INSERT INTO cards (card_id, card_label, card_condition_id, user_id, time_created, card_bucket, card_s3_key, max_notification_threshold, min_notification_threshold)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                    cursor.execute(sql, (
                    card_id, str(cardBackupData['card_label']), cardBackupData['card_condition_id'],
                    str(cardBackupData['user_id']), cardBackupData['time_created'], str(cardBackupData['card_bucket']),
                    str(cardBackupData['card_s3_key']), cardBackupData['max_notification_threshold'],
                    cardBackupData['min_notification_threshold']))

                return unexpected_error("could not delete from opensearch")

            return real_response(card)

        else:
            return raise_method_not_allowed()

    elif "search" in path:
        results = []
        cards = []
        if httpMethod == "GET":
            os_payload = {
                "size": 10000,
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "user_id": user_id
                                }
                            }
                        ]
                    }
                }
            }
            if "label" in event["queryStringParameters"]:
                os_payload["query"]["bool"]["must"].append(
                    {
                        "match_phrase_prefix": {
                            "labels": event["queryStringParameters"]["label"]
                        }
                    }
                )
            if "condition" in event["queryStringParameters"]:
                os_payload["query"]["bool"]["must"].append(
                    {
                        "match_phrase_prefix": {
                            "condition": event["queryStringParameters"]["condition"]
                        }
                    }
                )
            results = search_opensearch(os_payload)

            sql = f"""SELECT card_condition_name as condition_label, card_condition_descr as condition_desc, 
                user_id as owner_name, c.card_id, CONCAT('{pathUrl}', card_s3_key) as path, card_label as label,
                max_price as max_value, min_price as min_value, `count`, mean_price as mean_value, timestamp
                FROM cards c
                LEFT JOIN card_conditions ON c.card_condition_id = card_conditions.card_condition_id
                LEFT JOIN ebay_price_data eb ON eb.ebay_price_data_id = (
                    SELECT MAX(ebay_price_data_id) FROM ebay_price_data WHERE card_id = c.card_id
                )
                WHERE c.card_id IN (%s)"""

            if results:
                list_of_ids = [os_object['card_id'] for os_object in results]
                format_strings = ','.join(['%s'] * len(list_of_ids))
                with rdsConn.cursor() as cursor:
                    cursor.execute(sql % format_strings,
                                   tuple(list_of_ids))
                    cards = {"cards": []} if cursor.rowcount == 0 else {"cards": process_cards_obj(cursor.fetchall())}

        else:
            return raise_method_not_allowed()

        return real_response(cards)

    elif "/user" in path:
        user_obj = {
            "user_id": event["requestContext"]["authorizer"]["claims"]["cognito:username"],
            "email": event["requestContext"]["authorizer"]["claims"]["email"],
        }

        return real_response(user_obj)

    else:
        return raise_method_not_allowed()


def process_cards_obj(cards):
    if cards == [] or cards == {}:
        return cards

    processedCards = []

    for card in cards:
        processedCards.append(process_card_obj(card))

    return processedCards


def process_card_obj(card):
    if not card:
        return {}

    priceObj = {
        "max_value": card['max_value'],
        "min_value": card['min_value'],
        "count": card['count'],
        "mean_value": card['mean_value'],
        "timestamp": card['timestamp']
    }

    card['price_object'] = priceObj

    del card['max_value']
    del card['min_value']
    del card['mean_value']
    del card['count']
    del card['timestamp']

    return card


def search_opensearch(os_payload):
    http = urllib3.PoolManager()
    headers = urllib3.make_headers(basic_auth=f"{os_username}:{os_pw}")
    headers['Content-Type'] = 'application/json'
    response = http.request('GET',
                            os_url + "/_search",
                            body=json.dumps(os_payload),
                            headers=headers,
                            retries=False)
    x = json.loads(response.data)

    return [obj['_source'] for obj in x['hits']['hits'] if '_source' in obj.keys()]


def update_card_labels_os(user_id, card_id, labels):
    # Put the user query into the query DSL for more accurate search results.
    query = {
        "query": {
            "bool": {
                "must": [
                    {
                        "match": {
                            "user_id": user_id
                        }
                    },
                    {
                        "match": {
                            "card_id": card_id
                        }
                    }
                ]
            }
        },
        "script": {
            "source": "ctx._source.labels = params.labels",
            "lang": "painless",
            "params": {
                "labels": [label.strip() for label in labels.split(',')]
            }
        }
    }

    # Elasticsearch 6.x requires an explicit Content-Type header
    http = urllib3.PoolManager()
    headers = urllib3.make_headers(basic_auth=f"{os_username}:{os_pw}")
    headers['Content-Type'] = 'application/json'

    # Make the signed HTTP request
    response = http.request('POST',
                            os_url + "/_update_by_query",
                            body=json.dumps(query),
                            headers=headers,
                            retries=False)
    x = json.loads(response.data)

    return x['updated']


def delete_card_os(user_id, card_id):
    # Put the user query into the query DSL for more accurate search results.
    query = {
        "query": {
            "bool": {
                "must": [
                    {
                        "match": {
                            "user_id": user_id
                        }
                    },
                    {
                        "match": {
                            "card_id": card_id
                        }
                    }
                ]
            }
        }
    }

    # Elasticsearch 6.x requires an explicit Content-Type header
    http = urllib3.PoolManager()
    headers = urllib3.make_headers(basic_auth=f"{os_username}:{os_pw}")
    headers['Content-Type'] = 'application/json'

    # Make the signed HTTP request
    response = http.request('POST',
                            os_url + "/_delete_by_query",
                            body=json.dumps(query),
                            headers=headers,
                            retries=False)
    x = json.loads(response.data)

    return x['deleted']


def unexpected_error(error):
    return {
        'statusCode': 500,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept,x-amz-meta-customLabels',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,PUT,GET,POST,DELETE'
        },
        'body': error
    }


def raise_method_not_allowed():
    return {
        'statusCode': 405,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept,x-amz-meta-customLabels',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,PUT,GET,POST,DELETE'
        },
        'body': "Method not allowed"
    }


# assume dict result format
def real_response(result):
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept,x-amz-meta-customLabels',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,PUT,GET,POST,DELETE'
        },
        'body': json.dumps(result, default=str)
    }