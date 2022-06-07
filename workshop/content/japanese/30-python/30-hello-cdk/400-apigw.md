+++
title = "API Gateway"
weight = 400
+++

次のステップは、Lambda 関数の前に API Gateway を追加することです。API Gateway は、インターネット経由で [curl](https://curl.haxx.se/) などの HTTP クライアントやウェブブラウザでアクセスできるパブリック HTTP エンドポイントを公開します。

API のルートにマウントされた [Lambda プロキシ統合](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html) を使用します。つまり、任意の URL パスへのリクエストは全て Lambda 関数に直接プロキシされ、関数からの応答がユーザーに返されます。

## LambdaRestApi コンストラクトをスタックに追加

API エンドポイントを定義して、それを Lambda 関数に関連付けましょう。次のコードを `cdk_workshop_stack.py` に追加します

{{<highlight python "hl_lines=5 21-24">}}
from constructs import Construct
from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigw,
)


class CdkWorkshopStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        my_lambda = _lambda.Function(
            self, 'HelloHandler',
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.from_asset('lambda'),
            handler='hello.handler',
        )

        apigw.LambdaRestApi(
            self, 'Endpoint',
            handler=my_lambda,
        )
{{</highlight>}}

AWS Lambda 関数へのすべてのリクエストをプロキシする API Gateway を定義するために必要なことはこれだけです。

## cdk diff

これを展開するとどうなるか見てみましょう。

```
cdk diff
```

出力は次のようになります。

```text
The cdk-workshop stack uses assets, which are currently not accounted for in the diff output! See https://github.com/awslabs/aws-cdk/issues/395
IAM Statement Changes
┌───┬────────────────────┬────────┬────────────────────┬────────────────────┬───────────────────────┐
│   │ Resource           │ Effect │ Action             │ Principal          │ Condition             │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ + │ ${Endpoint/CloudWa │ Allow  │ sts:AssumeRole     │ Service:apigateway │                       │
│   │ tchRole.Arn}       │        │                    │ .${AWS::URLSuffix} │                       │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ + │ ${HelloHandler.Arn │ Allow  │ lambda:InvokeFunct │ Service:apigateway │ "ArnLike": {          │
│   │ }                  │        │ ion                │ .amazonaws.com     │   "AWS:SourceArn": "a │
│   │                    │        │                    │                    │ rn:${AWS::Partition}: │
│   │                    │        │                    │                    │ execute-api:us-east-2 │
│   │                    │        │                    │                    │ :${AWS::AccountId}:${ │
│   │                    │        │                    │                    │ Endpoint}/${EndpointD │
│   │                    │        │                    │                    │ eploymentStageprodB78 │
│   │                    │        │                    │                    │ BEEA0}/*/"            │
│   │                    │        │                    │                    │ }                     │
│ + │ ${HelloHandler.Arn │ Allow  │ lambda:InvokeFunct │ Service:apigateway │ "ArnLike": {          │
│   │ }                  │        │ ion                │ .amazonaws.com     │   "AWS:SourceArn": "a │
│   │                    │        │                    │                    │ rn:${AWS::Partition}: │
│   │                    │        │                    │                    │ execute-api:us-east-2 │
│   │                    │        │                    │                    │ :${AWS::AccountId}:${ │
│   │                    │        │                    │                    │ Endpoint}/test-invoke │
│   │                    │        │                    │                    │ -stage/*/"            │
│   │                    │        │                    │                    │ }                     │
│ + │ ${HelloHandler.Arn │ Allow  │ lambda:InvokeFunct │ Service:apigateway │ "ArnLike": {          │
│   │ }                  │        │ ion                │ .amazonaws.com     │   "AWS:SourceArn": "a │
│   │                    │        │                    │                    │ rn:${AWS::Partition}: │
│   │                    │        │                    │                    │ execute-api:us-east-2 │
│   │                    │        │                    │                    │ :${AWS::AccountId}:${ │
│   │                    │        │                    │                    │ Endpoint}/${EndpointD │
│   │                    │        │                    │                    │ eploymentStageprodB78 │
│   │                    │        │                    │                    │ BEEA0}/*/{proxy+}"    │
│   │                    │        │                    │                    │ }                     │
│ + │ ${HelloHandler.Arn │ Allow  │ lambda:InvokeFunct │ Service:apigateway │ "ArnLike": {          │
│   │ }                  │        │ ion                │ .amazonaws.com     │   "AWS:SourceArn": "a │
│   │                    │        │                    │                    │ rn:${AWS::Partition}: │
│   │                    │        │                    │                    │ execute-api:us-east-2 │
│   │                    │        │                    │                    │ :${AWS::AccountId}:${ │
│   │                    │        │                    │                    │ Endpoint}/test-invoke │
│   │                    │        │                    │                    │ -stage/*/{proxy+}"    │
│   │                    │        │                    │                    │ }                     │
└───┴────────────────────┴────────┴────────────────────┴────────────────────┴───────────────────────┘
IAM Policy Changes
┌───┬────────────────────────────┬──────────────────────────────────────────────────────────────────┐
│   │ Resource                   │ Managed Policy ARN                                               │
├───┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ + │ ${Endpoint/CloudWatchRole} │ arn:${AWS::Partition}:iam::aws:policy/service-role/AmazonAPIGate │
│   │                            │ wayPushToCloudWatchLogs                                          │
└───┴────────────────────────────┴──────────────────────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See http://bit.ly/cdk-2EhF7Np)

Resources
[+] AWS::Lambda::Permission HelloHandler/ApiPermission.ANY.. HelloHandlerApiPermissionANYAC4E141E
[+] AWS::Lambda::Permission HelloHandler/ApiPermission.Test.ANY.. HelloHandlerApiPermissionTestANYDDD56D72
[+] AWS::Lambda::Permission HelloHandler/ApiPermission.ANY..{proxy+} HelloHandlerApiPermissionANYproxy90E90CD6
[+] AWS::Lambda::Permission HelloHandler/ApiPermission.Test.ANY..{proxy+} HelloHandlerApiPermissionTestANYproxy9803526C
[+] AWS::ApiGateway::RestApi Endpoint EndpointEEF1FD8F
[+] AWS::ApiGateway::Deployment Endpoint/Deployment EndpointDeployment318525DAb462c597ccb914d9fc1c10f664ed81ca
[+] AWS::ApiGateway::Stage Endpoint/DeploymentStage.prod EndpointDeploymentStageprodB78BEEA0
[+] AWS::IAM::Role Endpoint/CloudWatchRole EndpointCloudWatchRoleC3C64E0F
[+] AWS::ApiGateway::Account Endpoint/Account EndpointAccountB8304247
[+] AWS::ApiGateway::Resource Endpoint/Default/{proxy+} Endpointproxy39E2174E
[+] AWS::ApiGateway::Method Endpoint/Default/{proxy+}/ANY EndpointproxyANYC09721C5
[+] AWS::ApiGateway::Method Endpoint/Default/ANY EndpointANY485C938B

Outputs
[+] Output Endpoint/Endpoint Endpoint8024A810: {"Value":{"Fn::Join":["",["https://",{"Ref":"EndpointEEF1FD8F"},".execute-api.us-east-2.",{"Ref":"AWS::URLSuffix"},"/",{"Ref":"EndpointDeploymentStageprodB78BEEA0"},"/"]]}}
```

追加したコードにより、12 個の新しいリソースがスタックに追加されることがわかります。

## cdk deploy

デプロイしましょう。

```
cdk deploy
```

## スタックの出力

デプロイが完了すると、次の行にご注目ください。

```text
CdkWorkshopStack.Endpoint8024A810 = https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

これは、API Gateway コンストラクトによって自動的に追加され、API Gateway エンドポイントの URL を含む [スタック出力値](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html) です。

## アプリのテスト

このエンドポイントを `curl` でアクセスしてみましょう。URL をコピーして実行します (プレフィックスとリージョンは異なる可能性があります)。

{{% notice info %}}
[curl](https://curl.haxx.se/) がインストールされていない場合は、お気に入りのウェブブラウザでもこの URL にアクセスできます。
{{% /notice %}}

```
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

出力は次のようになります。

```text
Hello, CDK! You've hit /
```

Webブラウザでも確認できます。

![](./browser.png)

この出力がされていれば、アプリは正常に動作しています。

## 正常に動作していないとき

API Gateway から 5xx エラーを受け取った場合、次の 2つの問題のいずれかが該当しています。

1. Lambda 関数が返した応答は、API Gateway が期待するものではありません。手順を戻って、Lambda の handler 関数が `statusCode`、`body`、`header` フィールドが含まれているか確認してください ([Lambda handler のコード](./200-lambda.html)を参照)。

2. 何らかの理由で Lambda 関数が失敗しました。この Lambda 関数をデバッグするには、[このセクション](../40-hit-counter/500-logs.html)に先取りして、Lambda 関数のログを表示する方法を学習します。

---

お疲れさまでした！ 次の章では再利用可能な独自のコンストラクトを作成します。
