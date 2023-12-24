+++
title = "サンプルコードの削除"
weight = 100
+++

## スタックからサンプルコードを削除する

`cdk init sample-app` によって作成されたプロジェクトには、SQS キューとキューポリシー、SNS トピック、サブスクリプションが含まれています。このプロジェクトではこれらを使用しないので、`CDKWorkshopStack` コンストラクタから削除しましょう。

`cdk_workshop/cdk_workshop_stack.py` を開いて削除します。最終的には次のようになります。

```python
from constructs import Construct
from aws_cdk import (
    Stack,
)


class CdkWorkshopPythonStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Nothing here!
```

## cdk diff

スタックの修正によって、`cdk deploy` を実行したらどのような変更が発生するかツールキットで確認できます。（ CDK アプリと現在デプロイされているものの違いを確認することができます。）`cdk diff` を実行してみましょう。

```
cdk diff
```

出力は次のようになります。

```text
Stack cdk-workshop
IAM Statement Changes
┌───┬─────────────────────────────────┬────────┬─────────────────┬───────────────────────────┬─────────────────────────────────────────────────────────────────┐
│   │ Resource                        │ Effect │ Action          │ Principal                 │ Condition                                                       │
├───┼─────────────────────────────────┼────────┼─────────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ - │ ${CdkworkshopQueue18864164.Arn} │ Allow  │ sqs:SendMessage │ Service:sns.amazonaws.com │ "ArnEquals": {                                                  │
│   │                                 │        │                 │                           │   "aws:SourceArn": "${CdkworkshopTopic58CFDD3D}"                │
│   │                                 │        │                 │                           │ }                                                               │
└───┴─────────────────────────────────┴────────┴─────────────────┴───────────────────────────┴─────────────────────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Resources
[-] AWS::SQS::Queue CdkworkshopQueue18864164 destroy
[-] AWS::SQS::QueuePolicy CdkworkshopQueuePolicy78D5BF45 destroy
[-] AWS::SNS::Subscription CdkworkshopQueuecdkworkshopCdkworkshopTopic7642CC2FCF70B637 destroy
[-] AWS::SNS::Topic CdkworkshopTopic58CFDD3D destroy
```

想定の通り、既存のリソースがすっかり削除されることになります。

## cdk deploy

`cdk deploy` を実行したら、__次のセクションに進みます。__ (デプロイ完了を待つ必要はありません)

```
cdk deploy
```

リソースが削除されていくのを確認できます。
