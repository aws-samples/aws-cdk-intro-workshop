+++
title = "アクセス権限の付与"
weight = 600
+++

## Lambda 関数に DynamoDB テーブルの読み書き権限を付与

Lambda 関数の実行ロールに、テーブルに対しての読み取り/書き込み権限を与えましょう。

`~/HitCounter.java` を開き、次のようなハイライトされたコードを追加します。

{{<highlight java "hl_lines=40-41">}}
package com.myorg;

import java.util.HashMap;
import java.util.Map;

import software.constructs.Construct;

import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.AttributeType;
import software.amazon.awscdk.services.dynamodb.Table;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;

public class HitCounter extends Construct {
    private final Function handler;
    private final Table table;

    public HitCounter(final Construct scope, final String id, final HitCounterProps props) {
        super(scope, id);

        this.table = Table.Builder.create(this, "Hits")
            .partitionKey(Attribute.builder()
                .name("path")
                .type(AttributeType.STRING)
                .build())
            .build();

        final Map<String, String> environment = new HashMap<>();
        environment.put("DOWNSTREAM_FUNCTION_NAME", props.getDownstream().getFunctionName());
        environment.put("HITS_TABLE_NAME", this.table.getTableName());

        this.handler = Function.Builder.create(this, "HitCounterHandler")
            .runtime(Runtime.NODEJS_14_X)
            .handler("hitcounter.handler")
            .code(Code.fromAsset("lambda"))
            .environment(environment)
            .build();

        // Grants the lambda function read/write permissions to our table
        this.table.grantReadWriteData(this.handler);
    }

    /**
     * @return the counter definition
     */
    public Function getHandler() {
        return this.handler;
    }

    /**
     * @return the counter table
     */
    public Table getTable() {
        return this.table;
    }
}

{{</highlight>}}

## デプロイ

保存して、デプロイします。

```
mvn package
cdk deploy
```

## 再テスト

デプロイが完了したら、もう一度テストを実行します。 (`curl` やウェブブラウザーでアクセスします)

```
curl -i https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

また？

```
HTTP/1.1 502 Bad Gateway
...

{"message": "Internal server error"}
```

# 😢

まだこの厄介な 5xx エラーが発生しています！CloudWatch ログをもう一度見てみましょう (「再表示」を忘れずに)。

```json
{
    "errorType": "AccessDeniedException",
    "errorMessage": "User: arn:aws:sts::XXXXXXXXXX:assumed-role/CdkWorkshopStack-HelloHitCounterHitCounterHandlerS-TU5M09L1UBID/CdkWorkshopStack-HelloHitCounterHitCounterHandlerD-144HVUNEWRWEO is not authorized to perform: lambda:InvokeFunction on resource: arn:aws:lambda:us-east-1:XXXXXXXXXXX:function:CdkWorkshopStack-HelloHandler2E4FBA4D-149MVAO4969O7",
    "stack": [
        "AccessDeniedException: User: arn:aws:sts::XXXXXXXXXX:assumed-role/CdkWorkshopStack-HelloHitCounterHitCounterHandlerS-TU5M09L1UBID/CdkWorkshopStack-HelloHitCounterHitCounterHandlerD-144HVUNEWRWEO is not authorized to perform: lambda:InvokeFunction on resource: arn:aws:lambda:us-east-1:XXXXXXXXXXX:function:CdkWorkshopStack-HelloHandler2E4FBA4D-149MVAO4969O7",
        "at Object.extractError (/var/runtime/node_modules/aws-sdk/lib/protocol/json.js:48:27)",
        "at Request.extractError (/var/runtime/node_modules/aws-sdk/lib/protocol/rest_json.js:52:8)",
        "at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:105:20)",
        "at Request.emit (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:77:10)",
        "at Request.emit (/var/runtime/node_modules/aws-sdk/lib/request.js:683:14)",
        "at Request.transition (/var/runtime/node_modules/aws-sdk/lib/request.js:22:10)",
        "at AcceptorStateMachine.runTo (/var/runtime/node_modules/aws-sdk/lib/state_machine.js:14:12)",
        "at /var/runtime/node_modules/aws-sdk/lib/state_machine.js:26:10",
        "at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:38:9)",
        "at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:685:12)"
    ]
}
```

今回もアクセス権限の問題ですが、よく見てみると・・・

```text
User: <長い文字列> is not authorized to perform: lambda:InvokeFunction on resource: <長い文字列>"
```

HitCounter が正常にテーブルに書き込みできたようです。[DynamoDB コンソール](https://console.aws.amazon.com/dynamodb/home) で確認できます。


![](./logs5.png)

しかし、HitCounter にダウンストリームの Lambda 関数を呼び出す権限も付与する必要があります。

## 呼び出し権限を付与

`src/CdkWorkshop/HitCounter.java` にハイライトされたコードを追加します。

{{<highlight java "hl_lines=43-44">}}
package com.myorg;

import java.util.HashMap;
import java.util.Map;

import software.constructs.Construct;

import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.AttributeType;
import software.amazon.awscdk.services.dynamodb.Table;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;

public class HitCounter extends Construct {
    private final Function handler;
    private final Table table;

    public HitCounter(final Construct scope, final String id, final HitCounterProps props) {
        super(scope, id);

        this.table = Table.Builder.create(this, "Hits")
            .partitionKey(Attribute.builder()
                .name("path")
                .type(AttributeType.STRING)
                .build())
            .build();

        final Map<String, String> environment = new HashMap<>();
        environment.put("DOWNSTREAM_FUNCTION_NAME", props.getDownstream().getFunctionName());
        environment.put("HITS_TABLE_NAME", this.table.getTableName());

        this.handler = Function.Builder.create(this, "HitCounterHandler")
            .runtime(Runtime.NODEJS_14_X)
            .handler("hitcounter.handler")
            .code(Code.fromAsset("lambda"))
            .environment(environment)
            .build();

        // Grants the lambda function read/write permissions to our table
        this.table.grantReadWriteData(this.handler);

        // Grants the lambda function invoke permissions to the downstream function
        props.getDownstream().grantInvoke(this.handler);
    }

    /**
     * @return the counter definition
     */
    public Function getHandler() {
        return this.handler;
    }

    /**
     * @return the counter table
     */
    public Table getTable() {
        return this.table;
    }
}
{{</highlight>}}

## 差分確認

`cdk diff` で変更点を確認することができます。

```
cdk diff
```

**Resource** セクションが以下のように表示されます。IAM 権限が追加されたことを確認できます。

```
IAM Statement Changes
┌───┬────────────────────────────────────────┬────────┬────────────────────────────────────────┬─────────────────────────────────────────┬───────────┐
│   │ Resource                               │ Effect │ Action                                 │ Principal                               │ Condition │
├───┼────────────────────────────────────────┼────────┼────────────────────────────────────────┼─────────────────────────────────────────┼───────────┤
│ + │ ${HelloHandler.Arn}                    │ Allow  │ lambda:InvokeFunction                  │ AWS:${HelloHitCounter/HitCounterHandler │           │
│   │                                        │        │                                        │ /ServiceRole}                           │           │
├───┼────────────────────────────────────────┼────────┼────────────────────────────────────────┼─────────────────────────────────────────┼───────────┤
│ + │ ${HelloHitCounter/Hits.Arn}            │ Allow  │ dynamodb:BatchGetItem                  │ AWS:${HelloHitCounter/HitCounterHandler │           │
│   │                                        │        │ dynamodb:BatchWriteItem                │ /ServiceRole}                           │           │
│   │                                        │        │ dynamodb:DeleteItem                    │                                         │           │
│   │                                        │        │ dynamodb:GetItem                       │                                         │           │
│   │                                        │        │ dynamodb:GetRecords                    │                                         │           │
│   │                                        │        │ dynamodb:GetShardIterator              │                                         │           │
│   │                                        │        │ dynamodb:PutItem                       │                                         │           │
│   │                                        │        │ dynamodb:Query                         │                                         │           │
│   │                                        │        │ dynamodb:Scan                          │                                         │           │
│   │                                        │        │ dynamodb:UpdateItem                    │                                         │           │
└───┴────────────────────────────────────────┴────────┴────────────────────────────────────────┴─────────────────────────────────────────┴───────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Resources
[+] AWS::IAM::Policy HelloHitCounter/HitCounterHandler/ServiceRole/DefaultPolicy HelloHitCounterHitCounterHandlerServiceRoleDefaultPolicy1487A60A
[~] AWS::Lambda::Function HelloHitCounter/HitCounterHandler HelloHitCounterHitCounterHandlerDAEA7B37
 └─ [~] DependsOn
     └─ @@ -1,3 +1,4 @@
        [ ] [
        [+]   "HelloHitCounterHitCounterHandlerServiceRoleDefaultPolicy1487A60A",
        [ ]   "HelloHitCounterHitCounterHandlerServiceRoleD45002B8"
        [ ] ]

```

狙い通りです。

## デプロイ

もう一度やってみましょう！

```
cdk deploy
```

次にエンドポイントを `curl` またはウェブブラウザーでアクセスします。

```
curl -i https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

結果は以下の通りになるはずです。

```text
HTTP/2 200 OK
...

Hello, CDK! You've hit /
```

> もし、まだ 5xx エラーが出たら、数秒待ってからもう一度アクセスしてみてください。API Gateway
のエンドポイントに新しいデプロイを適用するのに少し時間がかかることがあります。

# 😲

{{< nextprevlinks >}}