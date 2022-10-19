+++
title = "アクセス権限の付与"
weight = 600
+++

## Lambda 関数に DynamoDB テーブルの読み書き権限を付与

Lambda 関数の実行ロールに、テーブルに対しての読み取り/書き込み権限を与えましょう。

`src/CdkWorkshop/HitCounter.cs` を開き、次のようなハイライトされたコードを追加します。

{{<highlight csharp "hl_lines=42-43">}}
using Amazon.CDK;
using Amazon.CDK.AWS.Lambda;
using Amazon.CDK.AWS.DynamoDB;
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
        public IFunction Handler { get; };

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

            // Grant the lambda role read/write permissions to our table
            table.GrantReadWriteData(Handler);
        }
    }
}
{{</highlight>}}

## デプロイ

保存して、デプロイします。

```
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
    "errorMessage": "User: arn:aws:sts::585695036304:assumed-role/CdkWorkshopStack-HelloHitCounterHitCounterHandlerS-TU5M09L1UBID/CdkWorkshopStack-HelloHitCounterHitCounterHandlerD-144HVUNEWRWEO is not authorized to perform: lambda:InvokeFunction on resource: arn:aws:lambda:us-east-1:585695036304:function:CdkWorkshopStack-HelloHandler2E4FBA4D-149MVAO4969O7",
    "errorType": "AccessDeniedException",
    "stackTrace": [
        "Object.extractError (/var/runtime/node_modules/aws-sdk/lib/protocol/json.js:48:27)",
        "Request.extractError (/var/runtime/node_modules/aws-sdk/lib/protocol/rest_json.js:52:8)",
        "Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:105:20)",
        "Request.emit (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:77:10)",
        "Request.emit (/var/runtime/node_modules/aws-sdk/lib/request.js:683:14)",
        "Request.transition (/var/runtime/node_modules/aws-sdk/lib/request.js:22:10)",
        "AcceptorStateMachine.runTo (/var/runtime/node_modules/aws-sdk/lib/state_machine.js:14:12)",
        "/var/runtime/node_modules/aws-sdk/lib/state_machine.js:26:10",
        "Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:38:9)",
        "Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:685:12)"
    ]
}
```

今回もアクセス権限の問題ですが、よく見てみると・・・

```
User: <長い文字列> is not authorized to perform: lambda:InvokeFunction on resource: <VERY-LONG-STRING>"
```

HitCounter が正常にテーブルに書き込みできたようです。[DynamoDB コンソール](https://console.aws.amazon.com/dynamodb/home) で確認できます。

![](./logs5.png)

しかし、HitCounter にダウンストリームの Lambda 関数を呼び出す権限も付与する必要があります。

## 呼び出し権限を付与

`src/CdkWorkshop/HitCounter.cs` にハイライトされたコードを追加します。

{{<highlight csharp "hl_lines=45-46">}}
using Amazon.CDK;
using Amazon.CDK.AWS.Lambda;
using Amazon.CDK.AWS.DynamoDB;
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
        public IFunction Handler { get; };

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

            // Grant the lambda role read/write permissions to our table
            table.GrantReadWriteData(Handler);

            // Grant the lambda role invoke permissions to the downstream function
            props.Downstream.GrantInvoke(Handler);
        }
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
Resources
[~] AWS::IAM::Policy HelloHitCounter/HitCounterHandler/ServiceRole/DefaultPolicy HelloHitCounterHitCounterHandlerServiceRoleDefaultPolicy1487A60A
 └─ [~] PolicyDocument
     └─ [~] .Statement:
         └─ @@ -19,5 +19,15 @@
            [ ]         "Arn"
            [ ]       ]
            [ ]     }
            [+]   },
            [+]   {
            [+]     "Action": "lambda:InvokeFunction",
            [+]     "Effect": "Allow",
            [+]     "Resource": {
            [+]       "Fn::GetAtt": [
            [+]         "HelloHandler2E4FBA4D",
            [+]         "Arn"
            [+]       ]
            [+]     }
            [ ]   }
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
