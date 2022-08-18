+++
title = "アプリケーションの追加"
weight = 140
+++

## ステージの作成
この時点では、自動的に自分を更新する CDK パイプラインができています。*しかし*、それ以外は何もしていません。アプリケーションをデプロイするには、そのためのステージを追加する必要があります。

`CdkWorkshop` フォルダに新規に `PipelineStage.cs` というファイルを以下の内容で作成します。

{{<highlight ts>}}
using Amazon.CDK;
using Amazon.CDK.Pipelines;
using Constructs;

namespace CdkWorkshop
{
    public class WorkshopPipelineStage : Stage
    {
        public WorkshopPipelineStage(Construct scope, string id, StageProps props = null)
            : base(scope, id, props)
        {
            var service = new CdkWorkshopStack(this, "WebService");
        }
    }
}
{{</highlight>}}

これは新しい `Stage` (パイプラインのコンポーネント) を宣言し、そのステージでアプリケーションスタックをインスタンス化します。

## パイプラインにステージを追加する
次のコードを `CdkWorkshop/PipelineStack.cs` に追加して、ステージをパイプラインに追加する必要があります。

{{<highlight ts "hl_lines=39-40">}}
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
            // Creates a CodeCommit repository called 'WorkshopRepo'
            var repo = new Repository(this, "WorkshopRepo", new RepositoryProps
            {
                RepositoryName = "WorkshopRepo"
            });

            // The basic pipeline declaration. This sets the initial structure
            // of our pipeline
            var pipeline = new CodePipeline(this, "Pipeline", new CodePipelineProps
            {
                PipelineName = "WorkshopPipeline",

                // Builds our source code outlined above into a cloud assembly artifact
                Synth = new ShellStep("Synth", new ShellStepProps{
                    Input = CodePipelineSource.CodeCommit(repo, "master"),  // Where to get source code to build
                    Commands = new string[] {
                        "npm install -g aws-cdk",
                        "sudo apt-get install -y dotnet-sdk-3.1",  // Language-specific install cmd
                        "dotnet build",  // Language-specific build cmd
                        "npx cdk synth"
                    }
                }),
            });

            var deploy = new WorkshopPipelineStage(this, "Deploy");
            var deployStage = pipeline.AddStage(deploy);
        }
    }
}
{{</highlight>}}

`WorkshopPipelineStage` をインポートし、インスタンスが作成されます。
場合によって、このステージの複数のインスタンスを作成することがあります (たとえば、本番環境と開発/テスト環境のデプロイを分ける場合など)。

次に、このステージをパイプラインに追加します (`pipeline.addStage(deploy);`)。CDK パイプラインの `Stage` とは、特定の環境にて一緒にデプロイする必要のある 1つ以上の CDK スタックのセットを表します。

## コミット/デプロイ
アプリケーションをデプロイするためのコードを追加できたので、後は変更をコミットしてリポジトリにプッシュするだけです。


```
git commit -am "Add deploy stage to pipeline" && git push
```

プッシュが完了したら、[CodePipeline コンソール](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) でパイプラインの実行状況を確認できます (しばらく時間がかかる場合があります)。
