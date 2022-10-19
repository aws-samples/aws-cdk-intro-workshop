+++
title = "リソースの定義"
weight = 300
+++

## HitCounter コンストラクトにリソースを追加する

Lambda 関数と DynamoDB テーブルを `HitCounter` コンストラクトに定義します。

さて、`lib/hitcounter.ts` に戻ります。 次の強調されたコードを追加します。

{{<highlight ts "hl_lines=3 13-14 19-31">}}
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;
}

export class HitCounter extends Construct {

  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'Hits', {
        partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
    });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'hitcounter.handler',
        code: lambda.Code.fromAsset('lambda'),
        environment: {
            DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
            HITS_TABLE_NAME: table.tableName
        }
    });
  }
}
{{</highlight>}}

## コードの解説

このコードはそう難しくはありません。

 * DynamoDB テーブルに `path` というパーティションキーを定義しました (すべての DynamoDB テーブルには必ず一つのパーティションキーが必要です)。
 * `lambda/hitcount.handler` にバインドされる Lambda 関数を定義しました。
 * Lambda 関数の環境変数をリソースの `function_name` と `table_name` に __紐付け__ しました。

## 遅延バインディング値

`function_name` と `table_name` プロパティは、CloudFormation スタックをデプロイするタイミングで解決される値です (テーブル/関数を定義した時点では、まだ物理名が決まっていないことに注目してください)。つまり、それらの値を出力する場合は、仮の文字列として出力されます。CDK は仮の文字列を使って、遅延バインディング値を表現します。この仮の文字列は *未定の値* として扱うべきで、コード上でそれらの値を設定してはいけません。