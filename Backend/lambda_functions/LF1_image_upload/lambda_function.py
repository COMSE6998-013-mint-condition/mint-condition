import json
import urllib.parse
import boto3
import pymysql

import time
from time import mktime
from datetime import datetime

s3=boto3.client('s3')

rdsConn = pymysql.connect(host='trading-cards.c49euq66g8jj.us-east-1.rds.amazonaws.com',
                             user='admin',
                             password='c3iTGk4gKXp4JRH',
                             database='mint_condition',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)

def lambda_handler(event, context):

    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    user_id = event['requestContext']['authorizer']['claims']['cognito:username']
    
    card_id = rds_insert(user_id, bucket, key)

    #TODO make sure condition is a float value
    condition = invoke_sagemaker(bucket, key) 

    rds_update_condition(card_id, condition)
    upload_to_opensearch(bucket, key, condition, card_id)


def get_s3_metadata(photo, bucket):
    response = s3.head_object(Bucket=bucket, Key=photo)
    return response


# TODO
def invoke_sagemaker(bucket, key):
    return ""

def rds_insert(user_id, bucket, key):

    card_id = None
    
    s3_data = get_s3_metadata(key, bucket)
    label = s3_data['ResponseMetadata']['HTTPHeaders']['x-amz-meta-customlabels'] if 'x-amz-meta-customlabels' in s3_data['ResponseMetadata']['HTTPHeaders'] else ""
    time_created = time.strptime(s3_data['LastModified'], '%Y-%m-%dT%H:%M:%S.%fZ') #convert to a time.struct_time object -> will store as a unix timestamp

    with rdsConn:

        with rdsConn.cursor() as cursor:
            sql = "INSERT INTO `cards` (`card_label`, `card_bucket`, `card_s3_key`, `user_id`, `time_created`) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql, (label, bucket, key, str(user_id), time.mktime(time_created)))

        rdsConn.commit()

    print(label)
    print(user_id)
    print(time_created)

    return rdsConn.insert_id()

def rds_update_condition(card_id, condition):

    with rdsConn:

        condition_id = None

        #TODO implement failure handling - what if nothing is retrieved
        with rdsConn.cursor() as cursor:
            sql = "SELECT `condition_id` FROM `card_conditions` WHERE `card_condition_rating` = %s"
            cursor.execute(sql, (condition,))
            result = cursor.fetchone()
            condition_id = result.condition_id

        with rdsConn.cursor() as cursor:
            sql = "UPDATE `cards` SET `condition_id` = %s WHERE `card_id` = %s"
            cursor.execute(sql, (condition_id, card_id))

        rdsConn.commit()

# TODO
def upload_to_opensearch(bucket, key, user, condition, card_id):
    return
