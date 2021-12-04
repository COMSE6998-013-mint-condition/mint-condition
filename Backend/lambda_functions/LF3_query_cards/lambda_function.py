import json
import pymysql
import boto3
import urllib3
import os

s3=boto3.client('s3')

'''
Refer to https://stackoverflow.com/questions/49715482/how-to-access-the-url-that-invoked-my-lambda-function for event schema
'''

region = 'us-east-1'

os_host = os.environ['os_url']
os_username = os.environ['os_username']
os_pw = os.environ["os_pw"]
os_index = 'cards/_doc'
os_url = os_host + os_index


def lambda_handler(event, context):

    rdsConn = pymysql.connect(host=os.environ['DB_HOST'],
                              user=os.environ['DB_USER'],
                              password=os.environ['DB_PASSWORD'],
                              database=os.environ['DB_DATABASE'],
                              charset='utf8mb4',
                              cursorclass=pymysql.cursors.DictCursor,
                              autocommit=True)

    path =  event["path"]
    user_id = event['requestContext']['authorizer']['claims']['cognito:username']
    httpMethod = event['httpMethod']

    if path == "/cards":
        if httpMethod == "GET":
            with rdsConn.cursor() as cursor:
                sql = """SELECT `card_condition_name` as `condition_label`, `card_condition_descr` as `condition_desc`, 
                user_id as `owner_name`, `cards`.`card_id`, `card_bucket`, `card_s3_key`, `card_value` as `value`
                FROM `cards`
                LEFT JOIN `card_conditions` ON `cards`.`card_condition_id` = `card_conditions`.`card_condition_id`
                WHERE `cards`.`user_id` = %s"""
                cursor.execute(sql, (str(user_id),))
                cards = { "cards" : [] } if cursor.rowcount == 0 else { "cards": process_cards_obj(cursor.fetchall()) }
                return real_response(cards)
        else:
            return raise_method_not_allowed()
    
    elif path == "/card":
        if httpMethod == "POST": #assuming comma separated vals

            if not hasattr(event['pathParameters'], 'id'):
                return unexpected_error("id not provided")

            if not hasattr(event['body'], 'labels'):
                return unexpected_error("labels not provided")

            card_id = event['pathParameters']['id']
            labels = ",".join(event['body']['labels'])

            with rdsConn.cursor() as cursor:
                sql = """SELECT `card_id` 
                FROM `cards`
                WHERE `cards`.`user_id` = %s
                    AND `cards`.`card_id` = %s"""
                cursor.execute(sql, (str(user_id), str(card_id),))
                if cursor.rowcount == 0:
                    return unexpected_error("card not found for user")
                
                card = cursor.fetchone()

                sql = "UPDATE `cards` SET `card_label` = %s WHERE `card_id` = %s"
                cursor.execute(sql, (labels, str(card_id),))

            #TODO update opensearch too

            with rdsConn.cursor() as cursor:
                
                sql = """SELECT `card_condition_name` as `condition_label`, `card_condition_descr` as `condition_desc`, 
                user_id as `owner_name`, `cards`.`card_id`, `card_bucket`, `card_s3_key`, `card_value` as `value`
                FROM `cards`
                LEFT JOIN `card_conditions` ON `cards`.`card_condition_id` = `card_conditions`.`card_condition_id`
                WHERE `cards`.`user_id` = %s
                    AND `cards`.`card_id` = %s"""
                
                cursor.execute(sql, (str(user_id), str(card_id),))

                #bad implementation: theoretically could have been deleted between this and first part (cut corners)
                return real_response(process_card_obj(cursor.fetchone()))

        else:
            return raise_method_not_allowed()

    elif "/card/" in path:
        if httpMethod == "GET":

            if not hasattr(event['pathParameters'], 'id'):
                return unexpected_error("id not provided")

            card_id = event['pathParameters']['id']

            with rdsConn.cursor() as cursor:
                sql = """SELECT `card_condition_name` as `condition_label`, `card_condition_descr` as `condition_desc`, 
                user_id as `owner_name`, `cards`.`card_id`, `card_bucket`, `card_s3_key`, `card_value` as `value`
                FROM `cards`
                LEFT JOIN `card_conditions` ON `cards`.`card_condition_id` = `card_conditions`.`card_condition_id`
                WHERE `cards`.`user_id` = %s
                    AND `cards`.`card_id` = %s"""
                cursor.execute(sql, (str(user_id), str(card_id),))
                card = {} if cursor.rowcount == 0 else cursor.fetchone()
                return real_response(process_card_obj(card))

        elif httpMethod == "DELETE":

            if not hasattr(event['pathParameters'], 'id'):
                return unexpected_error("id not provided")

            card_id = event['pathParameters']['id']

            card = {}

            with rdsConn.cursor() as cursor:
                sql = """SELECT `card_condition_name` as `condition_label`, `card_condition_descr` as `condition_desc`, 
                user_id as `owner_name`, `cards`.`card_id`, `card_bucket`, `card_s3_key`, `card_value` as `value`
                FROM `cards`
                LEFT JOIN `card_conditions` ON `cards`.`card_condition_id` = `card_conditions`.`card_condition_id`
                WHERE `cards`.`user_id` = %s
                    AND `cards`.`card_id` = %s"""
                cursor.execute(sql, (str(user_id), str(card_id),))
                if cursor.rowcount == 0:
                    return unexpected_error("card not found for user")
                
                card = process_card_obj(cursor.fetchone())

            try:
                with rdsConn.cursor() as cursor:
                    sql = "DELETE FROM `cards` WHERE `card_id` = %s"
                    cursor.execute(sql, (str(card_id),))
                
            except:
                return unexpected_error("deletion failed")


            #TODO delete from opensearch too

            return real_response(card)

        else:
            return raise_method_not_allowed()

    #TODO: price range, pagination, date range
    #TODO: available query params for now: condition, label
    elif "search" in path:
        results = []
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
                        "match": {
                            "labels": event["queryStringParameters"]["label"]
                        }
                    }
                )
            if "condition" in event["queryStringParameters"]:
                os_payload["query"]["bool"]["must"].append(
                    {
                        "match": {
                            "condition": event["queryStringParameters"]["condition"]
                        }
                    }
                )
            results = search_opensearch(os_payload)

            sql = """SELECT `card_condition_name` as `condition_label`, `card_condition_descr` as `condition_desc`, 
                    user_id as `owner_name`, `cards`.`card_id`, `card_bucket`, `card_s3_key`, `card_value` as `value`
                    FROM `cards`
                    LEFT JOIN `card_conditions` ON `cards`.`card_condition_id` = `card_conditions`.`card_condition_id`
                    WHERE `cards`.`card_id` = %s"""

            execution_params = []

            if results:
                for i, os_card in enumerate(results):
                    execution_params.append(os_card['card_id'])
                    if i != 0:
                        sql += """OR `cards`.`card_id` = %s"""
                
                with rdsConn.cursor() as cursor:
                    cursor.execute(sql, tuple(execution_params))
                all_cards = cursor.fetchall()
                ret_cards = []
                for card in all_cards:
                    ret_cards.append(process_card_obj(card))

        else:
            return raise_method_not_allowed()

        return real_response(ret_cards)

        # TODO check database for bucket, key, and return a signed url with the image

    elif "/user/" in path:
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


#add s3 url
def process_card_obj(card):

    if card == {} or not hasattr(card, 'card_bucket') or not hasattr(card, 'card_s3_key'):
        return card

    card['url'] = s3.generate_presigned_url(
        ClientMethod='get_object',
        Params={
            'Bucket': card['card_bucket'],
            'Key': card['card_s3_key']
        },
        ExpiresIn=1800
    )

    delattr(card, 'card_bucket')
    delattr(card, 'card_s3_key')

    return card


def search_opensearch(os_payload):
    http = urllib3.PoolManager()
    headers = urllib3.make_headers(basic_auth=f"{os_username}:{os_pw}")
    headers['Content-Type'] = 'application/json'
    response = http.request('GET',
                    os_url + "/_search",
                    body = json.dumps(os_payload),
                    headers = headers,
                    retries = False)
    x = json.loads(response.data)
    
    return [obj['_source'] for obj in x['hits']['hits'] if '_source' in obj.keys()]


def unexpected_error(error):
    return {
        'statusCode': 500,
        'body': error
    }    


def raise_method_not_allowed():
    return {
        'statusCode': 405,
        'body': "Method not allowed"
    }


def dummy_response():
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept,x-amz-meta-customLabels',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,PUT,GET'
        },
        'body': "Hi there"
    }


#assume dict result format
def real_response(result):
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept,x-amz-meta-customLabels',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,PUT,GET'
        },
        'body': json.dumps(result)
    }