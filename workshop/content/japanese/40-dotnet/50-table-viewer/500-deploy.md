+++
title = "アプリのデプロイ"
weight = 500
+++

## cdk diff

デプロイする前に、アプリケーションをデプロイするとどうなるか見てみましょう。(以下は `Resources` セクションのみ表示しています)

```
$ cdk diff
Resources
[+] AWS::IAM::Role ViewHitCounter/Rendered/ServiceRole ViewHitCounterRenderedServiceRole254DB4EA
[+] AWS::IAM::Policy ViewHitCounter/Rendered/ServiceRole/DefaultPolicy ViewHitCounterRenderedServiceRoleDefaultPolicy9ADB8C83
[+] AWS::Lambda::Function ViewHitCounter/Rendered ViewHitCounterRendered9C783E45
[+] AWS::Lambda::Permission ViewHitCounter/Rendered/ApiPermission.ANY.. ViewHitCounterRenderedApiPermissionANY72263B1A
[+] AWS::Lambda::Permission ViewHitCounter/Rendered/ApiPermission.Test.ANY.. ViewHitCounterRenderedApiPermissionTestANYA4794B81
[+] AWS::Lambda::Permission ViewHitCounter/Rendered/ApiPermission.ANY..{proxy+} ViewHitCounterRenderedApiPermissionANYproxy42B9E676
[+] AWS::Lambda::Permission ViewHitCounter/Rendered/ApiPermission.Test.ANY..{proxy+} ViewHitCounterRenderedApiPermissionTestANYproxy104CA88E
[+] AWS::ApiGateway::RestApi ViewHitCounter/ViewerEndpoint ViewHitCounterViewerEndpoint5A0EF326
[+] AWS::ApiGateway::Deployment ViewHitCounter/ViewerEndpoint/Deployment ViewHitCounterViewerEndpointDeployment1CE7C5768689ca8f54dfa4f161d3df0ebffcdcff
[+] AWS::ApiGateway::Stage ViewHitCounter/ViewerEndpoint/DeploymentStage.prod ViewHitCounterViewerEndpointDeploymentStageprodF3901FC7
[+] AWS::IAM::Role ViewHitCounter/ViewerEndpoint/CloudWatchRole ViewHitCounterViewerEndpointCloudWatchRole87B94D6A
[+] AWS::ApiGateway::Account ViewHitCounter/ViewerEndpoint/Account ViewHitCounterViewerEndpointAccount0B75E76A
[+] AWS::ApiGateway::Resource ViewHitCounter/ViewerEndpoint/{proxy+} ViewHitCounterViewerEndpointproxy2F4C239F
[+] AWS::ApiGateway::Method ViewHitCounter/ViewerEndpoint/{proxy+}/ANY ViewHitCounterViewerEndpointproxyANYFF4B8F5B
[+] AWS::ApiGateway::Method ViewHitCounter/ViewerEndpoint/ANY ViewHitCounterViewerEndpointANY66F2285B
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

```
$ cdk deploy
...
CdkWorkshopStack.ViewHitCounterViewerEndpointCA1B1E4B = https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

viewer のエンドポイントが出力に表示されます。

### HitCounter テーブルを参照

WEB ブラウザで HitCounter viewer のエンドポイントの URL を開きます。以下のような内容が表示されるはずです。

![](./viewer1.png)

### 複数のリクエストを送信

"hello" エンドポイントにいくつかのリクエストを送信し、HitCounter viewer で結果を確認します。リアルタイムにアップデートされることを確認できるはずです。

`curl` またはウェブブラウザを使って、アクセスカウントを増やします。

```
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

**Table Viewer の仕組みに興味ありますか？** 簡単に見られます！**Ctrl** (あるいは **Command**) を押しながら `TableViewer` 要素をクリックすると、ソースコードに遷移できます。

{{% /notice %}}
