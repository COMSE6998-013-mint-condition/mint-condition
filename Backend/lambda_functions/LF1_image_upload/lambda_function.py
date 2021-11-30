import json
import urllib.parse
import boto3

s3=boto3.client('s3')

def lambda_handler(event, context):

    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    user_id = event['requestContext']['authorizer']['claims']['\"cognito:username\"']
    
    condition = invoke_sagemaker(bucket, key)
    upload_to_rds(bucket, key, condition, user_id)
    upload_to_opensearch(bucket, key, condition)


def get_s3_metadata(photo, bucket):
    response = s3.head_object(Bucket=bucket, Key=photo)
    return response


# TODO
def invoke_sagemaker(bucket, key):
    return ""


def upload_to_rds(bucket, key, condition, user_id):
    s3_data = get_s3_metadata(key, bucket)
    label = s3_data['ResponseMetadata']['HTTPHeaders']['x-amz-meta-customlabels'] if 'x-amz-meta-customlabels' in s3_data['ResponseMetadata']['HTTPHeaders'] else ""
    time_created = s3_data['LastModified']
    print(label)
    print(user_id)
    print(time_created)


# TODO
def upload_to_opensearch(bucket, key, user, condition):
    return
