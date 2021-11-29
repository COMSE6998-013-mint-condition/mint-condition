const EventNotificationSDK = require('event-notification-nodejs-sdk');
const https = require('https');

// Reference: https://github.com/eBay/event-notification-nodejs-sdk/blob/main/lib/constants.js
const constants = {
    ALGORITHM: 'ssl3-sha1',
    AUTHORIZATION: 'Authorization',
    BASE64: 'base64',
    BEARER: 'bearer ',
    ENVIRONMENT: {
        SANDBOX: 'SANDBOX',
        PRODUCTION: 'PRODUCTION'
    },
    HEADERS: {
        APPLICATION_JSON: 'application/json'
    },
    HEX: 'hex',
    HTTP_STATUS_CODE: {
        NO_CONTENT: 204,
        OK: 200,
        PRECONDITION_FAILED: 412,
        INTERNAL_SERVER_ERROR: 500
    },
    KEY_END: '-----END PUBLIC KEY-----',
    KEY_PATTERN_END: /-----END PUBLIC KEY-----/,
    KEY_PATTERN_START: /-----BEGIN PUBLIC KEY-----/,
    KEY_START: '-----BEGIN PUBLIC KEY-----',
    NOTIFICATION_API_ENDPOINT_PRODUCTION: 'https://api.ebay.com/commerce/notification/v1/public_key/',
    NOTIFICATION_API_ENDPOINT_SANDBOX: 'https://api.sandbox.ebay.com/commerce/notification/v1/public_key/',
    SHA256: 'sha256',
    TOPICS: {
        MARKETPLACE_ACCOUNT_DELETION: 'MARKETPLACE_ACCOUNT_DELETION'
    },
    X_EBAY_SIGNATURE: 'x-ebay-signature'
};

// https://github.com/eBay/event-notification-nodejs-sdk/blob/main/examples/config.json
const config = {
    SANDBOX: {
        clientId: process.env['EBAY_SANDBOX_CLIENT_ID'],
        clientSecret: process.env['EBAY_SANDBOX_CLIENT_SECRET'],
        devid: process.env['EBAY_SANDBOX_DEV_ID'],
        redirectUri: process.env['EBAY_SANDBOX_REDIRECT_URI'],
        baseUrl: "api.sandbox.ebay.com"
    },
    PRODUCTION: {
        clientId: process.env['EBAY_PROD_CLIENT_ID'],
        clientSecret: process.env['EBAY_PROD_CLIENT_SECRET'],
        devid: process.env['EBAY_PROD_DEV_ID'],
        baseUrl: "api.ebay.com",
        redirectUri: process.env['EBAY_PROD_REDIRECT_URI'],
    },
    verificationToken: process.env['EBAY_VERIFICATION_TOKEN'],
    endpoint: process.env['EBAY_ENDPOINT'],
};

const environment = 'PRODUCTION';

exports.handler = async function (event, context, done) {

    let response;
    let slack_status;
    let slack_processResult;

    if (event && event.requestContext.http.method === 'GET' && event.queryStringParameters && event.queryStringParameters.challenge_code) {
        try {
            const challengeResponse = EventNotificationSDK.validateEndpoint(
                event.queryStringParameters.challenge_code,
                config);
            response = {
                statusCode: constants.HTTP_STATUS_CODE.OK,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({challengeResponse: challengeResponse})
            };
            slack_status = 'ok';
            slack_processResult = 'Endpoint validation ok, challengeResponse: '+challengeResponse;
            console.log("response: " + JSON.stringify(response));
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Endpoint validation failure: ${e}`);
            slack_status='failed';
            slack_processResult = `Endpoint validation failure: ${e}`;
            response = {
                statusCode: constants.HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify(`Endpoint validation failure: ${e}`)
            };
        }
    } else if (event && event.requestContext.http.method === 'POST') {

        let bodyParsed = JSON.parse(event.body);
        let responseCode = 0;

        try {
            responseCode = await EventNotificationSDK.process(
                bodyParsed,
                event.headers[constants.X_EBAY_SIGNATURE],
                config,
                environment
            );
        } catch(ex) {
            console.error(`Signature validation processing failure: ${ex}\n`);
            slack_status='failed';
            slack_processResult = `Signature validation processing failure: ${ex}`;
            response = {
                headers: {
                    "content-type": "application/json",
                },
                statusCode: constants.HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                body: JSON.stringify(`Signature validation processing failure: ${ex}`)

            };
        }

        if (responseCode === constants.HTTP_STATUS_CODE.NO_CONTENT) {
            console.log(`Message processed successfully for: \n- Topic: ${bodyParsed.metadata.topic} \n- NotificationId: ${bodyParsed.notification.notificationId}\n`);
            slack_status='ok';
            slack_processResult = `Message processed successfully`;
        } else if (responseCode === constants.HTTP_STATUS_CODE.PRECONDITION_FAILED) {
            console.error(`Signature mismatch for: \n- Payload: ${event.body} \n- Signature: ${event.headers[constants.X_EBAY_SIGNATURE]}\n`);
            slack_status='failed';
            slack_processResult = `Signature mismatch`;
        }
        response = {
            statusCode: responseCode
        };


    } else {
        response = {
            statusCode: constants.HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify('missing input data')
        };
        slack_status='failed';
        slack_processResult = `missing input data`;
    }
    console.log(response);
    return response;
    /*
    Uncomment to send notification to Slack

    return await notifySlack(event,slack_status,slack_processResult).then(res => {
        console.log(response);
        return response;
    }).catch(err => {
        console.log(err);
        console.log(response);
        return response;
    });
    */
};


async function notifySlack(event, status, processResultText) {

    console.log('send info to slack');

    let color = 'yellow';

    if (status==="ok") {
        color = '#138f17';
    } else {
        color = '#f54248';
    }

    const options = {
        hostname: "hooks.slack.com",
        method: "POST",
        path: "/services/xxxxxxxxxxxxxxxxxxxxxxxx",
    };

    const payload = JSON.stringify({
        channel: '@username or your #slack-channel',
        attachments: [{
            title: `${processResultText}`,
            author_name: 'ebay-account-deletion-notify-handler',
            text: 'Account delete Request by eBay ```'+JSON.stringify(event)+'```',
            color: `${color}`
        }]
    });

    console.log(payload);

    return new Promise((resolve,reject) => {
        const r = https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (data) {
                console.log('SLACK SEND OK');
                resolve('SLACK SEND OK');
            });
        }).on("error", function (e) {
            console.log('SLACK SEND FAILED ' + e);
            reject('SLACK SEND FAILED');
        });
        r.write(payload);
        r.end();
    });
}