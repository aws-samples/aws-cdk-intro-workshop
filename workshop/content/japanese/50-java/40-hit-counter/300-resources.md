+++
title = "リソースの定義"
weight = 300
+++

## HitCounter コンストラクトにリソースを追加する

Lambda 関数と DynamoDB テーブルを `HitCounter` コンストラクトに定義します。

さて、`~/HitCounter.java`  に戻ります。 次の強調されたコードを追加します。

{{<highlight java "hl_lines=3-4 8-13 16-17 22-38 41-53">}}
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

## コードの解説

このコードはそう難しくはありません。

 * DynamoDB テーブルに `path` というパーティションキーを定義しました (すべての DynamoDB テーブルには必ず一つのパーティションキーが必要です)。
 * `lambda/hitcount.handler` にバインドされる Lambda 関数を定義しました。
 * Lambda 関数の環境変数をリソースの `Function.name` と `Table.name` に `environment.put(...)` のように__紐付け__ しました。

## 遅延バインディング値

`FunctionName` と `TableName` プロパティは、CloudFormation スタックをデプロイするタイミングで解決される値です (テーブル/関数を定義した時点では、まだ物理名が決まっていないことに注目してください)。つまり、それらの値を出力する場合は、仮の文字列として出力されます。CDK は仮の文字列を使って、遅延バインディング値を表現します。この仮の文字列は *未定の値* として扱うべきで、コード上でそれらの値を設定してはいけません。
