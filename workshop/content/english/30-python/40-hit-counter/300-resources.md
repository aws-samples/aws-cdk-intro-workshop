+++
title = "Define resources"
weight = 300
+++

## Add resources to the hit counter construct

Now, let's define the AWS Lambda function and the DynamoDB table in our
`HitCounter` construct. Go back to `cdkworkshop/hitcounter.py` and add the following highlighted code:

{{<highlight python "hl_lines=4 9-11 16-19 21-30">}}
from constructs import Construct
from aws_cdk import (
    aws_lambda as _lambda,
    aws_dynamodb as ddb,
)

class HitCounter(Construct):

    @property
    def handler(self):
        return self._handler    

    def __init__(self, scope: Construct, id: str, downstream: _lambda.IFunction, **kwargs):
        super().__init__(scope, id, **kwargs)

        table = ddb.Table(
            self, 'Hits',
            partition_key={'name': 'path', 'type': ddb.AttributeType.STRING}
        )

        self._handler = _lambda.Function(
            self, 'HitCountHandler',
            runtime=_lambda.Runtime.PYTHON_3_10,
            handler='hitcount.handler',
            code=_lambda.Code.from_asset('lambda'),
            environment={
                'DOWNSTREAM_FUNCTION_NAME': downstream.function_name,
                'HITS_TABLE_NAME': table.table_name,
            }
        )
{{</highlight>}}

## What did we do here?

This code is hopefully quite easy to understand:

 * We defined a DynamoDB table with `path` as the partition key (every DynamoDB
   table must have a single partition key).
 * We defined a Lambda function which is bound to the `lambda/hitcount.handler` code.
 * We __wired__ the Lambda's environment variables to the `function_name` and
   `table_name` of our resources.

## Late-bound values

The `function_name` and `table_name` properties are values that only resolve
when we deploy our stack (notice that we haven't configured these physical
names when we defined the table/function, only logical IDs). This means that if
you print their values during synthesis, you will get a "TOKEN", which is how
the CDK represents these late-bound values. You should treat tokens as *opaque
strings*.  This means you can concatenate them together for example, but don't
be tempted to parse them in your code.
