+++
title = "パイプライン入門"
weight = 110
+++

> 注意 : このワークショップの章は、前の全ての章を完了していることを前提としています。完了していないか、またはこの部分のみ検証する場合は、[こちら](https://github.com/aws-samples/aws-cdk-intro-workshop/tree/master/code/java/main-workshop) のコードを利用すれば、テストを追加した直後のプロジェクトの状態に設定できます。

## パイプラインのスタックの作成

最初のステップでは、パイプラインを持つスタックを作成します。
実際の「本番」アプリケーションとは分離するので、完全に独立させる必要があります。

`src/main/java/com/myorg` フォルダの中で `WorkshopPipelineStack.java` という新しいファイルを作成します。ファイルに以下の内容を追加します。

{{<highlight java>}}
package com.myorg;

import software.constructs.Construct;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;

public class WorkshopPipelineStack extends Stack {
    public WorkshopPipelineStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public WorkshopPipelineStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        // Pipeline code goes here
    }
}
{{</highlight>}}

内容に見覚えがありますか？この時点では、パイプラインも他の CDK スタックと同じです。

## CDK デプロイのエントリーポイントの変更

パイプラインはアプリケーションスタックをデプロイするためにあるので、メインの CDK アプリケーションに実際のアプリケーションをデプロイすることはもう必要ありません。代わりに、エントリポイントを変更してパイプラインをデプロイするようにすれば、アプリケーションはそのパイプラインにデプロイされます。

それを実現するために、 `src/main/java/com/myorg/CdkWorkshopApp.java` のコードを以下のように編集します。

{{<highlight java "hl_lines=9">}}
package com.myorg;

import software.amazon.awscdk.App;

public final class CdkWorkshopApp {
    public static void main(final String[] args) {
        App app = new App();

        new WorkshopPipelineStack(app, "PipelineStack");

        app.synth();
    }
}
{{</highlight>}}

これで準備が整いました！

# パイプラインを作りましょう！

{{< nextprevlinks >}}