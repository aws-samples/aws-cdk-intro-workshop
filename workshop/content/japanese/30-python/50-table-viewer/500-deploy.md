+++
title = "アプリのデプロイ"
weight = 500
+++

## cdk diff

デプロイする前に、アプリケーションをデプロイするとどうなるか見てみましょう。(以下は `Resources` セクションのみ表示しています)

```text
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
[+] AWS::ApiGateway::Deployment ViewHitCounter/ViewerEndpoint/Deployment ViewHitCounterViewerEndpointDeployment1CE7C5761d44312e8424c23ba090a70e0962c36f
[+] AWS::ApiGateway::Stage ViewHitCounter/ViewerEndpoint/DeploymentStage.prod ViewHitCounterViewerEndpointDeploymentStageprodF3901FC7
[+] AWS::IAM::Role ViewHitCounter/ViewerEndpoint/CloudWatchRole ViewHitCounterViewerEndpointCloudWatchRole87B94D6A
[+] AWS::ApiGateway::Account ViewHitCounter/ViewerEndpoint/Account ViewHitCounterViewerEndpointAccount0B75E76A
[+] AWS::ApiGateway::Resource ViewHitCounter/ViewerEndpoint/Default/{proxy+} ViewHitCounterViewerEndpointproxy2F4C239F
[+] AWS::ApiGateway::Method ViewHitCounter/ViewerEndpoint/Default/{proxy+}/ANY ViewHitCounterViewerEndpointproxyANYFF4B8F5B
[+] AWS::ApiGateway::Method ViewHitCounter/ViewerEndpoint/Default/ANY ViewHitCounterViewerEndpointANY66F2285B
```

Table viewer は API Gateway のエンドポイント、Lambda 関数、権限、出力などを追加していることがわかります。

{{% notice warning %}}
コンストラクトライブラリは強力な概念です。最小限の労力で複雑な機能をアプリケーションに追加できます。しかし、大いなる力には、大いなる責任が伴うことです。コンストラクトは IAM 権限を追加したり、データを外部に公開したり、またはアプリケーションの動作に悪影響を与えることもできます。アプリケーションを保護したり、潜在的なセキュリティリスクを発見できるためのツールの提供に取り組んでいますが、ご利用のコンストラクトがアプリケーションに与える影響を理解するのはお客様の責任となります。コンストラクトライブラリが信頼できる提供者から提供されていることを必ず確認してください。
{{% /notice %}}

### cdk deploy

```
$ cdk deploy
...
cdk-workshop.ViewHitCounterViewerEndpointCA1B1E4B = https://xxxxxxxxx.execute-api.us-east-2.amazonaws.com/prod/
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

**Table Viewer の仕組みに興味ありますか？** 簡単に見られます！**Ctrl** (あるいは **Command**) を押しながら `TableViewer` 要素をクリックすると、ソースコードに遷移できます。それとも、[こちら](https://github.com/eladb/cdk-dynamo-table-viewer)の GitHub のリポジトリで確認できます。

{{% /notice %}}

{{< nextprevlinks >}}