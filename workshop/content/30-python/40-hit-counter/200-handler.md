+++
title = "Hit counter handler"
weight = 100
+++

## Hit counter Lambda handler

Okay, now let's write the Lambda handler code for our hit counter.  First, we
will need to install the AWS DynamoDB module.

```
pip install aws-cdk.aws_dynamodb
```

Create the file `lambda/hitcount.py`:

```python
import json
import os

import boto3

ddb = boto3.resource('dynamodb')
table = ddb.Table(os.environ['HITS_TABLE_NAME'])
_lambda = boto3.client('lambda')


def handler(event, context):
    print('request: {}'.format(json.dumps(event)))
    table.update_item(
        Key={'path': event['path']},
        UpdateExpression='ADD hits :incr',
        ExpressionAttributeValues={':incr': 1}
    )

    resp = _lambda.invoke(
        FunctionName=os.environ['DOWNSTREAM_FUNCTION_NAME'],
        Payload=json.dumps(event),
    )

    body = resp['Payload'].read()

    print('downstream response: {}'.format(body))
    return json.loads(body)
```

## Discovering resources at runtime

You'll notice that this code relies on two environment variables:

 * `HITS_TABLE_NAME` is the name of the DynamoDB table to use for storage.
 * `DOWNSTREAM_FUNCTION_NAME` is the name of the downstream AWS Lambda function.

Since the actual name of the table and the downstream function will only be
decided when we deploy our app, we need to wire up these values from our
construct code. We'll do that in the next section.

