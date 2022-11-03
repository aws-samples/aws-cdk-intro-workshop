+++
title = "クリーンアップ"
weight = 60
bookFlatSection = true
+++

# スタックのクリーンアップ

スタックを破棄するとき、リソースはその削除ポリシーに従って削除、保持、スナップショットされます。
デフォルトでは、ほとんどのリソースはスタック削除時に削除されますが、すべてのリソースがそうなるわけではありません。
DynamoDBのテーブルは、デフォルトで保持されます。もし、このテーブルを保持したくない場合は、CDK
のコードに `RemovalPolicy` を使って設定することができます。

## スタック削除時にDynamoDBテーブルを削除するよう設定する

`src/CdkWorkshop/HitCounter.cs` を編集して、テーブルに `RemovalPolicy` プロパティを追加してください。

{{<highlight csharp "hl_lines=29">}}
using Amazon.CDK;
using Amazon.CDK.AWS.DynamoDB;
using Amazon.CDK.AWS.Lambda;
using Constructs;
using System.Collections.Generic;

namespace CdkWorkshop
{
    public class HitCounterProps
    {
        // The function for which we want to count url hits
        public IFunction Downstream { get; set; }
    }

    public class HitCounter : Construct
    {
        public readonly Function Handler;
        public readonly Table MyTable;

        public HitCounter(Construct scope, string id, HitCounterProps props) : base(scope, id)
        {
            var table = new Table(this, "Hits", new TableProps
            {
                PartitionKey = new Attribute
                {
                    Name = "path",
                    Type = AttributeType.STRING
                },
                RemovalPolicy = RemovalPolicy.DESTROY
            });
            MyTable = table;

            Handler = new Function(this, "HitCounterHandler", new FunctionProps
            {
                Runtime = Runtime.NODEJS_14_X,
                Handler = "hitcounter.handler",
                Code = Code.FromAsset("lambda"),
                Environment = new Dictionary<string, string>
                {
                    ["DOWNSTREAM_FUNCTION_NAME"] = props.Downstream.FunctionName,
                    ["HITS_TABLE_NAME"] = table.TableName
                }
            });

            // Grant the lambda role read/write permissions to our table
            table.GrantReadWriteData(Handler);

            // Grant the lambda role invoke permissions to the downstream function
            props.Downstream.GrantInvoke(Handler);
        }
    }
}
{{</highlight>}}

さらに、作成されたLambda関数は、永久に保持される CloudWatch のログを生成します。

これらはスタックの一部ではないので、CloudFormation では追跡されず、ログは残ります。必要であれば、コンソールから手動で削除する必要があります。

どのリソースが削除されるかがわかったので、スタックの削除を進めましょう。
AWS CloudFormationコンソールからスタックを削除するか、次のコマンドを使用します。`cdk destroy`を使用します。

```
cdk destroy
```

次のように聞かれます:

```
Are you sure you want to delete: CdkWorkshopStack (y/n)?
```

"y"を押すと、スタックが削除されます。

`cdk bootstrap` で作成したブートストラップスタックはまだ存在します。もし、将来CDKを使う予定があるなら (そうであって欲しい！) このスタックを削除しないでください。

このスタックを削除したい場合は、CloudFormation の
コンソールから行う必要があります。CloudFormation コンソールへ行き、`CDKToolkit` スタックを削除してください。

作成された S3 バケットはデフォルトで保持されますので、予期せぬ請求を回避したい場合は S3 コンソールを開き、ブートストラップで生成されたバケットを空にし後、削除してください。
