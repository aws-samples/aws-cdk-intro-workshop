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

## Configure npm to use CodeArtifact as package repository

To enable npm to pull packages from CodeArtifact, follow the instructions described [here](https://docs.aws.amazon.com/codeartifact/latest/ug/npm-auth.html).

{{<highlight bash>}}
aws codeartifact login --tool npm --domain cdkworkshop-domain  --repository cdkworkshop-repository --region us-east-1
{{</highlight>}}

## Npm install cdkworkshop-lib dependency

To use the published `cdkworkshop-lib` CDK construct library containing the hitcounter CDK construct, use `npm install` to add it to the CDK application's dependencies:

{{<highlight bash>}}
npm install cdkworkshop-lib --force
{{</highlight>}}

## Adapt import to use the construct library

To replace the local version of the hitcounter construct with the one from the cdkworkshop-lib construct library, replace `import { HitCounter } from './hitcounter';` with the following:

{{<highlight ts>}}
import { HitCounter } from 'cdkworkshop-lib';
{{</highlight>}}

## Review benefits

That's it! Your CDK app is now using the hitcounter construct from the cdkworkshop-lib CDK Construct library. Multiple CDK apps can use this construct without copy/pasting its code so that code duplication is avoided and standardized best practices can be reused. You can now start adding additional CDK Constructs to cdkworkshop-lib to build a construct library that help accelerate your teams and establish best practices!
