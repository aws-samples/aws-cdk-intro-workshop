+++
title = "HitCounter ハンドラー"
weight = 200
+++

## HitCounter Lambda ハンドラー

HitCounter の Lambda ハンドラーのコードを記述しましょう。

`lambda/hitcounter.js` というファイルを作成します。

```js
const { DynamoDB, Lambda } = require('aws-sdk');

exports.handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // create AWS SDK clients
  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  // update dynamo entry for "path" with hits++
  await dynamo.updateItem({
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: { S: event.path } },
    UpdateExpression: 'ADD hits :incr',
    ExpressionAttributeValues: { ':incr': { N: '1' } }
  }).promise();

  // call downstream function and capture response
  const resp = await lambda.invoke({
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: JSON.stringify(event)
  }).promise();

  console.log('downstream response:', JSON.stringify(resp, undefined, 2));

  // return response back to upstream caller
  return JSON.parse(resp.Payload);
};
```

## 実行時のリソース検出

このコードは、次の2つの環境変数を参照していることがわかります。

 * `HITS_TABLE_NAME` データストアとして使用する DynamoDB のテーブル名
 * `DOWNSTREAM_FUNCTION_NAME` ダウンストリームの Lambda 関数の名前

テーブルとダウンストリーム関数の名前はアプリをデプロイするときに決まるため、これらの値をコンストラクトのコードから関連付ける必要があります。次のセクションでそれを行います。
