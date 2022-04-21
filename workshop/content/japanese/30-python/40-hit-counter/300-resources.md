+++
title = "リソースの定義"
weight = 300
+++

## HitCounter コンストラクトにリソースを追加する

Lambda 関数と DynamoDB テーブルを `HitCounter` コンストラクトに定義します。`cdkworkshop/hitcounter.py` に次のハイライトされたコードを追加します。

{{<highlight python "hl_lines=4 9-11 16-19 21-30">}}
from constructs import Construct
from aws_cdk import (
    aws_lambda as _lambda,
    aws_dynamodb as ddb,
)

class HitCounter(Construct):

    @property
    def handler(self):
        return self._handler    

    def __init__(self, scope: Construct, id: str, downstream: _lambda.IFunction, **kwargs):
        super().__init__(scope, id, **kwargs)

        table = ddb.Table(
            self, 'Hits',
            partition_key={'name': 'path', 'type': ddb.AttributeType.STRING}
        )

        self._handler = _lambda.Function(
            self, 'HitCountHandler',
            runtime=_lambda.Runtime.PYTHON_3_7,
            handler='hitcount.handler',
            code=_lambda.Code.from_asset('lambda'),
            environment={
                'DOWNSTREAM_FUNCTION_NAME': downstream.function_name,
                'HITS_TABLE_NAME': table.table_name,
            }
        )
{{</highlight>}}

## コードの解説

このコードはそう難しくはありません。

 * DynamoDB テーブルに `path` というパーティションキーを定義しました (すべての DynamoDB テーブルには必ず一つのパーティションキーが必要です)。
 * `lambda/hitcount.handler` にバインドされる Lambda 関数を定義しました。
 * Lambda 関数の環境変数をリソースの `function_name` と `table_name` に __紐付け__ しました。

## 遅延バインディング値

`function_name` と `table_name` プロパティは、CloudFormation スタックをデプロイするタイミングで解決される値です (テーブル/関数を定義した時点では、まだ物理名が決まっていないことに注目してください)。つまり、それらの値を出力する場合は、仮の文字列として出力されます。CDK は仮の文字列を使って、遅延バインディング値を表現します。この仮の文字列は *未定の値* として扱うべきで、コード上でそれらの値を設定してはいけません。
