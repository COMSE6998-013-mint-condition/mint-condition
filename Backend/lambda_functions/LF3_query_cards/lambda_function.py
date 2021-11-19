import json

def lambda_handler(event, context):
    path =  event["path"]
    user = event['headers']['x-amz-meta-user']
    httpMethod = event['httpMethod']
    if path == "/cards":
        if httpMethod == "GET":
            #TODO implement getting all cards for user
            return dummy_response()
        else:
            return raise_method_not_allowed()

    elif path == "/card":
        if httpMethod == "POST":
            #TODO update card for specific user
            return dummy_response()
        else:
            return raise_method_not_allowed()

    elif path.contains("/card/"):
        if httpMethod == "GET":
            #TODO get card for specified id (/card/{id}). Check if user has access to specified ID
            return dummy_response()
        elif httpMethod == "DELETE":
            #TODO delete card for user based on ID. Check if user has access to specified ID
            return dummy_response()
        else:
            return raise_method_not_allowed()

    elif path == "/search":
        if httpMethod == "GET":
            #TODO Search OpenSearch
            return dummy_response()
        else:
            return raise_method_not_allowed()

    else:
        return raise_method_not_allowed


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