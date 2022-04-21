+++
title = "HitCounter ハンドラー"
weight = 200
+++

## HitCounter Lambda ハンドラー

HitCounter の Lambda ハンドラーのコードを記述しましょう。

`lambda/hitcount.py` というファイルを作成します。

```python
import json
import os

import boto3

ddb = boto3.resource('dynamodb')
table = ddb.Table(os.environ['HITS_TABLE_NAME'])
_lambda = boto3.client('lambda')


def handler(event, context):
    print('request: {}'.format(json.dumps(event)))
    table.update_item(
        Key={'path': event['path']},
        UpdateExpression='ADD hits :incr',
        ExpressionAttributeValues={':incr': 1}
    )

    resp = _lambda.invoke(
        FunctionName=os.environ['DOWNSTREAM_FUNCTION_NAME'],
        Payload=json.dumps(event),
    )

    body = resp['Payload'].read()

    print('downstream response: {}'.format(body))
    return json.loads(body)
```

## 実行時のリソース検出

このコードは、次の2つの環境変数を参照していることがわかります。

 * `HITS_TABLE_NAME` データストアとして使用する DynamoDB のテーブル名
 * `DOWNSTREAM_FUNCTION_NAME` ダウンストリームの Lambda 関数の名前

テーブルとダウンストリーム関数の名前はアプリをデプロイするときに決まるため、これらの値をコンストラクトのコードから関連付ける必要があります。次のセクションでそれを行います。

