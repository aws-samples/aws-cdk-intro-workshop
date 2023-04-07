+++
title = "Use construct in CDK application"
weight = 600
+++

## Starting point
We'll need to create a new CDK app to show how to consume the construct we just created. For simplicity, we'll be reusing [Hello, CDK App](../../20-typescript/30-hello-cdk.html) from the typescript workshop. To get started, run the following commands from the internal-construct-hub-workshop directory:

{{<highlight bash>}}
mkdir hello-cdk-app
cd hello-cdk-app
cdk init app --language typescript
{{</highlight>}}

## Lambda handler code
We'll start with the AWS Lambda handler code.

1. Create a directory `lambda` in the root of your project tree (next to `bin`
   and `lib`).
2. TS CDK projects created with `cdk init` ignore all `.js` files by default. 
   To track these files with git, add `!lambda/*.js` to your `.gitignore` file. 
   This ensures that your Lambda assets are discoverable during the Pipelines 
   section of this tutorial.
3. Add a file called `lambda/hello.js` with the following contents:

---
```js
exports.handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, CDK! You've hit ${event.path}\n`
  };
};
```

## Create a new file for our hit counter construct

Create a new file under `lib` called `hitcounter.ts` with the following content:

```ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;
}

export class HitCounter extends Construct {

  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'Hits', {
        partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
    });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'hitcounter.handler',
        code: lambda.Code.fromAsset('lambda'),
        environment: {
            DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
            HITS_TABLE_NAME: table.tableName
        }
    });

    // grant the lambda role read/write permissions to our table
    table.grantReadWriteData(this.handler);

    // grant the lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler);
  }
}
```

## Hit counter Lambda handler

Okay, now let's write the Lambda handler code for our hit counter.

Create the file `lambda/hitcounter.js`:

```js
const { DynamoDB, Lambda } = require('aws-sdk');

exports.handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // create AWS SDK clients
  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  // update dynamo entry for "path" with hits++
  await dynamo.updateItem({
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: { S: event.path } },
    UpdateExpression: 'ADD hits :incr',
    ExpressionAttributeValues: { ':incr': { N: '1' } }
  }).promise();

  // call downstream function and capture response
  const resp = await lambda.invoke({
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: JSON.stringify(event)
  }).promise();

  console.log('downstream response:', JSON.stringify(resp, undefined, 2));

  // return response back to upstream caller
  return JSON.parse(resp.Payload);
};
```

## Add an AWS Lambda Function and API Gateway to your stack

Add an `import` statement at the beginning of `lib/hello-cdk-app-stack.ts`, a
`lambda.Function`, and a `apigw.LambdaRestApi` to your stack.


{{<highlight ts >}}
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { HitCounter } from './hitcounter';

export class HelloCdkAppStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,    // execution environment
      code: lambda.Code.fromAsset('lambda'),  // code loaded from "lambda" directory
      handler: 'hello.handler'                // file is "hello", function is "handler"
    });

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    });
  }
}
{{</highlight>}}


Now, we'll take on the role of an Internal Construct Hub Consumer. 

## Remove the hitcounter construct from the original sample application

As we are going to use the `hitcounter` construct from the published `cdkworkshop-lib` construct library, remove the `hitcounter` construct from the CDK application.

{{<highlight bash>}}
rm lib/hitcounter.ts
rm lambda/hitcounter.js
{{</highlight>}}

## Configure npm to use CodeArtifact as package repository

To enable npm to pull packages from CodeArtifact, follow the instructions described [here](https://docs.aws.amazon.com/codeartifact/latest/ug/npm-auth.html).

{{<highlight bash>}}
aws codeartifact login --tool npm --domain cdkworkshop-domain  --repository cdkworkshop-repository --region us-east-1
{{</highlight>}}

## Npm install cdkworkshop-lib dependency

To use the published `cdkworkshop-lib` CDK construct library containing the hitcounter CDK construct, use `npm install` to add it to the CDK application's dependencies:

{{<highlight bash>}}
npm install cdkworkshop-lib
{{</highlight>}}

## Adapt import to use the construct library

To replace the local version of the hitcounter construct with the one from the cdkworkshop-lib construct library, replace `import { HitCounter } from './hitcounter';` with the following:

{{<highlight ts>}}
import { HitCounter } from 'cdkworkshop-lib';
{{</highlight>}}

## Review benefits

That's it! Your CDK app is now using the hitcounter construct from the cdkworkshop-lib CDK Construct library. Multiple CDK apps can use this construct without copy/pasting its code so that code duplication is avoided and standardized best practices can be reused. You can now start adding additional CDK Constructs to cdkworkshop-lib to build a construct library that help accelerate your teams and establish best practices!
