+++
title = "アプリケーションの追加"
weight = 140
+++

## ステージの作成
この時点では、自動的に自分を更新する CDK パイプラインができています。*しかし*、それ以外は何もしていません。アプリケーションをデプロイするには、そのためのステージを追加する必要があります。

`CdkWorkshop` 内に `WorkshopPipelineStage.java` を作成し、以下のコードを含めるようにします。

{{<highlight java>}}
package com.myorg;

import software.amazon.awscdk.Stage;
import software.constructs.Construct;
import software.amazon.awscdk.StageProps;

public class WorkshopPipelineStage extends Stage {
    public WorkshopPipelineStage(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public WorkshopPipelineStage(final Construct scope, final String id, final StageProps props) {
        super(scope, id, props);

        new CdkWorkshopStack(this, "WebService");
    }
}
{{</highlight>}}

これは新しい `Stage` (パイプラインのコンポーネント) を宣言し、そのステージでアプリケーションスタックをインスタンス化します。

## パイプラインにステージを追加する
次のコードを `WorkshopPipelineStack.java` に追加して、ステージをパイプラインに追加する必要があります。


{{<highlight java "hl_lines=43-44">}}
package com.myorg;

import java.util.List;
import java.util.Map;

import software.constructs.Construct;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.pipelines.CodeBuildStep;
import software.amazon.awscdk.pipelines.CodePipeline;
import software.amazon.awscdk.pipelines.CodePipelineSource;

import software.amazon.awscdk.services.codecommit.Repository;

public class WorkshopPipelineStack extends Stack {
    public WorkshopPipelineStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public WorkshopPipelineStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        // This creates a new CodeCommit repository called 'WorkshopRepo'
        final Repository repo = Repository.Builder.create(this, "WorkshopRepo")
            .repositoryName("WorkshopRepo")
            .build();

        // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
        final CodePipeline pipeline = CodePipeline.Builder.create(this, "Pipeline")
                .pipelineName("WorkshopPipeline")
                .synth(CodeBuildStep.Builder.create("SynthStep")
                        .input(CodePipelineSource.codeCommit(repo, "master"))
                        .installCommands(List.of(
                                "npm install -g aws-cdk"   // Commands to run before build
                        ))
                        .commands(List.of(
                                "mvn package",            // Language-specific build commands
                                "npx cdk synth"           // Synth command (always same)
                        )).build())
                .build();

        final WorkshopPipelineStage deploy = new WorkshopPipelineStage(this, "Deploy");
        pipeline.addStage(deploy);
    }
}
{{</highlight>}}


これにより、 `WorkshopPipelineStage` のインスタンスがインポートされ、作成されます。場合によって、このステージの複数のインスタンスを作成することがあります (たとえば、本番環境と開発/テスト環境のデプロイを分ける場合など)。

次に、このステージをパイプラインに追加します (`pipeline.addStage(deploy);`)。 CodePipeline の `ApplicationStage` は、すべての CDK デプロイメントアクションを表します。

## コミット/デプロイ
アプリケーションをデプロイするためのコードを追加できたので、後は変更をコミットしてリポジトリにプッシュするだけです。

```
git commit -am "Add deploy stage to pipeline" && git push
```

プッシュが完了したら、[CodePipeline コンソール](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) でパイプラインの実行状況を確認できます (しばらく時間がかかる場合があります)。

![](./pipeline-succeed.png)

成功しました !
