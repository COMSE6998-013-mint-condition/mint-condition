import json

#deprecated - no need to implement
#repurpose to historical price data checker
#responds to cloudwatch trigger or cron
#go through all card database and for each card do a query on ebay

#todo notify via email user if price has changed with some threshold

def lambda_handler(event, context):
    



     return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept,x-amz-meta-customLabels',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,PUT,GET'
        }
    }
