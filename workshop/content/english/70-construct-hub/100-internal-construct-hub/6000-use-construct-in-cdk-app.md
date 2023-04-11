+++
title = "Use Construct in CDK Application"
weight = 600
+++

## Create a CDK App to Consume the Construct
We'll need to create a new CDK app to show how to consume the construct we just created. For simplicity, we'll be reusing the [Hello, CDK!](../../20-typescript/30-hello-cdk.html) app from the typescript workshop. To get started, run the following commands from the `construct-hub-workshop` directory:

{{<highlight bash>}}
mkdir hello-cdk-app
cd hello-cdk-app
cdk init app --language typescript
{{</highlight>}}

## Lambda Handler Code
Next, we'll create the AWS Lambda handler code.

Create a directory called `lambda` in the root of your project tree (next to `bin` and `lib`).

{{<highlight bash>}}
mkdir lambda
{{</highlight>}}

Then create a file called `lambda/hello.js` with the following contents:

{{<highlight javascript>}}
exports.handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, CDK! You've hit ${event.path}\n`
  };
};
{{</highlight>}}

## Add an AWS Lambda Function and API Gateway

Add an `import` statement at the beginning of `lib/hello-cdk-app-stack.ts`, a
`lambda.Function`, and a `apigw.LambdaRestApi` to your stack:


{{<highlight typescript >}}
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
      downstream: hello,
      hitcounterPath: 'lambda', // the path to the hitcounter.js file in the lambda directory
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    });
  }
}
{{</highlight>}}

Your code editor may display an error at the `import { HitCounter } from './hitcounter';` line because the hitcounter construct cannot be found. That makes sense because currently, our project does not have a hitcounter construct. While we could author one from scratch, we'll instead fix this issue by taking on the role of an Internal Construct Hub Consumer and installing the hitcounter construct we created in the previous section. 

## Configure npm to Use CodeArtifact as the Package Repository

To enable npm to pull packages from your CodeArtifact repository, follow the instructions described [here](https://docs.aws.amazon.com/codeartifact/latest/ug/npm-auth.html). The command should look something like this:

{{<highlight bash>}}
aws codeartifact login --tool npm --domain cdkworkshop-domain  --repository cdkworkshop-repository --region [Insert Region]
{{</highlight>}}

## Use NPM to Install the cdkworkshop-lib Dependency

To use the published `cdkworkshop-lib` CDK construct library containing the hitcounter CDK construct, use `npm install` to add it to the `Hello, CDK!` application's dependencies:

{{<highlight bash>}}
npm install cdkworkshop-lib
{{</highlight>}}

Oh no! Looks like we got an error:
{{<highlight bash "hl_lines=5">}}
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! 
npm ERR! While resolving: hello-cdk-app@0.1.0
npm ERR! Found: aws-cdk-lib@undefined
npm ERR! node_modules/aws-cdk-lib
npm ERR!   aws-cdk-lib@"^2.73.0" from the root project
npm ERR! 
npm ERR! Could not resolve dependency:
npm ERR! peer aws-cdk-lib@"^2.73.0" from cdkworkshop-lib@1.0.1
npm ERR! node_modules/cdkworkshop-lib
npm ERR!   cdkworkshop-lib@"*" from the root project
{{</highlight>}}

On line 5, NPM is saying that the version of `aws-cdk-lib` is undefined. This is because our CodeArtifact repository does not actually contain the `aws-cdk-lib` package. When we ran the command `npm install cdkworkshop-lib`, npm went to our CodeArtifact repository looking for `aws-cdk-lib` but couldn't find it, hence the error. We can resolve this issue by either adding the `aws-cdk-lib` package to our CodeArtifact repository or by setting an upstream npm repository for CodeArtifact to use. 

For simplicity, let's set the upstream npm respository. This way, if NPM goes to our CodeArtifact repository and cannot find a particular package, it will first try to find that package in the upstream repository before throwing an error. If that package is found, the package will be installed by NPM as expected.

To set the upstream npm repository, follow the instructions in <a href="https://docs.aws.amazon.com/codeartifact/latest/ug/repo-upstream-add.html#:~:text=external%20connection.-,Add%20or%20remove%20upstream%20repositories%20(console),-Perform%20the%20steps" target="_blank">Add or remove upstream repositories (console).</a> Once that is done, we can run the following command to verify the change:

{{<highlight bash>}}
aws codeartifact update-repository --repository cdkworkshop-repository --domain cdkworkshop-domain --upstreams repositoryName=npm-store --region [Insert Region]
{{</highlight>}}

If the command ran successfully, a JSON block should be retuned that looks something like this:

{{<highlight JSON>}}
{
  "repository": {
    "name": "cdkworkshop-repository",
    "administratorAccount": "[Account ID]",
    "domainName": "cdkworkshop-domain",
    "domainOwner": "[Account ID]",
    "arn": "arn:aws:codeartifact:us-east-1:[Account ID]:repository/cdkworkshop-domain/cdkworkshop-repository",
    "upstreams": [
      {
        "repositoryName": "npm-store"
      }
    ],
    "externalConnections": [],
    "createdTime": "[Timestamp]"
  }
}
{{</highlight>}}

Now try to install `cdkworkshop-lib` again:

{{<highlight bash>}}
npm install cdkworkshop-lib
{{</highlight>}}

This time it worked! We can verify this by checking the `dependencies` section of the `package.json` file of the `hello-cdk-app`.

## Adapt import to use the construct library

To adapt code to use the hitcounter construct from our cdkworkshop-lib construct library, replace `import { HitCounter } from './hitcounter';` with the following:
{{<highlight typescript>}}
import { HitCounter } from 'cdkworkshop-lib';
{{</highlight>}}

## Adapt import to use the construct library

Run `cdk deploy` to deploy the hello app and test it out.

{{<highlight bash>}}
cdk deploy
{{</highlight>}}

Once deployed, we'll see an api gateway endpoint we can hit with a message. To do so, append a string to the end of your unique endpoint:

{{<highlight bash>}}
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hello!
{{</highlight>}}

Huh, we get an error back. Why is that? The api gateway endpoint uses our hitcounter lambda function so let's go check it out in the <a href="https://console.aws.amazon.com/lambda" target="_blank">Lambda</a> console. Ensure you're in the right region adn search for `hitcounter` to bring up the lambda function and click into it. Once it loads up, you'll notice that the hitcounter lambda function is using the `hello.js` file instead of `hitcounter.js` file! The reason this happened is because the hitcounter construct defined in the `hello-cdk-app-stack.ts` file is currently using the lambda directory local to the hello-cdk-app (which only contains `hello.js`) instead of the lambda directory in `cdkworkshop-lib` (which contains `hitcounter.js`). To fix this, change the value of hitcounterPath in the`hello-cdk-app-stack.ts` file to the following:

{{<highlight typescript>}}
hitcounterPath: 'node_modules/cdkworkshop-lib/lambda', // the path to the hitcounter.js file in the lambda directory
{{</highlight>}}

Then deploy the application again:

{{<highlight bash>}}
cdk deploy
{{</highlight>}}

Now when we hit our api gateway endpoint, we'll get the proper response back!

{{<highlight bash>}}
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hello!
{{</highlight>}}

The repsonse should look something like this:

{{<highlight bash>}}
Hello, CDK! You've hit /hello!
{{</highlight>}}

## Review benefits

That's it! Your CDK app is now consuming the Hitcounter construct from the `cdkworkshop-lib` CDK Construct library. Multiple CDK apps can use this construct without copy/pasting its code so that code duplication is avoided and standardized best practices can be reused. You can now start adding additional CDK Constructs to `cdkworkshop-lib` to build a construct library that help accelerate your teams and establish best practices!