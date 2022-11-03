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

`hitcounter.py` を編集して、テーブルに `RemovalPolicy` プロパティを追加してください。

{{<highlight python "hl_lines=5 23-24">}}
from constructs import Construct
from aws_cdk import (
aws_lambda as _lambda,
aws_dynamodb as ddb,
RemovalPolicy
)

class HitCounter(Construct):

    @property
    def handler(self):
        return self._handler

    @property
    def table(self):
        return self._table

    def __init__(self, scope: Construct, id: str, downstream: _lambda.IFunction, **kwargs):
        super().__init__(scope, id, **kwargs)

        self._table = ddb.Table(
            self, 'Hits',
            partition_key={'name': 'path', 'type': ddb.AttributeType.STRING},
            removal_policy=RemovalPolicy.DESTROY
        )

        self._handler = _lambda.Function(
            self, 'HitCountHandler',
            runtime=_lambda.Runtime.PYTHON_3_7,
            handler='hitcount.handler',
            code=_lambda.Code.from_asset('lambda'),
            environment={
                'DOWNSTREAM_FUNCTION_NAME': downstream.function_name,
                'HITS_TABLE_NAME': self._table.table_name,
            }
        )

        self._table.grant_read_write_data(self.handler)
        downstream.grant_invoke(self.handler)
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
