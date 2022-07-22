+++
title = "サンプルコードの削除"
weight = 100
+++

## スタックからサンプルコードを削除する

`cdk init sample-app` によって作成されたプロジェクトには、SQSキューとSNSトピックが含まれます。今回のプロジェクトではそれらを使用する予定はないので、 `CdkWorkshopStack` コンストラクタから削除しましょう。

`~/CdkWorkshopStack.java` を開き、それらを削除します。最終的には次のようになります。

```java
package com.myorg;

import software.constructs.Construct;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;

public class CdkWorkshopStack extends Stack {
    public CdkWorkshopStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public CdkWorkshopStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        // Nothing here!
    }
}
```

## `test` ディレクトリを削除する

`test` ディレクトリは、`junit` ライブラリを使用してプロジェクトのテストを作成するために使用します。このワークショップでは必要ないので、ルートからディレクトリを削除してください。

## cdk diff

スタックのコンテンツを変更したため、ツールキットによって CDK アプリケーションと現在デプロイされているものの違いを確認することができます。 これは `cdk deploy` を実行したときに何が起こるかを確認するための安全な方法であり良い習慣です。

```
mvn clean package
cdk diff
```

出力は次のようになります。

```
IAM Statement Changes
┌───┬─────────────────────────────────┬────────┬─────────────────┬───────────────────────────┬──────────────────────────────────────────────────┐
│   │ Resource                        │ Effect │ Action          │ Principal                 │ Condition                                        │
├───┼─────────────────────────────────┼────────┼─────────────────┼───────────────────────────┼──────────────────────────────────────────────────┤
│ - │ ${CdkWorkshopQueue50D9D426.Arn} │ Allow  │ sqs:SendMessage │ Service:sns.amazonaws.com │ "ArnEquals": {                                   │
│   │                                 │        │                 │                           │   "aws:SourceArn": "${CdkWorkshopTopicD368A42F}" │
│   │                                 │        │                 │                           │ }                                                │
└───┴─────────────────────────────────┴────────┴─────────────────┴───────────────────────────┴──────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See http://bit.ly/cdk-2EhF7Np)

Resources
[-] AWS::SQS::Queue CdkWorkshopQueue50D9D426 destroy
[-] AWS::SQS::QueuePolicy CdkWorkshopQueuePolicyAF2494A5 destroy
[-] AWS::SNS::Topic CdkWorkshopTopicD368A42F destroy
[-] AWS::SNS::Subscription CdkWorkshopTopicCdkWorkshopQueueSubscription88D211C7 destroy
```

想定の通り、既存のリソースがすっかり削除されることになります。

## cdk deploy

`cdk deploy` を実行したら、次のセクションに進みます。（完了を見届ける必要はありません）

```
cdk deploy
```

リソースが削除されていくのを確認できます。
