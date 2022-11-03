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

`hitcounter.ts` を編集して、テーブルに `RemovalPolicy` プロパティを追加してください。

{{<highlight ts "hl_lines=25-26">}}
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

  /** the hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, "Hits", {
      partitionKey: {
        name: "path",
        type: dynamodb.AttributeType.STRING
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    this.table = table;

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hitcounter.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName
      }
    });

    // grant the lambda role read/write permissions to our table
    table.grantReadWriteData(this.handler);

    // grant the lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler);
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
