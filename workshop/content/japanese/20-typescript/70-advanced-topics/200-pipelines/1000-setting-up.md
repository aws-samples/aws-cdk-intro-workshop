+++
title = "パイプライン入門"
weight = 110
+++

> 注意 : このワークショップの章は、前の全ての章を完了していることを前提としています。完了していないか、またはこの部分のみ検証する場合は、[こちら](https://github.com/aws-samples/aws-cdk-intro-workshop/tree/master/code/typescript/tests-workshop) のコードを利用すれば、テストを追加した直後のプロジェクトの状態に設定することができます。

## パイプラインのスタックの作成
最初のステップでは、パイプラインを持つスタックを作成します。
実際の「本番」アプリケーションとは分離するので、完全に独立させる必要があります。

`lib` フォルダの中で `pipeline-stack.ts` という新しいファイルを作成します。ファイルに以下の内容を追加します。

{{<highlight ts>}}
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Pipeline code goes here
    }
}
{{</highlight>}}

内容に見覚えがありますか？この時点では、パイプラインも他の CDK スタックと同じです。

## CDK デプロイのエントリーポイントの変更
パイプラインはアプリケーションスタックをデプロイするためにあるので、メインの CDK アプリケーションに実際のアプリケーションをデプロイすることはもう必要ありません。代わりに、エントリポイントを変更してパイプラインをデプロイするようにすれば、アプリケーションはそのパイプラインにデプロイされます。

それを実現するために、`bin/cdk-workshop.ts` のコードを以下のように編集します。

{{<highlight ts "hl_lines=2 5">}}
import * as cdk from 'aws-cdk-lib';
import { WorkshopPipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
new WorkshopPipelineStack(app, 'CdkWorkshopPipelineStack');
{{</highlight>}}


これで準備が整いました！

# パイプラインを作りましょう！

{{< nextprevlinks >}}