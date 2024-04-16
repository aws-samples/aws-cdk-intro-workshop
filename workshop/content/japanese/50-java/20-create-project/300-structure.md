+++
title = "プロジェクトの構造"
weight = 300
+++

## IDEを開く

お気に入りのIDEでプロジェクトを開き、ディレクトリの中身を見てみましょう。

> VSCodeを使用する場合は、プロジェクトディレクトリ内で `code .` と入力するだけです。

## プロジェクトディレクトリを探索する

次のような内容が表示されます。

![](./structure.png)

* `src/main/java/com/myorg/`  Javaのメインとなるプロジェクトディレクトリです。以降は `~/` で表現します。 
* `~/CdkWorkshopApp.java` CDKアプリケーションのエントリポイントです。 `~/CdkWorkshopStack.java` で定義されたスタックをロードします。
* `~/CdkWorkshopStack.java` CDKアプリケーションのメインスタックが定義されます。今回のワークショップでほとんどの時間を費やすことになるファイルです。

* `cdk.json` アプリの実行方法をツールキットに指示させるためのファイルです。今回の場合は、 `mvn -q exec:java`です。
* `pom.xml` Mavenのプロジェクトファイルです。ビルド、依存関係、アプリケーションに関する情報がXMLで表現されています。 これは、将来的に役立つものですが、このワークショップの目的には関係ありません。
* `test/java/com/myorg/CdkWorkshopStackTest.java` アプリケーションがビルドされた時に実行されるテストコードです。テストが成功したか否かをターミナル上で確認することもできます。 今回のワークショップでは触れません。
* `.gitignore` Git用のファイルです。ソースコードの管理に含める/除外するファイルの設定が含まれています。
* `.classpath`, `.project`, `.settings/` および `target/` ava、Mavenによって自動生成されるファイル、フォルダです。これらは無視してください。

## エントリーポイント

`~/CdkWorkshopApp.java` を簡単に見てみましょう。

```java
package com.myorg;

import software.amazon.awscdk.App;

public final class CdkWorkshopApp {
    public static void main(final String[] args) {
        App app = new App();

        new CdkWorkshopStack(app, "CdkWorkshopStack");

        app.synth();
    }
}
```

このコードは、`~/CdkWorkshopStack.java` から `CdkWorkshopStack` クラス をロードしてインスタンス化するものです。もうこのファイルを見る必要はないでしょう。

## メインスタック

`~/CdkWorkshopStack.java` を開いてください。これがアプリケーションの要のファイルです。

```java
package com.myorg;

import software.constructs.Construct;
import software.amazon.awscdk.Duration;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.sns.Topic;
import software.amazon.awscdk.services.sns.subscriptions.SqsSubscription;
import software.amazon.awscdk.services.sqs.Queue;

public class CdkWorkshopStack extends Stack {
    public CdkWorkshopStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public CdkWorkshopStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        final Queue queue = Queue.Builder.create(this, "CdkWorkshopQueue")
                .visibilityTimeout(Duration.seconds(300))
                .build();

        final Topic topic = Topic.Builder.create(this, "CdkWorkshopTopic")
            .displayName("My First Topic Yeah")
            .build();

        topic.addSubscription(new SqsSubscription(queue));
    }
}
```

ご覧のとおり、CDK スタック(`CdkWorkshopStack`)によってアプリケーションが作成されます。

このスタックは次のリソースを含んでいます。

- SQS キュー (`final Queue queue`)
- SNS トピック (`final Topic topic`)
- SNS トピックにパブリッシュされたメッセージを受信するように SQS キューをサブスクライブします。 (`topic.AddSubscription`)

{{< nextprevlinks >}}