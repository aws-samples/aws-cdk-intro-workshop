+++
title = "API Gateway"
weight = 300
+++

Next step is to add an API Gateway in front of our function. API Gateway will
expose a public HTTP endpoint that anyone on the internet can hit with an HTTP
client such as [curl](https://curl.haxx.se/) or a web browser.

We will use [Lambda proxy
integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html)
mounted to the root of the API. This means that any request to any URL path will
be proxied directly to our Lambda function, and the response from the function
will be returned back to the user.

## Install the API Gateway construct library

```
dotnet add package Amazon.CDK.AWS.APIGateway
```

## Add a LambdaRestApi construct to your stack

Going back to `src/CdkWorkshop/CdkWorkshopStack.cs`, let's define an API endpoint and associate it with our Lambda function:

{{<highlight csharp "hl_lines=3 19-23">}}
using Amazon.CDK;
using Amazon.CDK.AWS.APIGateway;
using Amazon.CDK.AWS.Lambda;

namespace CdkWorkshop
{
    public class CdkWorkshopStack : Stack
    {
        public CdkWorkshopStack(Construct scope, string id, IStackProps props = null) : base(scope, id, props)
        {
            // Defines a new lambda resource
            var hello = new Function(this, "HelloHandler", new FunctionProps
            {
                Runtime = Runtime.NODEJS_14_X, // execution environment
                Code = Code.FromAsset("lambda"), // Code loaded from the "lambda" directory
                Handler = "hello.handler" // file is "hello", function is "handler"
            });

            // defines an API Gateway REST API resource backed by our "hello" function.
            new LambdaRestApi(this, "Endpoint", new LambdaRestApiProps
            {
                Handler = hello
            });
        }
    }
}
{{</highlight>}}

That's it. This is all you need to do in order to define an API Gateway which
proxies all requests to an AWS Lambda function.

## cdk diff

Let's see what's going to happen when we deploy this:

```
cdk diff
```

Output should look like this:

```
IAM Statement Changes
┌───┬───────────────────────────┬────────┬───────────────────────────┬───────────────────────────┬─────────────────────────────┐
│   │ Resource                  │ Effect │ Action                    │ Principal                 │ Condition                   │
├───┼───────────────────────────┼────────┼───────────────────────────┼───────────────────────────┼─────────────────────────────┤
│ + │ ${Endpoint/CloudWatchRole │ Allow  │ sts:AssumeRole            │ Service:apigateway.${AWS: │                             │
│   │ .Arn}                     │        │                           │ :URLSuffix}               │                             │
├───┼───────────────────────────┼────────┼───────────────────────────┼───────────────────────────┼─────────────────────────────┤
│ + │ ${HelloHandler.Arn}       │ Allow  │ lambda:InvokeFunction     │ Service:apigateway.amazon │ "ArnLike": {                │
│   │                           │        │                           │ aws.com                   │   "AWS:SourceArn": "arn:${A │
│   │                           │        │                           │                           │ WS::Partition}:execute-api: │
│   │                           │        │                           │                           │ ${AWS::Region}:${AWS::Accou │
│   │                           │        │                           │                           │ ntId}:${EndpointEEF1FD8F}/$ │
│   │                           │        │                           │                           │ {Endpoint/DeploymentStage.p │
│   │                           │        │                           │                           │ rod}/*/"                    │
│   │                           │        │                           │                           │ }                           │
│ + │ ${HelloHandler.Arn}       │ Allow  │ lambda:InvokeFunction     │ Service:apigateway.amazon │ "ArnLike": {                │
│   │                           │        │                           │ aws.com                   │   "AWS:SourceArn": "arn:${A │
│   │                           │        │                           │                           │ WS::Partition}:execute-api: │
│   │                           │        │                           │                           │ ${AWS::Region}:${AWS::Accou │
│   │                           │        │                           │                           │ ntId}:${EndpointEEF1FD8F}/t │
│   │                           │        │                           │                           │ est-invoke-stage/*/"        │
│   │                           │        │                           │                           │ }                           │
│ + │ ${HelloHandler.Arn}       │ Allow  │ lambda:InvokeFunction     │ Service:apigateway.amazon │ "ArnLike": {                │
│   │                           │        │                           │ aws.com                   │   "AWS:SourceArn": "arn:${A │
│   │                           │        │                           │                           │ WS::Partition}:execute-api: │
│   │                           │        │                           │                           │ ${AWS::Region}:${AWS::Accou │
│   │                           │        │                           │                           │ ntId}:${EndpointEEF1FD8F}/$ │
│   │                           │        │                           │                           │ {Endpoint/DeploymentStage.p │
│   │                           │        │                           │                           │ rod}/*/{proxy+}"            │
│   │                           │        │                           │                           │ }                           │
│ + │ ${HelloHandler.Arn}       │ Allow  │ lambda:InvokeFunction     │ Service:apigateway.amazon │ "ArnLike": {                │
│   │                           │        │                           │ aws.com                   │   "AWS:SourceArn": "arn:${A │
│   │                           │        │                           │                           │ WS::Partition}:execute-api: │
│   │                           │        │                           │                           │ ${AWS::Region}:${AWS::Accou │
│   │                           │        │                           │                           │ ntId}:${EndpointEEF1FD8F}/t │
│   │                           │        │                           │                           │ est-invoke-stage/*/{proxy+} │
│   │                           │        │                           │                           │ "                           │
│   │                           │        │                           │                           │ }                           │
└───┴───────────────────────────┴────────┴───────────────────────────┴───────────────────────────┴─────────────────────────────┘
IAM Policy Changes
┌───┬────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────┐
│   │ Resource                   │ Managed Policy ARN                                                                      │
├───┼────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────┤
│ + │ ${Endpoint/CloudWatchRole} │ arn:${AWS::Partition}:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs │
└───┴────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See http://bit.ly/cdk-2EhF7Np)

Resources
[+] AWS::Lambda::Permission HelloHandler/ApiPermission.ANY.. HelloHandlerApiPermissionANYAC4E141E
[+] AWS::Lambda::Permission HelloHandler/ApiPermission.Test.ANY.. HelloHandlerApiPermissionTestANYDDD56D72
[+] AWS::Lambda::Permission HelloHandler/ApiPermission.ANY..{proxy+} HelloHandlerApiPermissionANYproxy90E90CD6
[+] AWS::Lambda::Permission HelloHandler/ApiPermission.Test.ANY..{proxy+} HelloHandlerApiPermissionTestANYproxy9803526C
[+] AWS::ApiGateway::RestApi Endpoint EndpointEEF1FD8F
[+] AWS::ApiGateway::Deployment Endpoint/Deployment EndpointDeployment318525DA37c0e38727e25b4317827bf43e918fbf
[+] AWS::ApiGateway::Stage Endpoint/DeploymentStage.prod EndpointDeploymentStageprodB78BEEA0
[+] AWS::IAM::Role Endpoint/CloudWatchRole EndpointCloudWatchRoleC3C64E0F
[+] AWS::ApiGateway::Account Endpoint/Account EndpointAccountB8304247
[+] AWS::ApiGateway::Resource Endpoint/Default/{proxy+} Endpointproxy39E2174E
[+] AWS::ApiGateway::Method Endpoint/Default/{proxy+}/ANY EndpointproxyANYC09721C5
[+] AWS::ApiGateway::Method Endpoint/Default/ANY EndpointANY485C938B

Outputs
[+] Output Endpoint/Endpoint Endpoint8024A810: {"Value":{"Fn::Join":["",["https://",{"Ref":"EndpointEEF1FD8F"},".execute-api.",{"Ref":"AWS::Region"},".",{"Ref":"AWS::URLSuffix"},"/",{"Ref":"EndpointDeploymentStageprodB78BEEA0"},"/"]]}}
```

That's nice. This one line of code added 12 new resources to our stack.

## cdk deploy

Okay, ready to deploy?

```
cdk deploy
```

## Stack outputs

When deployment is complete, you'll notice this line:

```
CdkWorkshopStack.Endpoint8024A810 = https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

This is a [stack output](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html) that's
automatically added by the API Gateway construct and includes the URL of the API Gateway endpoint.

## Testing your app

Let's try to hit this endpoint with `curl`. Copy the URL and execute (your
prefix and region will likely be different).

{{% notice info %}}
If you don't have [curl](https://curl.haxx.se/) installed, you can always use
your favorite web browser to hit this URL.
{{% /notice %}}

```
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

Output should look like this:

```
Hello, CDK! You've hit /
```

You can also use your web browser for this:

![](./browser.png)

If this is the output you received, your app works!

## What if it didn't work?

If you received a 5xx error from API Gateway, it is likely one of two issues:

1. The response your function returned is not what API Gateway expects. Go back
   and make sure your handler returns a response that includes a `statusCode`,
   `body` and `header` fields (see [Write handler runtime
   code](./200-lambda.html)).
2. Your function failed for some reason. To debug this, you can quickly jump to [this section](../40-hit-counter/500-logs.html)
   to learn how to view your Lambda logs.

---

Good job! In the next chapter, we'll write our own reusable construct.
