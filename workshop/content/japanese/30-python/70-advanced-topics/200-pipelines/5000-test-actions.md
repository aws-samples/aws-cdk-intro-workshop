+++
title = "パイプラインの改善"
weight = 150
+++

## エンドポイントの取得
よく考えると、アプリケーションがパイプラインに自動的にデプロイされることによって一つ課題が発生します。
アプリケーションのエンドポイント (`TableViewer` と `LambdaRestApi`) を簡単に取得できる方法がありません。
それらを明確に公開するために少しのソースコードを追加しましょう。

まずは、`cdk_workshop/cdk_workshop_stack.py` を編集して、スタックのプロパティとして公開するようにします。

{{<highlight python "hl_lines=13-19 37 42 48-56">}}
from constructs import Construct
from aws_cdk import (
    Stack,
    CfnOutput,
    aws_lambda as _lambda,
    aws_apigateway as apigw,
)
from cdk_dynamo_table_view import TableViewer
from .hitcounter import HitCounter

class CdkWorkshopStack(Stack):

    @property
    def hc_endpoint(self):
        return self._hc_endpoint

    @property
    def hc_viewer_url(self):
        return self._hc_viewer_url

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Defines an AWS Lambda resource
        my_lambda = _lambda.Function(
            self, 'HelloHandler',
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.from_asset('lambda'),
            handler='hello.handler',
        )

        hello_with_counter = HitCounter(
            self, 'HelloHitCounter',
            downstream=my_lambda
        )

        gateway = apigw.LambdaRestApi(
            self, 'Endpoint',
            handler=hello_with_counter._handler
        )

        tv = TableViewer(
            self, 'ViewHitCounter',
            title='Hello Hits',
            table=hello_with_counter.table
        )

        self._hc_endpoint = CfnOutput(
            self, 'GatewayUrl',
            value=gateway.url
        )

        self._hc_viewer_url = CfnOutput(
            self, 'TableViewerUrl',
            value=tv.endpoint
        )

{{</highlight>}}

`hc_viewer_url` と `hc_endpoint` の出力を追加することで、HitCounter アプリケーションに必要なエンドポイントを公開します。
そのために、`CfnOutput` コアコンストラクトを使用して、その出力を CloudFormation スタックの出力として宣言しています (後ほど説明)。


今回の変更をリポジトリにコミットし (`git commit -am "MESSAGE" && git push`)、[ CloudFormation コンソール](https://console.aws.amazon.com/cloudformation) を開きます。スタックが 3つあります。

* `CDKToolkit`: こちらは統合 CDK スタックです (ブートストラップされたアカウントでは常に存在するはずです)。特に気にする必要がありません。
* `WorkshopPipelineStack`: こちらはパイプラインを定義するスタックです。今回確認したいものではありません。
* `Deploy-WebService`: こちらはアプリケーションです。このスタックの名前にクリックし、`出力` タブを選択します。4つのエンドポイント (重複した値 2組) が表示されます。そのうちの 2つ、`EndpointXXXXXX` と `ViewerHitCounterViewerEndpointXXXXXXX` は CloudFormation によってデフォルトで生成されていて、残りの 2つは明示的に宣言した出力になります。


![](/stack-outputs.png)

出力 `TableViewerUrl` の値をクリックすると、最初のワークショップで作成した hitcounter テーブルが表示されます。

## バリデーションテストの追加
これでアプリケーションがデプロイされましたが、テストのない CD パイプラインは完成だとは言えません。

まず、エンドポイントが稼働しているかどうかを確認するために、簡単にアクセスするテストから始めましょう。
`cdk_workshop/pipeline_stack.py` に戻り、以下の通り変更を加えます。

{{<highlight python "hl_lines=16-39">}}
from constructs import Construct
from aws_cdk import (
    Stack,
    aws_codecommit as codecommit,
    pipelines as pipelines
)
from pipeline_stage import WorkshopPipelineStage

class WorkshopPipelineStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # PIPELINE CODE HERE...

        deploy = WorkshopPipelineStage(self, "Deploy")
        deploy_stage = pipeline.add_stage(deploy)
        deploy_stage.add_post(
            pipelines.ShellStep(
                "TestViewerEndpoint",
                env_from_cfn_outputs={
                    "ENDPOINT_URL": # TBD
                },
                commands=["curl -Ssf $ENDPOINT_URL"],
            )
        )
        deploy_stage.add_post(
            pipelines.ShellStep(
                "TestAPIGatewayEndpoint",
                env_from_cfn_outputs={
                    "ENDPOINT_URL": # TBD
                },
                commands=[
                    "curl -Ssf $ENDPOINT_URL",
                    "curl -Ssf $ENDPOINT_URL/hello",
                    "curl -Ssf $ENDPOINT_URL/test",
                ],
            )
        )

{{</highlight>}}

CDK パイプラインの `deployStage.AddPost(...)` を使って 2つのステップを追加します。
デプロイステージに TableViewer エンドポイントと APIGateway エンドポイントをそれぞれテストする 2つのアクションを追加します。

> 注意 : 既にいくつかの値を持っている tableview を参照する APIGateway エンドポイントに対して `curl` リクエストを送信します。

ソースコードには、それらのエンドポイントの URL をまだ設定していません。それは、このスタックにまだ公開されていないからです。

`cdk_workshop/pipeline_stage.py` を少し変更するだけで、エンドポイントを公開できます。

{{<highlight python "hl_lines=9-15 22-23">}}
from constructs import Construct
from aws_cdk import (
    Stage
)
from .cdk_workshop_stack import CdkWorkshopStack

class WorkshopPipelineStage(Stage):

    @property
    def hc_endpoint(self):
        return self._hc_endpoint

    @property
    def hc_viewer_url(self):
        return self._hc_viewer_url

    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        service = CdkWorkshopStack(self, 'WebService')

        self._hc_enpdoint = service.hc_endpoint
        self._hc_viewer_url = service.hc_viewer_url

{{</highlight>}}

これで、デプロイステージの `cfn_output` を取得することで、`cdk_workshop/pipeline_stack.py` のアクションにそれらの値を追加できます。

{{<highlight python "hl_lines=9 18">}}
  # CODE HERE...

    deploy = WorkshopPipelineStage(self, "Deploy")
        deploy_stage = pipeline.add_stage(deploy)
        deploy_stage.add_post(
            pipelines.ShellStep(
                "TestViewerEndpoint",
                env_from_cfn_outputs={
                    "ENDPOINT_URL": deploy.hc_viewer_url
                },
                commands=["curl -Ssf $ENDPOINT_URL"],
            )
        )
        deploy_stage.add_post(
            pipelines.ShellStep(
                "TestAPIGatewayEndpoint",
                env_from_cfn_outputs={
                    "ENDPOINT_URL": deploy.hc_endpoint
                },
                commands=[
                    "curl -Ssf $ENDPOINT_URL",
                    "curl -Ssf $ENDPOINT_URL/hello",
                    "curl -Ssf $ENDPOINT_URL/test",
                ],
            )
        )

{{</highlight>}}

## コミットして、結果を確認
ソースコードの変更をコミットし、パイプラインがアプリケーションを再デプロイすることを待ちます。しばらくすると、[CodePipeline コンソール](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) にてパイプラインの `Deploy` ステージ内に 2つのテストアクションが含まれていることを確認できます。

![](./pipeline-tests.png)

おめでとうございます！アプリケーションのテストも含む完璧な CD パイプラインを作成できました！興味があれば、コンソールで作成されたスタックの詳細を確認したり、[API リファレンス](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html) の CDK パイプラインのセクションを確認してみてください。お持ちのアプリケーションにも CDK パイプラインを作ってみるのはいかがでしょうか？
