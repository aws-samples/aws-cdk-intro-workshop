+++
title = "パイプライン入門"
weight = 110
+++

> 注意 : このワークショップの章は、前の全ての章を完了していることを前提としています。完了していないか、またはこの部分のみ検証する場合は、[こちら](https://github.com/aws-samples/aws-cdk-intro-workshop/tree/master/code/csharp/main-workshop) のコードを利用すれば、テストを追加した直後のプロジェクトの状態に設定することができます。

## パイプラインのスタックの作成
最初のステップでは、パイプラインを持つスタックを作成します。
実際の「本番」アプリケーションとは分離するので、完全に独立させる必要があります。

`src/CdkWorkshop` フォルダの中で `CdkWorkshop/PipelineStack.cs`　という新しいファイルを作成します。ファイルに以下の内容を追加します。


{{<highlight ts>}}
using Amazon.CDK;
using Constructs;

namespace CdkWorkshop
{
    public class WorkshopPipelineStack : Stack
    {
        public WorkshopPipelineStack(Construct parent, string id, IStackProps props = null) : base(parent, id, props)
        {
            // Pipeline code goes here
        }
    }
}
{{</highlight>}}

内容に見覚えがありますか？この時点では、パイプラインも他の CDK スタックと同じです。

## CDK デプロイのエントリーポイントの変更
パイプラインはアプリケーションスタックをデプロイするためにあるので、メインの CDK アプリケーションに実際のアプリケーションをデプロイすることはもう必要ありません。代わりに、エントリポイントを変更してパイプラインをデプロイするようにすれば、アプリケーションはそのパイプラインにデプロイされます。

それを実現するために、`CdkWorkshop/Program.cs` のコードを以下のように編集します。

{{<highlight ts "hl_lines=10">}}
using Amazon.CDK;

namespace CdkWorkshop
{
    class Program
    {
        static void Main(string[] args)
        {
            var app = new App();
            new WorkshopPipelineStack(app, "WorkshopPipelineStack");

            app.Synth();
        }
    }
}

{{</highlight>}}


これで準備が整いました！

# パイプラインを作りましょう！

{{< nextprevlinks >}}