+++
title = "パイプラインの改善"
weight = 150
+++

## エンドポイントの取得
よく考えると、アプリケーションがパイプラインに自動的にデプロイされることによって一つ課題が発生します。
アプリケーションのエンドポイント (`TableViewer` と `LambdaRestApi`) を簡単に取得できる方法がありません。
それらを明確に公開するために少しのソースコードを追加しましょう。

まず `CdkWorkshop/CdkWorkshopStack.cs` を編集して、スタックのプロパティとして公開するようにします。

{{<highlight ts "hl_lines=11-12 40-48">}}
using Amazon.CDK;
using Amazon.CDK.AWS.APIGateway;
using Amazon.CDK.AWS.Lambda;
using Cdklabs.DynamoTableViewer;
using Constructs;

namespace CdkWorkshop
{
    public class CdkWorkshopStack : Stack
    {
        public readonly CfnOutput HCViewerUrl;
        public readonly CfnOutput HCEndpoint;

        // Defines a new lambda resource
        public CdkWorkshopStack(Construct parent, string id, IStackProps props = null) : base(parent, id, props)
        {
            var hello = new Function(this, "HelloHandler", new FunctionProps
            {
                Runtime = Runtime.NODEJS_14_X,
                Code = Code.FromAsset("lambda"),
                Handler = "hello.handler"
            });

            var helloWithCounter = new HitCounter(this, "HelloHitCounter", new HitCounterProps
            {
                Downstream = hello
            });

            var gateway = new LambdaRestApi(this, "Endpoint", new LambdaRestApiProps
            {
                Handler = helloWithCounter.Handler
            });

            var tv = new TableViewer(this, "ViewerHitCount", new TableViewerProps
            {
                Title = "Hello Hits",
                Table = helloWithCounter.MyTable
            });

            this.HCViewerUrl = new CfnOutput(this, "TableViewerUrl", new CfnOutputProps
            {
                Value = tv.Endpoint
            });

            this.HCEndpoint = new CfnOutput(this, "GatewayUrl", new CfnOutputProps
            {
                Value = gateway.Url
            });
        }
    }
}
{{</highlight>}}

`HCViewerUrl` と `HCEnpoint` の出力を追加することで、HitCounter アプリケーションに必要なエンドポイントを公開します。
そのために、`CfnOutput` コアコンストラクトを使用して、その出力を CloudFormation スタックの出力として宣言しています (後ほど説明)。

今回の変更をリポジトリにコミットし (`git commit -am "MESSAGE" && git push`)、[ CloudFormation コンソール](https://console.aws.amazon.com/cloudformation) を開きます。スタックが 3つあります。

* `CDKToolkit`: こちらは統合 CDK スタックです (ブートストラップされたアカウントでは常に存在するはずです)。特に気にする必要がありません。
* `WorkshopPipelineStack`: こちらはパイプラインを定義するスタックです。今回確認したいものではありません。
* `Deploy-WebService`: こちらはアプリケーションです。このスタックの名前にクリックし、`出力` タブを選択します。4つのエンドポイント (重複した値 2組) が表示されます。そのうちの 2つ、`EndpointXXXXXX` と `ViewerHitCounterViewerEndpointXXXXXXX` は CloudFormation によってデフォルトで生成されていて、残りの 2つは明示的に宣言した出力になります。

![](./stack-outputs.png)

出力 `TableViewerUrl` の値をクリックすると、最初のワークショップで作成した hitcounter テーブルが表示されます。

## バリデーションテストの追加
これでアプリケーションがデプロイされましたが、テストのない CD パイプラインは完成だとは言えません。

まず、エンドポイントが稼働しているかどうかを確認するために、簡単にアクセスするテストから始めましょう。
`CdkWorkshop/PipelineStack.cs` に戻り、以下の通り変更を加えます。

{{<highlight ts "hl_lines=7 19-34">}}
using Amazon.CDK;
using Amazon.CDK.AWS.CodeCommit;
using Amazon.CDK.AWS.CodePipeline;
using Amazon.CDK.AWS.CodePipeline.Actions;
using Amazon.CDK.Pipelines;
using Constructs;
using System.Collections.Generic;

namespace CdkWorkshop
{
    public class WorkshopPipelineStack : Stack
    {
        public WorkshopPipelineStack(Construct parent, string id, IStackProps props = null) : base(parent, id, props)
        {
            // PIPELINE CODE HERE...

            var deploy = new WorkshopPipelineStage(this, "Deploy");
            var deployStage = pipeline.AddApplicationStage(deploy);
            deployStage.AddPost(new ShellStep("TestViewerEndpoint", new ShellStepProps{
                EnvFromCfnOutputs = new Dictionary<string, CfnOutput> {
                    { "ENDPOINT_URL", /* TBD */ }
                },
                Commands = new string[] { "curl -Ssf $ENDPOINT_URL" }
            }));
            deployStage.AddPost(new ShellStep("TestAPIGatewayEndpoint", new ShellStepProps{
                EnvFromCfnOutputs = new Dictionary<string, CfnOutput> {
                    { "ENDPOINT_URL", /* TBD */ }
                },
                Commands = new string[] {
                    "curl -Ssf $ENDPOINT_URL/",
                    "curl -Ssf $ENDPOINT_URL/hello",
                    "curl -Ssf $ENDPOINT_URL/test"
                }
            }));
        }
    }
}
{{</highlight>}}

CDK パイプラインの `deployStage.AddPost(...)` を使って 2つのステップを追加します。
デプロイステージに TableViewer エンドポイントと APIGateway エンドポイントをそれぞれテストする 2つのアクションを追加します。

> 注意 : 既にいくつかの値を持っている tableview を参照する APIGateway エンドポイントに対して `curl` リクエストを送信します

ソースコードには、それらのエンドポイントの URL をまだ設定していません。それは、このスタックにまだ公開されていないからです。
`CdkWorkshop/PipelineStage.cs` を少し変更するだけで、エンドポイントを公開できます。

{{<highlight ts "hl_lines=9-10 15 17-18">}}
using Amazon.CDK;
using Amazon.CDK.Pipelines;
using Constructs;

namespace CdkWorkshop
{
    public class WorkshopPipelineStage : Stage
    {
        public readonly CfnOutput HCViewerUrl;
        public readonly CfnOutput HCEndpoint;

        public WorkshopPipelineStage(Construct scope, string id, StageProps props = null)
            : base(scope, id, props)
        {
            var service = new CdkWorkshopStack(this, "WebService");

            this.HCEndpoint = service.HCEndpoint;
            this.HCViewerUrl = service.HCViewerUrl;
        }
    }
}
{{</highlight>}}

これで、デプロイステージの `CfnOutput` を取得することで、`CdkWorkshop/PipelineStack.cs` のアクションにそれらの値を追加できます。

{{<highlight ts "hl_lines=5 15">}}
// CODE HERE...

deployStage.AddPost(new ShellStep("TestViewerEndpoint", new ShellStepProps{
    EnvFromCfnOutputs = new Dictionary<string, CfnOutput> {
        { "ENDPOINT_URL", deploy.HCViewerUrl }
    },
    Commands = new string[] { "curl -Ssf $ENDPOINT_URL" }
}));
deployStage.AddPost(new ShellStep("TestAPIGatewayEndpoint", new ShellStepProps{
    EnvFromCfnOutputs = new Dictionary<string, CfnOutput> {
        { "ENDPOINT_URL", deploy.HCEndpoint }
    },
    Commands = new string[] {
        "curl -Ssf $ENDPOINT_URL/",
        "curl -Ssf $ENDPOINT_URL/hello",
        "curl -Ssf $ENDPOINT_URL/test"
    }
}));
{{</highlight>}}

## コミットして、結果を確認
ソースコードの変更をコミットし、パイプラインがアプリケーションを再デプロイすることを待ちます。しばらくすると、[CodePipeline コンソール](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) にてパイプラインの `Deploy` ステージ内に 2つのテストアクションが含まれていることを確認できます。

![](./pipeline-tests.png)

おめでとうございます！アプリケーションのテストも含む完璧な CD パイプラインを作成できました！興味があれば、コンソールで作成されたスタックの詳細を確認したり、[API リファレンス](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html) の CDK パイプラインのセクションを確認してみてください。お持ちのアプリケーションにも CDK パイプラインを作ってみるのはいかがでしょうか？
