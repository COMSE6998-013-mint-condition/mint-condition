from ebaysdk.finding import Connection
from ebaysdk.exception import ConnectionError

import os
import datetime

def search_ebay(num_pages):
    try:
        api = Connection(
            domain='svcs.sandbox.ebay.com',
            appid=os.environ.get('EBAY_API_APP_ID'), 
            config_file=None)
        
        for page_num in range(0, num_pages):
            params = {
             "keywords" : "Pikachu",
             "paginationInput" :
                    {
                        "entriesPerPage" : 1, # max 100.
                        "pageNumber" : page_num+1
                    }
             }
            response = api.execute("findItemsAdvanced", params)
            print(response.json())

    except ConnectionError as e:
        print(e)
        print(e.response.dict())

def lambda_handler(event, context):
    # TODO implement
     return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept,x-amz-meta-customLabels',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,PUT,GET'
        }
    }
