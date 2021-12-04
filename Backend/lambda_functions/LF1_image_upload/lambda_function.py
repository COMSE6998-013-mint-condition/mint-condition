import json
import urllib3
import urllib.parse
import boto3
import pymysql
import os

import time
from time import mktime
from datetime import datetime

region = 'us-east-1'
s3=boto3.client('s3')

os_host = os.environ['os_url']
os_username = os.environ['os_username']
os_pw = os.environ["os_pw"]
os_index = 'cards'
os_url = os_host + os_index

def lambda_handler(event, context):
    
    rdsConn = pymysql.connect(host=f'trading-cards.c49euq66g8jj.{region}.rds.amazonaws.com',
                             user='admin',
                             password='c3iTGk4gKXp4JRH',
                             database='mint_condition',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)
    
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    s3_data = get_s3_metadata(key, bucket)
    label = s3_data['ResponseMetadata']['HTTPHeaders']['x-amz-meta-customlabels'] if 'x-amz-meta-customlabels' in s3_data['ResponseMetadata']['HTTPHeaders'] else ""
    time_created = s3_data['LastModified'].strftime("%Y-%m-%dT%H:%M:%S.%fZ") #convert to a time.struct_time object -> will store as a unix timestamp
    # user_id = s3_data['ResponseMetadata']['HTTPHeaders']['x-amz-meta-user']
    user_id = "google_101390119411965147253"
    
    card_id = rds_insert(rdsConn, user_id, label, time_created, bucket, key)

    #TODO make sure condition is a float value
    condition = invoke_sagemaker(bucket, key) 

    rds_update_condition(rdsConn, card_id, condition)

    split_labels = label.strip().split(",")
    upload_to_opensearch(card_id=card_id, user_id=user_id, created_timestmap=time_created, labels=split_labels)
    
    rdsConn.close()
    
    return


# TODO
def invoke_sagemaker(bucket, key):
    return 2.0


def rds_insert(conn, user_id, label, time_created, bucket, key):

    # with rdsConn:

    with conn.cursor() as cursor:
        sql = "INSERT INTO `cards` (`card_label`, `card_bucket`, `card_s3_key`, `user_id`, `time_created`) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(sql, (label, bucket, key, str(user_id), time.mktime(time.strptime(time_created, "%Y-%m-%dT%H:%M:%S.%fZ"))))

    conn.commit()


    return conn.insert_id()


def rds_update_condition(conn, card_id, condition):

    # with rdsConn:

    condition_id = None

    #TODO implement failure handling - what if nothing is retrieved
    with conn.cursor() as cursor:
        sql = "SELECT `card_condition_id` FROM `card_conditions` WHERE `card_condition_rating` = %s"
        cursor.execute(sql, (condition,))
        result = cursor.fetchone()
        condition_id = result['card_condition_id']
        
        
    with conn.cursor() as cursor:
        sql = "UPDATE `cards` SET `card_condition_id` = %s WHERE `card_id` = %s"
        cursor.execute(sql, (condition_id, card_id))

    conn.commit()


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


def get_s3_metadata(photo, bucket):
    response = s3.head_object(Bucket=bucket, Key=photo)
    return response