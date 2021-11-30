import json
import pymysql

'''
Refer to https://stackoverflow.com/questions/49715482/how-to-access-the-url-that-invoked-my-lambda-function for event schema
'''

rdsConn = pymysql.connect(host='trading-cards.c49euq66g8jj.us-east-1.rds.amazonaws.com',
                             user='admin',
                             password='c3iTGk4gKXp4JRH',
                             database='mint_condition',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)

def lambda_handler(event, context):
    print(event)
    path =  event["path"]
    user_id = event['headers']['x-amz-meta-user']
    user_name = "STUB" #TODO get username from incognito
    httpMethod = event['httpMethod']

    #TODO: price range, pagination, date range
    if path == "/cards":
        if httpMethod == "GET":
            
             with rdsConn:
                with rdsConn.cursor() as cursor:
                    sql = """SELECT `card_condition_name` as `condition_label`, `card_condition_descr` as `condition_desc`, 
                    %s as `owner_name`, `cards`.`card_id`, `card_img_path` as `url`, `card_value` as `value`
                    FROM `cards`
                    LEFT JOIN `card_conditions` ON `cards`.`card_condition_id` = `card_conditions`.`card_condition_id`
                    LEFT JOIN `users` ON `cards.`user_id` = `users`.`user_id`
                    WHERE `cards`.`user_id` = %s"""
                    cursor.execute(sql, (user_name, str(user_id),))
                    cards = { "cards" : [] } if cursor.rowcount == 0 else { "cards": cursor.fetchall() }
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

            with rdsConn:

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

                rdsConn.commit()

                #TODO update opensearch too

                with rdsConn.cursor() as cursor:
                    
                    sql = """SELECT `card_condition_name` as `condition_label`, `card_condition_descr` as `condition_desc`, 
                    %s as `owner_name`, `cards`.`card_id`, `card_img_path` as `url`, `card_value` as `value`
                    FROM `cards`
                    LEFT JOIN `card_conditions` ON `cards`.`card_condition_id` = `card_conditions`.`card_condition_id`
                    WHERE `cards`.`user_id` = %s
                        AND `cards`.`card_id` = %s"""
                    cursor.execute(sql, (user_name, str(user_id), str(card_id),))

                    #bad implementation: theoretically could have been deleted between this and first part (cut corners)
                    return real_response(cursor.fetchone())


                return real_response(card)

        else:
            return raise_method_not_allowed()

    elif path.contains("/card/"):
        if httpMethod == "GET":

            if not hasattr(event['pathParameters'], 'id'):
                return unexpected_error("id not provided")

            card_id = event['pathParameters']['id']

            with rdsConn:
                with rdsConn.cursor() as cursor:
                    sql = """SELECT `card_condition_name` as `condition_label`, `card_condition_descr` as `condition_desc`, 
                    %s as `owner_name`, `cards`.`card_id`, `card_img_path` as `url`, `card_value` as `value`
                    FROM `cards`
                    LEFT JOIN `card_conditions` ON `cards`.`card_condition_id` = `card_conditions`.`card_condition_id`
                    WHERE `cards`.`user_id` = %s
                        AND `cards`.`card_id` = %s"""
                    cursor.execute(sql, (user_name, str(user_id), str(card_id),))
                    card = {} if cursor.rowcount == 0 else cursor.fetchone()
                    return real_response(card)

        elif httpMethod == "DELETE":

            if not hasattr(event['pathParameters'], 'id'):
                return unexpected_error("id not provided")

            card_id = event['pathParameters']['id']

            card = {}

            with rdsConn:

                with rdsConn.cursor() as cursor:
                    sql = """SELECT `card_condition_name` as `condition_label`, `card_condition_descr` as `condition_desc`, 
                    %s as `owner_name`, `cards`.`card_id`, `card_img_path` as `url`, `card_value` as `value`
                    FROM `cards`
                    LEFT JOIN `card_conditions` ON `cards`.`card_condition_id` = `card_conditions`.`card_condition_id`
                    WHERE `cards`.`user_id` = %s
                        AND `cards`.`card_id` = %s"""
                    cursor.execute(sql, (user_name, str(user_id), str(card_id),))
                    if cursor.rowcount == 0:
                        return unexpected_error("card not found for user")
                    
                    card = cursor.fetchone()

                with rdsConn.cursor() as cursor:
                    sql = "DELETE FROM `cards` WHERE `card_id` = %s"
                    cursor.execute(sql, (str(card_id),))

                rdsConn.commit()

                #TODO delete from opensearch too

                return real_response(card)
        else:
            return raise_method_not_allowed()

    elif path.contains("/search"):
        if httpMethod == "GET":
            #TODO Search OpenSearch
            return dummy_response()
        else:
            return raise_method_not_allowed()

    elif path.contains("/user/"):
        if not hasattr(event['pathParameters'], 'id'):
                return unexpected_error("id not provided")

        card_id = event['pathParameters']['id']

        user_obj = {
            "user_id": event["requestContext"]["authorizer"]["claims"]["\"cognito:username\""],
            "email": event["requestContext"]["authorizer"]["claims"]["email"],
            "phone": event["requestContext"]["authorizer"]["claims"]["phone_number"],
            "name": event["requestContext"]["authorizer"]["claims"]["name"]
        }

        return real_response(user_obj)

    else:
        return raise_method_not_allowed



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