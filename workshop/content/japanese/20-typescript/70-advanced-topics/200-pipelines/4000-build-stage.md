+++
title = "アプリケーションの追加"
weight = 140
+++

## ステージの作成
この時点では、自動的に自分を更新する CDK パイプラインができています。*しかし*、それ以外は何もしていません。アプリケーションをデプロイするには、そのためのステージを追加する必要があります。

`lib` フォルダに新規に `pipeline-stage.ts` というファイルを以下の内容で作成します。

{{<highlight ts>}}
import { CdkWorkshopStack } from './cdk-workshop-stack';
import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class WorkshopPipelineStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        new CdkWorkshopStack(this, 'WebService');
    }
}
{{</highlight>}}

これは新しい `Stage` (パイプラインのコンポーネント) を宣言し、そのステージでアプリケーションスタックをインスタンス化します。

この時点であなたのエディターは、あなたが何か間違ったことをしていると言っているかもしれません。これは、現在のアプリケーションスタックが、パイプラインによってデプロイされるように構成されていないためです。 `lib/cdk-workshop-stack.ts` を開き、次の変更を加えます。


{{<highlight ts "hl_lines=9">}}
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The rest of your code...
{{</highlight>}}

このスタックの `scope` パラメータは、`cdk.App` として定義されていました。つまり、コンストラクトツリーでは、app の子である必要があります。スタックはパイプラインによってデプロイされるため、app の子ではなくなり、タイプを `Construct` に変更する必要があります。

## パイプラインにステージを追加する
次のコードを `lib/pipeline-stack.ts` に追加して、ステージをパイプラインに追加する必要があります。

{{<highlight ts "hl_lines=4 18 34-35">}}
import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';
import {WorkshopPipelineStage} from './pipeline-stage';
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

        const deploy = new WorkshopPipelineStage(this, 'Deploy');
        const deployStage = pipeline.addStage(deploy);
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

<!--
![](./pipeline-fail.png)

Uh oh! The pipeline synth failed. Lets take a look and see why.

![](./pipeline-fail-log.png)

It looks like the build step is failing to find our Lambda function.

## Fix Lambda Path
We are currently locating our Lambda code based on the directory that `cdk synth` is being executed in. Since CodeBuild uses a different folder structure than you might for development, it can't find the path to our Lambda code. We can fix that with a small change in `lib/cdk-workshop-stack.ts`:

{{<highlight ts "hl_lines=6 14">}}
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';
import * as path from 'path';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(path.resolve(__dirname, '../lambda')),
      handler: 'hello.handler',

    });
{{</highlight>}}

Here we are explicitly navigating up a level from the current directory to find the Lambda code.

If we commit the change (`git commit -am "fix lambda path" && git push`) and take a look at our pipeline again, we can see that our pipeline now builds without error!

-->

![](./pipeline-succeed.png)

成功しました !

{{< nextprevlinks >}}