+++
title = "パイプラインの作成"
weight = 130
+++

## 空のパイプラインの定義
パイプラインの基本を定義する準備が整いました。

`WorkshopPipelineStack.java` ファイルに戻り、次のように編集します。

{{<highlight java "hl_lines=9-11 30-44">}}
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

import software.amazon.awscdk.services.codepipeline.actions.CodeCommitSourceAction;

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
    }
}
{{</highlight>}}

### コンポーネントの説明
上記ソースコードは以下の通りに構成されています。

* `CodePipeline.Builder.create(...)`: 必要な値でパイプラインを初期化します。これが今後のベースコンポーネントになります。すべてのパイプラインには以下のような構成が必要です。
   * `synth(...)`: パイプラインの `synthAction` は、`input`によって生成されたソースアーティファクトを取得し、`commands`に基づいてアプリケーションをビルドします。この後には常に `npx cdk synth` が続きます
      * synth ステップの `input` は、指定されたリポジトリのソースコードをチェックし、アーティファクトを生成します。 

## パイプラインをデプロイし、結果を確認
パイプラインを稼働させるためには、変更をコミットして、再度 cdk deploy を実行するだけです。


```
git commit -am "MESSAGE" && git push
mvn package
npx cdk deploy
```

CdkPipelines はソースリポジトリのコミットごとに自動的に更新するので、このコマンドを実行するのはこれで *最後* です！

デプロイが完了したら [CodePipeline コンソール](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) を開くと、新しいパイプラインを確認できます。パイプラインを開くと、以下のような画面を確認できます。

![](./pipeline-init.png)

{{< nextprevlinks >}}