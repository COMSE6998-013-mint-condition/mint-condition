import json
import urllib.parse
import boto3
import pymysql

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
    
    condition = invoke_sagemaker(bucket, key)

    #TODO make sure condition is a float value
    upload_to_rds(user_id, bucket, key, condition, user_id)
    upload_to_opensearch(bucket, key, condition)


def get_s3_metadata(photo, bucket):
    response = s3.head_object(Bucket=bucket, Key=photo)
    return response


# TODO
def invoke_sagemaker(bucket, key):
    return ""


def upload_to_rds(user_id, bucket, key, condition):

    s3_data = get_s3_metadata(key, bucket)
    label = s3_data['ResponseMetadata']['HTTPHeaders']['x-amz-meta-customlabels'] if 'x-amz-meta-customlabels' in s3_data['ResponseMetadata']['HTTPHeaders'] else ""
    time_created = s3_data['LastModified']

    condition_id = None

    with rdsConn:

        #TODO implement failure handling - what if nothing is retrieved
        with rdsConn.cursor() as cursor:
            sql = "SELECT `condition_id` FROM `card_conditions` WHERE `card_condition_rating` = %s"
            cursor.execute(sql, (str(condition),))
            result = cursor.fetchone()
            condition_id = result.condition_id

        with rdsConn.cursor() as cursor:
            sql = "INSERT INTO `cards` (`card_label`, `card_img_path`, `card_condition_id`, `user_id`, `time_created`) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql, (label, "s3://" + bucket + "/" + key, str(condition_id), str(user_id), str(time_created)))

        rdsConn.commit()

    print(label)
    print(user_id)
    print(time_created)


# TODO
def upload_to_opensearch(bucket, key, user, condition):
    return
