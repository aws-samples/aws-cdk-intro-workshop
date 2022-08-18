+++
title = "パイプラインの作成"
weight = 130
+++

## 空のパイプラインの定義
パイプラインの基本を定義する準備が整いました。

`CdkWorkshop/PipelineStack.cs` ファイルに戻り、次のように編集します。

{{<highlight ts "hl_lines=3-5 15 20-35">}}
using Amazon.CDK;
using Amazon.CDK.AWS.CodeCommit;
using Amazon.CDK.AWS.CodePipeline;
using Amazon.CDK.AWS.CodePipeline.Actions;
using Amazon.CDK.Pipelines;
using Constructs;

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

                // Builds our source code outlined above into a could assembly artifact
                Synth = new ShellStep("Synth", new ShellStepProps{
                    Input = CodePipelineSource.CodeCommit(repo, "master"),  // Where to get source code to build
                    Commands = new string[] {
                        "npm install -g aws-cdk",
                        "sudo apt-get install -y dotnet-sdk-3.1", // Language-specific install cmd
                        "dotnet build"  // Language-specific build cmd
                    }
                }),
            });
        }
    }
}

{{</highlight>}}

### コンポーネントの説明
上記ソースコードは以下の通りに構成されています。

* `new CodePipeline(...)`: 必要な値でパイプラインを初期化します。今後のベースコンポーネントになります。すべてのパイプラインには以下のような構成が必要です。
   * `synth(...)`: パイプラインの `synthAction` の値は、依存関係のインストール、ビルド、ソースから CDK アプリケーションの生成を行うために必要なコマンドを示します。最後に必ず *synth* コマンドで終わる必要があります。NPM ベースのプロジェクトの場合は、`npx cdk synth` になります。
      * synth ステップの `input` の値はCDK ソースコードが格納されているリポジトリを指定します。

## パイプラインをデプロイし、結果を確認
パイプラインを稼働させるためには、変更をコミットして、再度 cdk deploy を実行するだけです。

```
git commit -am "MESSAGE" && git push
npx cdk deploy
```

CDK パイプラインはソースリポジトリのコミットごとに自動的に更新するので、このコマンドを実行するのはこれで *最後* です！

デプロイが完了したら [CodePipeline コンソール](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) を開くと、新しいパイプラインを確認できます。パイプラインを開くと、以下のような画面を確認できます。

![](./pipeline-init.png)
