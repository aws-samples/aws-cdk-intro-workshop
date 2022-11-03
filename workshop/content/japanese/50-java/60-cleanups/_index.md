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

`src/CdkWorkshop/HitCounter.java` を編集して、テーブルに `removalPolicy` プロパティを追加してください。

{{<highlight java "hl_lines=8 28">}}
package com.myorg;

import java.util.HashMap;
import java.util.Map;

import software.constructs.Construct;

import software.amazon.awscdk.RemovalPolicy;
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
            .removalPolicy(RemovalPolicy.DESTROY)
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
