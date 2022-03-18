+++
title = "パイプライン入門"
weight = 110
+++

> 注意 : このワークショップの章は、前の全ての章を完了していることを前提としています。完了していないか、またはこの部分のみ検証する場合は、[こちら](https://github.com/aws-samples/aws-cdk-intro-workshop/tree/master/code/python/main-workshop) のコードを利用すれば、テストを追加した直後のプロジェクトの状態に設定することができます。

## パイプラインのスタックの作成
最初のステップでは、パイプラインを持つスタックを作成します。
実際の「本番」アプリケーションとは分離するので、完全に独立させる必要があります。

`cdk_workshop` フォルダの中で `pipeline_stack.py` という新しいファイルを作成します。ファイルに以下の内容を追加します。

{{<highlight python>}}
from constructs import Construct
from aws_cdk import (
    Stack
)
from pipeline_stage import WorkshopPipelineStage

class WorkshopPipelineStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Pipeline code will go here
{{</highlight>}}

内容に見覚えがありますか？この時点では、パイプラインも他の CDK スタックと同じです。

## CDK デプロイのエントリーポイントの変更
パイプラインはアプリケーションスタックをデプロイするためにあるので、メインの CDK アプリケーションに実際のアプリケーションをデプロイすることはもう必要ありません。代わりに、エントリポイントを変更してパイプラインをデプロイするようにすれば、アプリケーションはそのパイプラインにデプロイされます。

それを実現するために、`app.py` のコードを以下のように編集します。

{{<highlight python "hl_lines=4 7">}}
#!/usr/bin/env python3

import aws_cdk as cdk
from cdk_workshop.pipeline_stack import WorkshopPipelineStack

app = cdk.App()
WorkshopPipelineStack(app, "WorkshopPipelineStack")

app.synth()
{{</highlight>}}

このコードは、CDK がスタックを生成 (`cdk synth`) する度に、この新しい機能を使うように指示をします。


これで準備が整いました！

# パイプラインを作りましょう！
