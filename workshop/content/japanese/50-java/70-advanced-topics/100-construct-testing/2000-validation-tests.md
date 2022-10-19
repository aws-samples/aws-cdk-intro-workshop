+++
title = "バリデーションテスト"
weight = 300
+++

### バリデーションテスト

場合によって、入力値を可変にする必要がありますが、その値に対して制約を設定したり、値の有効性を検証したりすることも必要です。

例えば、`HitCounter` コンストラクトに対して、 DynamoDB の `readCapacity` を指定できるようにします。
ユーザにリーズナブルな範囲で値を指定してもらいたいです。ひとまず、バリデーションロジックが正常に動作していることを確認するためのテストを書きます。
敢えて無効な値を指定して、結果を確認します。

まず、`HitCounterProps` インタフェースに、 `readCapacity` プロパティーを追加します。

`HitCounterProps.java` を編集します。

{{<highlight java "hl_lines=14 19 26-29 42-45">}}
package com.myorg;

import software.amazon.awscdk.services.lambda.IFunction;

public interface HitCounterProps {
    // Public constructor for the props builder
    public static Builder builder() {
        return new Builder();
    }

    // The function for which we want to count url hits
    IFunction getDownstream();

    Number getReadCapacity();

    // The builder for the props interface
    public static class Builder {
        private IFunction downstream;
        private Number readCapacity;

        public Builder downstream(final IFunction function) {
            this.downstream = function;
            return this;
        }

        public Builder readCapacity(final Number readCapacity) {
          this.readCapacity = readCapacity;
          return this;
        }

        public HitCounterProps build() {
            if(this.downstream == null) {
                throw new NullPointerException("The downstream property is required!");
            }

            return new HitCounterProps() {
                @Override
                public IFunction getDownstream() {
                    return downstream;
                }

                @Override
                public Number getReadCapacity() {
                  return readCapacity;
                }
            };
        }
    }
}
{{</highlight>}}

次に、DynamoDB テーブルのリソースに `readCapacity` プロパティを追加します。

{{<highlight java "hl_lines=1 9">}}
Number readCapacity = (props.getReadCapacity() == null) ? 5 : props.getReadCapacity();

this.table = Table.Builder.create(this, "Hits")
    .partitionKey(Attribute.builder()
        .name("path")
        .type(AttributeType.STRING)
        .build())
    .encryption(TableEncryption.AWS_MANAGED)
    .readCapacity(readCapacity)
    .build();
{{</highlight>}}

以下のように、`readCapacity` が範囲外である時にエラーを渡すバリデーションを追加します。

{{<highlight java "hl_lines=5 8-12">}}
public class HitCounter extends Construct {
    private final Function handler;
    private final Table table;

    public HitCounter(final Construct scope, final String id, final HitCounterProps props) throws RuntimeException {
        super(scope, id);

        if (props.getReadCapacity() != null) {
          if (props.getReadCapacity().intValue() < 5 || props.getReadCapacity().intValue() > 20) {
            throw new RuntimeException("readCapacity must be greater than 5 or less than 20");
          }
        }

        ...

    }
}
{{</highlight>}}

最後に、エラーが投げられることを確認するテストを追加します。

```java
    @Test
    public void testDynamoDBRaises() throws IOException {
        Stack stack = new Stack();

        Function hello = Function.Builder.create(stack, "HelloHandler")
            .runtime(Runtime.NODEJS_14_X)
            .code(Code.fromAsset("lambda"))
            .handler("hello.handler")
            .build();

        assertThrows(RuntimeException.class, () -> {
          new HitCounter(stack, "HelloHitCounter", HitCounterProps.builder()
              .downstream(hello)
              .readCapacity(1)
              .build());
        });
    }
```

テストを実行すると

```bash
$ mvn test
```

以下のような出力を確認できるはずです。

```bash
$ mvn test

-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.myorg.HitCounterTest
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.828 sec


Results :

Tests run: 4, Failures: 0, Errors: 0, Skipped: 0

[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  10.148 s
[INFO] Finished at: 2021-11-01T12:54:45Z
[INFO] ------------------------------------------------------------------------
```
