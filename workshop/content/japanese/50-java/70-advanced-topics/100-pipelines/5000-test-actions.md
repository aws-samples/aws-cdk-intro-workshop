+++
title = "パイプラインの改善"
weight = 150
+++

## エンドポイントの取得
よく考えると、アプリケーションがパイプラインに自動的にデプロイされることによって一つ課題が発生します。
アプリケーションのエンドポイント (`TableViewer` と `APIGateway`) を簡単に取得できる方法がありません。
それらを明確に公開するために少しのソースコードを追加しましょう。

まずは、`CdkWorkshopStack.java` を編集して、スタックのプロパティとして公開するようにします。

{{<highlight java "hl_lines=8 17-18 50-56">}}
package com.myorg;

import io.github.cdklabs.dynamotableviewer.TableViewer;

import software.constructs.Construct;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.CfnOutput;

import software.amazon.awscdk.services.apigateway.LambdaRestApi;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;

public class CdkWorkshopStack extends Stack {

    public final CfnOutput hcViewerUrl;
    public final CfnOutput hcEndpoint;

    public CdkWorkshopStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public CdkWorkshopStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        // Defines a new lambda resource
        final Function hello = Function.Builder.create(this, "HelloHandler")
            .runtime(Runtime.NODEJS_14_X)    // execution environment
            .code(Code.fromAsset("lambda"))  // code loaded from the "lambda" directory
            .handler("hello.handler")        // file is "hello", function is "handler"
            .build();

        // Defines our hitcounter resource
        final HitCounter helloWithCounter = new HitCounter(this, "HelloHitCounter", HitCounterProps.builder()
            .downstream(hello)
            .build());

        // Defines an API Gateway REST API resource backed by our "hello" function
        final LambdaRestApi gateway = LambdaRestApi.Builder.create(this, "Endpoint")
            .handler(helloWithCounter.getHandler())
            .build();

        // Defines a viewer for the HitCounts table
        final TableViewer tv = TableViewer.Builder.create(this, "ViewerHitCount")
            .title("Hello Hits")
            .table(helloWithCounter.getTable())
            .build();

        hcViewerUrl = CfnOutput.Builder.create(this, "TableViewerUrl")
            .value(tv.getEndpoint())
            .build();

        hcEndpoint = CfnOutput.Builder.create(this, "GatewayUrl")
            .value(gateway.getUrl())
            .build();
    }
}

{{</highlight>}}

`hcViewerUrl` と `hcEnpoint` の出力を追加することで、HitCounter アプリケーションに必要なエンドポイントを公開します。
そのために、`CfnOutput` コアコンストラクトを使用して、その出力を CloudFormation スタックの出力として宣言しています (後ほど説明)。

今回の変更をリポジトリにコミットし (`git commit -am "MESSAGE" && git push`)、[CloudFormation コンソール](https://console.aws.amazon.com/cloudformation) を開きます。すると、スタックが 3つあることが確認できます。

* `CDKToolkit`: こちらは統合 CDK スタックです (ブートストラップされたアカウントでは常に存在するはずです)。特に気にする必要がありません。
* `WorkshopPipelineStack`: こちらはパイプラインを定義するスタックです。今回確認したいものではありません。
* `Deploy-WebService`: こちらはアプリケーションです。このスタックの名前にクリックし、`出力` タブを選択します。4つのエンドポイント (重複した値 2組) が表示されます。そのうちの 2つ、`EndpointXXXXXX` と `ViewerHitCounterViewerEndpointXXXXXXX` は CloudFormation によってデフォルトで生成されていて、残りの 2つは明示的に宣言した出力になります。

![](./stack-outputs.png)

出力 `TableViewerUrl` の値をクリックすると、最初のワークショップで作成した hitcounter テーブルが表示されます。

## バリデーションテストの追加
これでアプリケーションがデプロイされましたが、テストのない CD パイプラインは完成だとは言えません。

まず、エンドポイントが稼働しているかどうかを確認するために、簡単にアクセスするテストから始めましょう。
`WorkshopPipelineStack.java` に戻り、以下の通り変更を加えます。

{{<highlight java "hl_lines=12 29-45">}}
package com.myorg;

import java.util.List;
import java.util.Map;

import software.constructs.Construct;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.pipelines.CodeBuildStep;
import software.amazon.awscdk.pipelines.CodePipeline;
import software.amazon.awscdk.pipelines.CodePipelineSource;
import software.amazon.awscdk.pipelines.StageDeployment;
import software.amazon.awscdk.services.codecommit.Repository;
import software.amazon.awscdk.services.codepipeline.actions.CodeCommitSourceAction;

public class WorkshopPipelineStack extends Stack {
    public WorkshopPipelineStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public WorkshopPipelineStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        // PIPELINE CODE HERE

        final WorkshopPipelineStage deploy = new WorkshopPipelineStage(this, "Deploy");
        StageDeployment stageDeployment = pipeline.addStage(deploy);

        stageDeployment.addPost(
                CodeBuildStep.Builder.create("TestViewerEndpoint")
                        .projectName("TestViewerEndpoint")
                        .commands(List.of("curl -Ssf $ENDPOINT_URL"))
                        .envFromCfnOutputs(Map.of("ENDPOINT_URL",  /* TBD */))
                        .build(),

                CodeBuildStep.Builder.create("TestAPIGatewayEndpoint")
                        .projectName("TestAPIGatewayEndpoint")
                        .envFromCfnOutputs(Map.of("ENDPOINT_URL",  /* TBD */))
                        .commands(List.of(
                                "curl -Ssf $ENDPOINT_URL",
                                "curl -Ssf $ENDPOINT_URL/hello",
                                "curl -Ssf $ENDPOINT_URL/test"
                        ))
                        .build()
        );
    }
}
{{</highlight>}}

CDK パイプラインの `stageDeployment.addPost(...)` を使ってデプロイメント後のステップを追加します。デプロイステージに、TableViewer エンドポイントと APIGateway エンドポイントをそれぞれテストする 2 つのアクションを追加します。

> 注意 : 既にいくつかの値を持っている tableview を参照する APIGateway エンドポイントに対して `curl` リクエストを送信します

ソースコードには、それらのエンドポイントの URL をまだ設定していません。それは、このスタックにまだ公開されていないからです。

`WorkshopPipelineStage.java` を少し変更するだけで、エンドポイントを公開できます。

{{<highlight java "hl_lines=6 10-11 20 22-23">}}
package com.myorg;

import software.amazon.awscdk.Stage;
import software.constructs.Construct;
import software.amazon.awscdk.StageProps;
import software.amazon.awscdk.CfnOutput;

public class WorkshopPipelineStage extends Stage {

    public final CfnOutput hcViewerUrl;
    public final CfnOutput hcEndpoint;

    public WorkshopPipelineStage(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public WorkshopPipelineStage(final Construct scope, final String id, final StageProps props) {
        super(scope, id, props);

        final CdkWorkshopStack service = new CdkWorkshopStack(this, "WebService");

        hcViewerUrl = service.hcViewerUrl;
        hcEndpoint = service.hcEndpoint;
    }
}
{{</highlight>}}

これで、パイプラインスタックの `StackOutput` を取得することで、これらの値を `WorkshopPipelineStack.java` のアクションにそれらの値を追加できます。

{{<highlight java "hl_lines=9 14">}}
        // OTHER CODE HERE...
        final WorkshopPipelineStage deploy = new WorkshopPipelineStage(this, "Deploy");
        StageDeployment stageDeployment = pipeline.addStage(deploy);

        stageDeployment.addPost(
                CodeBuildStep.Builder.create("TestViewerEndpoint")
                        .projectName("TestViewerEndpoint")
                        .commands(List.of("curl -Ssf $ENDPOINT_URL"))
                        .envFromCfnOutputs(Map.of("ENDPOINT_URL",  deploy.hcViewerUrl))
                        .build(),

                CodeBuildStep.Builder.create("TestAPIGatewayEndpoint")
                        .projectName("TestAPIGatewayEndpoint")
                        .envFromCfnOutputs(Map.of("ENDPOINT_URL",  deploy.hcEndpoint))
                        .commands(List.of(
                                "curl -Ssf $ENDPOINT_URL",
                                "curl -Ssf $ENDPOINT_URL/hello",
                                "curl -Ssf $ENDPOINT_URL/test"
                        ))
                        .build()
{{</highlight>}}

## コミットして、結果を確認
ソースコードの変更をコミットし、パイプラインがアプリケーションを再デプロイすることを待ちます。しばらくすると、[CodePipeline コンソール](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) にてパイプラインの `Deploy` ステージ内に 2つのテストアクションが含まれていることを確認できます。

![](./pipeline-tests.png)

おめでとうございます！アプリケーションのテストも含む完璧な CD パイプラインを作成できました！興味があれば、コンソールで作成されたスタックの詳細を確認したり、[API リファレンス](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html) の CDK パイプラインのセクションを確認してみてください。お持ちのアプリケーションにも CDK パイプラインを作ってみるのはいかがでしょうか？

{{< nextprevlinks >}}