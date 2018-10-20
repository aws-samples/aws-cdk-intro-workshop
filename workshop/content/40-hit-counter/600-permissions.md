+++
title = "Granting permissions"
weight = 600
+++

Let's give our Lambda's execution role permissions to read/write from our DynamoDB.

Go back to `hitcounter.ts` and add the following:

{{<highlight ts "hl_lines=30-31">}}
import cdk = require('@aws-cdk/cdk');
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.FunctionRef;
}

export class HitCounter extends cdk.Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  constructor(parent: cdk.Construct, id: string, props: HitCounterProps) {
    super(parent, id);

    const table = new dynamodb.Table(this, 'Hits');
    table.addPartitionKey({ name: 'path', type: dynamodb.AttributeType.String });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NodeJS810,
      handler: 'hitcounter.handler',
      code: lambda.Code.directory('lambda'),
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

Save & deploy:

```s
$ cdk deploy
```

Okay, deployment is complete. Let's run our test again:

```s
$ curl -i https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
HTTP/1.1 502 Bad Gateway
```

# 😢

Still getting those pesky 500s. Let's take another look at our CloudWatch logs (click "Refresh"):

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
User: X is not authorized to perform: lambda:InvokeFunction on resource: Y"
```

So it seems like our hit counter actually managed to write to the database. We can confirm by
going to the [DynamoDB Console](https://console.aws.amazon.com/dynamodb/home):

![](./logs5.png)

But, we must also give our hit counter permissions to invoke the downstream lambda function:

{{<highlight ts "hl_lines=33-34">}}
import cdk = require('@aws-cdk/cdk');
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.FunctionRef;
}

export class HitCounter extends cdk.Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  constructor(parent: cdk.Construct, id: string, props: HitCounterProps) {
    super(parent, id);

    const table = new dynamodb.Table(this, 'Hits');
    table.addPartitionKey({ name: 'path', type: dynamodb.AttributeType.String });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NodeJS810,
      handler: 'hitcounter.handler',
      code: lambda.Code.directory('lambda'),
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

You can check what this did to `cdk diff`:

```s
$ cdk diff
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

Okay... let's give this another shot:

```shell
$ cdk deploy
...
$ curl -i https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 25
Connection: keep-alive
Date: Sat, 20 Oct 2018 19:12:33 GMT
x-amzn-RequestId: 189366e5-d49c-11e8-a26e-9b7e6c85eb5a
x-amz-apigw-id: PFClHG46IAMFRNg=
X-Amzn-Trace-Id: Root=1-5bcb7e20-9fa33379adf03dae7fa6dbec;Sampled=0
X-Cache: Miss from cloudfront
Via: 1.1 e5740b731d03d61279af4365058ca2f2.cloudfront.net (CloudFront)
X-Amz-Cf-Id: jx8owNdYNetO7TZ79OOx5g0IFfxuvMPX8UK0nbelg5TOZ_HITvyaOQ==

Hello, CDK! You've hit /
```

# 😲
