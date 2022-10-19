+++
title = "パイプラインの作成"
weight = 130
+++

## 空のパイプラインの定義
パイプラインの基本を定義する準備が整いました。

新しいパッケージを使うため、最初に `npm install aws-cdk-lib/pipelines` を実行します。

`lib/pipeline-stack.ts` ファイルに戻り、次のように編集します。

{{<highlight ts "hl_lines=4 15-31">}}
import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';
import {CodeBuildStep, CodePipeline, CodePipelineSource} from "aws-cdk-lib/pipelines";

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // This creates a new CodeCommit repository called 'WorkshopRepo'
        const repo = new codecommit.Repository(this, 'WorkshopRepo', {
            repositoryName: "WorkshopRepo"
        });

        // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
       const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'WorkshopPipeline',
            synth: new CodeBuildStep('SynthStep', {
                    input: CodePipelineSource.codeCommit(repo, 'master'),
                    installCommands: [
                        'npm install -g aws-cdk'
                    ],
                    commands: [
                        'npm ci',
                        'npm run build',
                        'npx cdk synth'
                    ]
                }
            )
        });
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
