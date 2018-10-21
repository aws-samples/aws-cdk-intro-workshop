+++
title = "API Gateway"
weight = 300
+++

Next step is to add an API Gateway in front of our function. API Gateway will
expose a public HTTP endpoint that anyone on the internet can hit with an HTTP
client such as cURL or a web browser.

We will use [Lambda proxy
integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html)
mounted to the root of the API. This means that any request to any URL path will
be proxied directly to our Lambda function, and the response from the function
will be returned back to the user.

## Install the API Gateway construct library

```s
npm i @aws-cdk/aws-apigateway
```

## Add a LambdaRestApi construct to your stack

Let's define an API endpoint and associate it with our Lambda function:

{{<highlight ts "hl_lines=3 15-18">}}
import cdk = require('@aws-cdk/cdk');
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigateway');

class CdkWorkshopStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
    super(parent, name, props);

    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NodeJS810,
      code: lambda.Code.directory('lambda'),
      handler: 'hello.handler'
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: hello
    });
  }
}

const app = new cdk.App();
new CdkWorkshopStack(app, 'CdkWorkshopStack');
app.run();
{{</highlight>}}

That's it. This is all you need to do in order to define an API Gateway which
proxies all requests to an AWS Lambda function.

## cdk diff

Let's see what's going to happen when we deploy this:

```s
cdk diff
```

Output should look like this:

```
[+] 🆕 Creating HelloHandlerApiPermissionANYproxy90E90CD6 (type: AWS::Lambda::Permission)
[+] 🆕 Creating HelloHandlerApiPermissionTestANYproxy9803526C (type: AWS::Lambda::Permission)
[+] 🆕 Creating HelloHandlerApiPermissionANYAC4E141E (type: AWS::Lambda::Permission)
[+] 🆕 Creating HelloHandlerApiPermissionTestANYDDD56D72 (type: AWS::Lambda::Permission)
[+] 🆕 Creating EndpointEEF1FD8F (type: AWS::ApiGateway::RestApi)
[+] 🆕 Creating EndpointDeployment318525DA74d07276aabd2917b81309217a397827 (type: AWS::ApiGateway::Deployment)
[+] 🆕 Creating EndpointDeploymentStageprodB78BEEA0 (type: AWS::ApiGateway::Stage)
[+] 🆕 Creating EndpointCloudWatchRoleC3C64E0F (type: AWS::IAM::Role)
[+] 🆕 Creating EndpointAccountB8304247 (type: AWS::ApiGateway::Account)
[+] 🆕 Creating Endpointproxy39E2174E (type: AWS::ApiGateway::Resource)
[+] 🆕 Creating EndpointproxyANYC09721C5 (type: AWS::ApiGateway::Method)
[+] 🆕 Creating EndpointANY485C938B (type: AWS::ApiGateway::Method)
[+] Added Endpoint8024A810: {"Value":{"Fn::Join":["",["https://",{"Ref":"EndpointEEF1FD8F"},".execute-api.",{"Ref":"AWS::Region"},".amazonaws.com/",{"Ref":"EndpointDeploymentStageprodB78BEEA0"},"/"]]},"Export":{"Name":"CdkWorkshopStack:Endpoint8024A810"}}
```

That's nice. This one line of code added 12 new resources to our stack.

## cdk deploy

Okay, ready to deploy?

```s
cdk deploy
```

## Stack outputs

When deployment is complete, you'll notice this line:

```
CdkWorkshopStack.Endpoint8024A810 = https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

This is a [stack output](https://awslabs.github.io/aws-cdk/cloudformation.html#outputs) that's
automatically added by the API Gateway construct and includes the URL of the API Gateway endpoint.

## Testing your app

Let's try to hit this endpoint with `cURL`. Copy the URL and execute (your
prefix and region will likely be different):

```s
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

Output should look like this:

```
Hello, CDK! You've hit /
```

If this is the output you received, your app works!

## What if it didn't work?

If you received a 500 error from API Gateway, it is likely one of two issues:

1. The response your function returned is not what API Gateway expects. Go back and
   make sure you function returns a response that includes a `statusCode`, `body` and `header`
   fields (see [Write handler runtime code](./200-lambda.html)).
2. Your function failed for some reason. To debug this, you can quickly jump to [this section](../40-hit-counter/500-logs.html)
   to learn how to view your Lambda logs.

---

Good job! In the next chapter, we'll write our own reusable construct.