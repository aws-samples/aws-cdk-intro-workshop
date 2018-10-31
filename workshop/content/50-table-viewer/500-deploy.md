+++
title = "Deploying our app"
weight = 500
+++

## cdk diff

Before we deploy, let's take a look at what will happen when we deploy our app:

```s
$ cdk diff
[+] Added ViewHitCounterRenderedCodeS3Bucket7AAA6C2C: {"Type":"String","Description":"S3 bucket for asset \"CdkWorkshopStack/ViewHitCounter/Rendered/Code\""}
[+] Added ViewHitCounterRenderedCodeS3VersionKey7A5EC4B1: {"Type":"String","Description":"S3 key for asset version \"CdkWorkshopStack/ViewHitCounter/Rendered/Code\""}
[+] 🆕 Creating ViewHitCounterRenderedServiceRole254DB4EA (type: AWS::IAM::Role)
[+] 🆕 Creating ViewHitCounterRenderedServiceRoleDefaultPolicy9ADB8C83 (type: AWS::IAM::Policy)
[+] 🆕 Creating ViewHitCounterRendered9C783E45 (type: AWS::Lambda::Function)
[+] 🆕 Creating ViewHitCounterRenderedApiPermissionANY72263B1A (type: AWS::Lambda::Permission)
[+] 🆕 Creating ViewHitCounterRenderedApiPermissionTestANYA4794B81 (type: AWS::Lambda::Permission)
[+] 🆕 Creating ViewHitCounterRenderedApiPermissionANYproxy42B9E676 (type: AWS::Lambda::Permission)
[+] 🆕 Creating ViewHitCounterRenderedApiPermissionTestANYproxy104CA88E (type: AWS::Lambda::Permission)
[+] 🆕 Creating ViewHitCounterViewerEndpoint5A0EF326 (type: AWS::ApiGateway::RestApi)
[+] 🆕 Creating ViewHitCounterViewerEndpointDeployment1CE7C576c8b7e0e01eb7ce2a4bbbe28f079d181b (type: AWS::ApiGateway::Deployment)
[+] 🆕 Creating ViewHitCounterViewerEndpointDeploymentStageprodF3901FC7 (type: AWS::ApiGateway::Stage)
[+] 🆕 Creating ViewHitCounterViewerEndpointCloudWatchRole87B94D6A (type: AWS::IAM::Role)
[+] 🆕 Creating ViewHitCounterViewerEndpointAccount0B75E76A (type: AWS::ApiGateway::Account)
[+] 🆕 Creating ViewHitCounterViewerEndpointproxy2F4C239F (type: AWS::ApiGateway::Resource)
[+] 🆕 Creating ViewHitCounterViewerEndpointproxyANYFF4B8F5B (type: AWS::ApiGateway::Method)
[+] 🆕 Creating ViewHitCounterViewerEndpointANY66F2285B (type: AWS::ApiGateway::Method)
[+] Added ViewHitCounterViewerEndpointCA1B1E4B: {"Value":{"Fn::Join":["",["https://",{"Ref":"ViewHitCounterViewerEndpoint5A0EF326"},".execute-api.",{"Ref":"AWS::Region"},".amazonaws.com/",{"Ref":"ViewHitCounterViewerEndpointDeploymentStageprodF3901FC7"},"/"]]},"Export":{"Name":"CdkWorkshopStack:ViewHitCounterViewerEndpointCA1B1E4B"}}
```

You'll notice that the table viewer adds another API Gateway endpoint, a Lambda
function, permissions, outputs, all sorts of goodies.

{{% notice warning %}} Construct libraries are a very powerful concept. They
allow you to add complex capabilities to your apps with minimum effort. However,
you must understand that with great power comes great responsibility. Constructs
can add IAM permissions, expose data to the public or cause your application not
to function. We are working on providing you tools for protecting your app, and
identifying potential security issues with your stacks, but it is your
responsibility to understand how certain constructs that you use impact your
application, and to make sure you only use construct libraries from vendors you
trust  {{% /notice %}}

### cdk deploy

```s
$ cdk deploy
...
CdkWorkshopStack.ViewHitCounterViewerEndpointCA1B1E4B = https://mgmshrjxt1.execute-api.us-east-1.amazonaws.com/prod/
```

You'll see the viewer endpoint as an output.

### Viewing the hit counter table

Open your browser and browse to the hit counter viewer endpoint URL. You should
see something like this:

![](./viewer1.png)

### Send a few requests

Send a few more requests to your "hello" endpoint and monitor your hit counter
viewer. You should see the values update in real-time.

Use `curl` or your web browser to produce a few hits:

```s
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hoooot
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hoooot
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hoooot
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hoooot
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
```

{{% notice tip %}}

**Interested in how the Table Viewer works?** It's easy to find out!
Hold **Ctrl** (or **Command**) and click on the `TableViewer`
identifier to navigate to its source code.

{{% /notice %}}
