+++
title = "Granting permissions"
weight = 600
+++

## Allow Lambda to read/write our DynamoDB table

Let's give our Lambda's execution role permissions to read/write from our table.

Go back to `hitcounter.ts` and add the following:

{{<highlight ts "hl_lines=30-31">}}
import cdk = require('@aws-cdk/cdk');
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.Function;
}

export class HitCounter extends cdk.Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'Hits');
    table.addPartitionKey({ name: 'path', type: dynamodb.AttributeType.String });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NodeJS810,
      handler: 'hitcounter.handler',
      code: lambda.Code.asset('lambda'),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName
      }
    });

    // grant the lambda role read/write permissions to our table
    table.grantReadWriteData(this.handler.role);
  }
}
{{</highlight>}}

## Deploy

Save & deploy:

```s
cdk deploy
```

## Test again

Okay, deployment is complete. Let's run our test again (either use `curl` or
your web browser):

```s
curl -i https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

Again?

```
HTTP/1.1 502 Bad Gateway
...

{"message": "Internal server error"}
```

# 😢

Still getting this pesky 5xx error! Let's look at our CloudWatch logs again
(click "Refresh"):

```json
{
    "errorMessage": "User: arn:aws:sts::585695036304:assumed-role/CdkWorkshopStack-HelloHitCounterHitCounterHandlerS-TU5M09L1UBID/CdkWorkshopStack-HelloHitCounterHitCounterHandlerD-144HVUNEWRWEO is not authorized to perform: lambda:InvokeFunction on resource: arn:aws:lambda:us-east-1:585695036304:function:CdkWorkshopStack-HelloHandler2E4FBA4D-149MVAO4969O7",
    "errorType": "AccessDeniedException",
    "stackTrace": [
        "Object.extractError (/var/runtime/node_modules/aws-sdk/lib/protocol/json.js:48:27)",
        "Request.extractError (/var/runtime/node_modules/aws-sdk/lib/protocol/rest_json.js:52:8)",
        "Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:105:20)",
        "Request.emit (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:77:10)",
        "Request.emit (/var/runtime/node_modules/aws-sdk/lib/request.js:683:14)",
        "Request.transition (/var/runtime/node_modules/aws-sdk/lib/request.js:22:10)",
        "AcceptorStateMachine.runTo (/var/runtime/node_modules/aws-sdk/lib/state_machine.js:14:12)",
        "/var/runtime/node_modules/aws-sdk/lib/state_machine.js:26:10",
        "Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:38:9)",
        "Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:685:12)"
    ]
}
```

Another access denied, but this time, if you take a close look:

```
User: <VERY-LONG-STRING> is not authorized to perform: lambda:InvokeFunction on resource: <VERY-LONG-STRING>"
```

So it seems like our hit counter actually managed to write to the database. We can confirm by
going to the [DynamoDB Console](https://console.aws.amazon.com/dynamodb/home):

![](./logs5.png)

But, we must also give our hit counter permissions to invoke the downstream lambda function.

## Grant invoke permissions

{{<highlight ts "hl_lines=33-34">}}
import cdk = require('@aws-cdk/cdk');
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.Function;
}

export class HitCounter extends cdk.Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'Hits');
    table.addPartitionKey({ name: 'path', type: dynamodb.AttributeType.String });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NodeJS810,
      handler: 'hitcounter.handler',
      code: lambda.Code.asset('lambda'),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName
      }
    });

    // grant the lambda role read/write permissions to our table
    table.grantReadWriteData(this.handler.role);

    // grant the lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler.role);
  }
}
{{</highlight>}}

## Diff

You can check what this did to `cdk diff`:

```s
cdk diff
```

You should see something like this:

```
[~] 🛠 Updating HelloHitCounterHitCounterHandlerServiceRoleDefaultPolicy1487A60A (type: AWS::IAM::Policy)
 └─ [~] .PolicyDocument:
     └─ [~] .Statement:
         ├─ [-] Old value: [{"Action":["dynamodb:BatchGetItem","dynamodb:GetRecords","dynamodb:GetShardIterator","dynamodb:Query","dynamodb:GetItem","dynamodb:Scan","dynamodb:BatchWriteItem","dynamodb:PutItem","dynamodb:UpdateItem","dynamodb:DeleteItem"],"Effect":"Allow","Resource":{"Fn::GetAtt":["HelloHitCounterHits7AAEBF80","Arn"]}}]
         └─ [+] New value: [{"Action":["dynamodb:BatchGetItem","dynamodb:GetRecords","dynamodb:GetShardIterator","dynamodb:Query","dynamodb:GetItem","dynamodb:Scan","dynamodb:BatchWriteItem","dynamodb:PutItem","dynamodb:UpdateItem","dynamodb:DeleteItem"],"Effect":"Allow","Resource":{"Fn::GetAtt":["HelloHitCounterHits7AAEBF80","Arn"]}},{"Action":"lambda:InvokeFunction","Effect":"Allow","Resource":{"Fn::GetAtt":["HelloHandler2E4FBA4D","Arn"]}}]
```

You can see that the following IAM statement was added to the role:

```json
{
  "Action":"lambda:InvokeFunction",
  "Effect":"Allow",
  "Resource":{"Fn::GetAtt":["HelloHandler2E4FBA4D","Arn"]}
}
```

Which is exactly what we wanted.

## Deploy

Okay... let's give this another shot:

```s
cdk deploy
```

Then hit your endpoint with `curl` or with your web browser:

```s
curl -i https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

Output should look like this:

```
HTTP/1.1 200 OK
...

Hello, CDK! You've hit /
```

> If you still get 5xx, give it a few seconds and try again. Sometimes API
Gateway takes a little bit to "flip" the endpoint to use the new deployment.

# 😲
