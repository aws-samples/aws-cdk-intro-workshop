+++
title = "プロジェクトの構造"
weight = 300
+++

## IDEを開く

使い慣れたIDEでプロジェクトを開いてみましょう。

> VSCodeを使用する場合は、プロジェクトディレクトリ内で `code .` と入力するだけです。
>
> また、次のようなメッセージが出ることがありますが、今回は無視しても問題ありません。 `Required assets to build and debug are missing from 'YOURPROJECT'. Add them?`

## Explore your project directory

You'll see something like this:

![](./structure.png)

* `src/CdkWorkshop/Program.cs` CDKアプリケーションのエントリポイントです。`src/CdkWorkshop/CdkWorkshopStack.cs` で定義されたスタックをロードします。
* `src/CdkWorkshop/CdkWorkshopStack.cs` CDKアプリケーションのメインスタックが定義されます。今回のワークショップでほとんどの時間を費やすことになるファイルです。
* `cdk.json` アプリの実行方法をツールキットに指示させるためのファイルです。今回の場合は、 `"dotnet run -p src/CdkWorkshop/CdkWorkshop.csproj"`で実行します。
* `src/CdkWorkshop/CdkWorkshop.csproj` C#のプロジェクトファイルです。パッケージの依存関係がXMLで表現されています。将来的に役に立つこともありますが、今回のワークショップでは触れません。
* `src/CdkWorkshop/GlobalSuppressions.cs` CDKの動作と相性の悪いソースコードアナライザーを無効化しています。
* `src/CdkWorkshop.sln` ビルドに必要となる情報を提供するC#ソリューションファイルです。直接このファイルを編集することはありません。
* `.gitignore` Gitによるソースコード管理の除外設定を定義するファイルです。
* `src/CdkWorkshop/bin` と src/CdkWorkshop/obj ビルドに使うディレクトリです。基本的には気にすることはありません。

## エントリーポイント

`src/CdkWorkshop/Program.cs` ファイルを簡単に見てみましょう。

```c#
using Amazon.CDK;

namespace CdkWorkshop
{
    class Program
    {
        static void Main(string[] args)
        {
            var app = new App();
            new CdkWorkshopStack(app, "CdkWorkshopStack");

            app.Synth();
        }
    }
}
```

このコードは、src/CdkWorkshop/CdkWorkshopStack.csファイルを開き、 CdkWorkshopStack クラス を初期化してロードするものです。一度読んだら、もうこのファイルを見る必要はありません。

## メインスタック

`src/CdkWorkshop/CdkWorkshopStack.cs` を開いてみましょう。これがアプリケーションの要です。
is:

```cs
using Amazon.CDK;
using Amazon.CDK.AWS.SNS;
using Amazon.CDK.AWS.SNS.Subscriptions;
using Amazon.CDK.AWS.SQS;
using Constructs;

namespace CdkWorkshop
{
    public class CdkWorkshopStack : Stack
    {
        public CdkWorkshopStack(Construct scope, string id, IStackProps props = null) : base(scope, id, props)
        {
             // The CDK includes built-in constructs for most resource types, such as Queues and Topics.
            var queue = new Queue(this, "CdkWorkshopQueue", new QueueProps
            {
                VisibilityTimeout = Duration.Seconds(300)
            });

            var topic = new Topic(this, "CdkWorkshopTopic");

            topic.AddSubscription(new SqsSubscription(queue));
        }
    }
}
```

ご覧のとおり、CDK スタック(`CdkWorkshopStack`)によってアプリケーションが作成されます。

このスタックは次のリソースを含んでいます。

- SQS キュー (`new sqs.Queue`)
- SNS トピック (`new sns.Topic`)
- SNS トピックにパブリッシュされたメッセージを受信するように SQS キューをサブスクライブします。 (`topic.AddSubscription`)

{{< nextprevlinks >}}