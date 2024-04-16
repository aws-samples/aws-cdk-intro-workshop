+++
title = "リソースの定義"
weight = 300
+++

## HitCounter コンストラクトにリソースを追加する

Lambda 関数と DynamoDB テーブルを `HitCounter` コンストラクトに定義します。
`src/CdkWorkshop/HitCounter.cs` に戻り、次のハイライトされたコードを追加します。

{{<highlight csharp "hl_lines=2 5 17 21-40">}}
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
        public Function Handler { get; }

        public HitCounter(Construct scope, string id, HitCounterProps props) : base(scope, id)
        {
            var table = new Table(this, "Hits", new TableProps
            {
                PartitionKey = new Attribute
                {
                    Name = "path",
                    Type = AttributeType.STRING
                }
            });

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
        }
    }
}

{{</highlight>}}

## コードの解説

このコードはそう難しくはありません。

 * DynamoDB テーブルに `path` というパーティションキーを定義しました (すべての DynamoDB テーブルには必ず一つのパーティションキーが必要です)。
 * `lambda/hitcount.handler` にバインドされる Lambda 関数を定義しました。
 * Lambda 関数の環境変数をリソースの `FunctionName` と `TableName` に __紐付け__ しました。

## 遅延バインディング値

 `FunctionName` と `TableName` プロパティは、CloudFormation スタックをデプロイするタイミングで解決される値です (テーブル/関数を定義した時点では、まだ物理名が決まっていないことに注目してください)。つまり、それらの値を出力する場合は、仮の文字列として出力されます。CDK は仮の文字列を使って、遅延バインディング値を表現します。この仮の文字列は *未定の値* として扱うべきで、コード上でそれらの値を設定してはいけません。

{{< nextprevlinks >}}