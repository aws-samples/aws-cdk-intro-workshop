+++
title = "アサーションテスト"
weight = 200
+++

### きめ細かな(fine-grained) アサーションテスト

#### DynamoDB テーブルのためのテストの作成

{{% notice info %}} このセクションでは、[hit counter コンストラクトの作成](/50-java/40-hit-counter.html) が完了していることを前提としています。 {{% /notice %}}

`HitCounter` コンストラクトはシンプルな DynamoDB テーブルを作成します。テーブルが作成されていることを検証するテストを作りましょう。

`src/test` ディレクトリ (通常は `cdk init` を実行すると自動的に作成される) を削除したので、`src` ディレクトリ配下で新しい `test` ディレクトリを作成する必要があります

```bash
mkdir -p src/test/java/com/myorg
```

そして、次のコードが含まれる `HitCountertest.java` という名前のファイルを作成します。

```java
package com.myorg;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.assertions.Template;
import software.amazon.awscdk.assertions.Capture;
import java.io.IOException;

import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

public class HitCounterTest {

    @Test
    public void testDynamoDBTable() throws IOException {
        Stack stack = new Stack();

        Function hello = Function.Builder.create(stack, "HelloHandler")
            .runtime(Runtime.NODEJS_14_X)
            .code(Code.fromAsset("lambda"))
            .handler("hello.handler")
            .build();

        HitCounter helloWithCounter = new HitCounter(stack, "HelloHitCounter", HitCounterProps.builder()
            .downstream(hello)
            .build());

        // synthesize the stack to a CloudFormation template
        Template template = Template.fromStack(stack);

        template.resourceCountIs("AWS::DynamoDB::Table", 1);
    }
}
```

このテストは、生成 (synthesize) されたスタックに DynamoDB テーブルが含まれていることを確認します。

テストを実行します。

```bash
$ mvn test
```

以下のような出力が表示されるはずです。

```bash
$ mvn test

...building info...

-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.myorg.HitCounterTest
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.644 sec


Results :

Tests run: 1, Failures: 0, Errors: 0, Skipped: 0

[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  9.316 s
[INFO] Finished at: 2021-10-29T20:02:43Z
[INFO] ------------------------------------------------------------------------
```

#### Lambda 関数のためのテストの作成

次は、`HitCounter` コンストラクトが作成する Lambda 関数のためのテストを追加します。
今回は、Lambda 関数が作成されたことのテストに加えて、その関数には
`DOWNSTREAM_FUNCTION_NAME` と `HITS_TABLE_NAME` の2つの環境変数があることをテストします。

DynamoDB のテストの下に新規のテストを追加します。
Lambda 関数を作成した時に、環境変数の値は他のコンストラクトへの参照だったことを覚えていますか？

{{<highlight java "hl_lines=2-3 9">}}
final Map<String, String> environment = new HashMap<>();
environment.put("DOWNSTREAM_FUNCTION_NAME", props.getDownstream().getFunctionName());
environment.put("HITS_TABLE_NAME", this.table.getTableName());

this.handler = Function.Builder.create(this, "HitCounterHandler")
    .runtime(Runtime.NODEJS_14_X)
    .handler("hitcounter.handler")
    .code(Code.fromAsset("lambda"))
    .environment(environment)
    .build();
{{</highlight>}}

この時点では、`functionName` と `tableName` の値がわかりません。
CDK はハッシュを計算して、コンストラクトの名前の末尾に追加するからです。
そのため、一旦ダミーな値をセットして、最初のテストの実行が失敗し、実際の期待値が明らかになります。

`HitCounterTest.Java` に以下のコードを追加し、新しいテストを作成します。

```java
@Test
public void testLambdaEnvVars() throws IOException {
    Stack stack = new Stack();

    Function hello = Function.Builder.create(stack, "HelloHandler")
        .runtime(Runtime.NODEJS_14_X)
        .code(Code.fromAsset("lambda"))
        .handler("hello.handler")
        .build();

    HitCounter helloWithCounter = new HitCounter(stack, "HelloHitCounter", HitCounterProps.builder()
        .downstream(hello)
        .build());

    // synthesize the stack to a CloudFormation template
    Template template = Template.fromStack(stack);
    Capture envCapture = new Capture();
    Map<String, Object> expected = Map.of(
     "Handler", "hitcounter.handler",
     "Environment", envCapture);

    template.hasResourceProperties("AWS::Lambda::Function", expected);

    Map<String, Object> expectedEnv = Map.of(
        "Variables", Map.of(
            "DOWNSTREAM_FUNCTION_NAME", Map.of("Ref", "HelloHandlerXXXXXXXXX"),
            "HITS_TABLE_NAME", Map.of("Ref", "HelloHitCounterHitsXXXXXXXXX")
          )
        );
    assertThat(envCapture.asObject()).isEqualTo(expectedEnv);
}
```

ファイルを保存して、テストをもう一度実行します。

```bash
$ mvn test
```

今回のテストは失敗しますが、期待値の出力から環境変数の正しい値を入手できるはずです。

{{<highlight bash "hl_lines=11-14">}}
$ mvn test

-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.myorg.HitCounterTest
Tests run: 2, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 1.792 sec <<< FAILURE!
com.myorg.HitCounterTest.testLambdaEnvVars()  Time elapsed: 0.106 sec  <<< FAILURE!
org.opentest4j.AssertionFailedError:
Expecting:
 <{"Variables"={"DOWNSTREAM_FUNCTION_NAME"={"Ref"="HelloHandler2E4FBA4D"}, "HITS_TABLE_NAME"={"Ref"="HelloHitCounterHits7AAEBF80"}}}>
to be equal to:
 <{"Variables"={"DOWNSTREAM_FUNCTION_NAME"={"Ref"="HelloHandlerXXXXXXXXX"}, "HITS_TABLE_NAME"={"Ref"="HelloHitCounterHitsXXXXXXXXX"}}}>
but was not.
        at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
        at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:78)
        at java.base/jdk.internal.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
        at java.base/java.lang.reflect.Constructor.newInstanceWithCaller(Constructor.java:499)
        at com.myorg.HitCounterTest.testLambdaEnvVars(HitCounterTest.java:70)



Results :

Failed tests:   com.myorg.HitCounterTest.testLambdaEnvVars(): (..)

Tests run: 2, Failures: 1, Errors: 0, Skipped: 0

[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  13.296 s
[INFO] Finished at: 2021-11-01T12:37:23Z
[INFO] ------------------------------------------------------------------------
{{</highlight>}}

環境変数の実際の値を取得し、テストの内容を更新します。

{{<highlight java "hl_lines=26-27">}}
@Test
public void testLambdaEnvVars() throws IOException {
    Stack stack = new Stack();

    Function hello = Function.Builder.create(stack, "HelloHandler")
        .runtime(Runtime.NODEJS_14_X)
        .code(Code.fromAsset("lambda"))
        .handler("hello.handler")
        .build();

    HitCounter helloWithCounter = new HitCounter(stack, "HelloHitCounter", HitCounterProps.builder()
        .downstream(hello)
        .build());

    // synthesize the stack to a CloudFormation template
    Template template = Template.fromStack(stack);
    Capture envCapture = new Capture();
    Map<String, Object> expected = Map.of(
     "Handler", "hitcounter.handler",
     "Environment", envCapture);

    template.hasResourceProperties("AWS::Lambda::Function", expected);

    Map<String, Object> expectedEnv = Map.of(
        "Variables", Map.of(
            "DOWNSTREAM_FUNCTION_NAME", Map.of("Ref", "REPLACE_VALUE_HERE"),
            "HITS_TABLE_NAME", Map.of("Ref", "REPLACE_VALUE_HERE")
          )
        );
    assertThat(envCapture.asObject()).isEqualTo(expectedEnv);
}
{{</highlight>}}

ここで、テストをもう一度実行します。今回は成功するはずです。

```bash
$ mvn test
```

次のような出力が表示されるはずです。

```bash
$ mvn test

-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.myorg.HitCounterTest
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.785 sec


Results :

Tests run: 2, Failures: 0, Errors: 0, Skipped: 0

[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  9.571 s
[INFO] Finished at: 2021-11-01T12:42:03Z
[INFO] ------------------------------------------------------------------------
```

CDK コンストラクトの開発をテスト駆動開発手法 (Test Driven Development) でできます。
単純な例として、DynamoDB テーブルを暗号化する要件を追加しましょう。

まず、この新しい要件を反映するために、テストを更新します。

{{<highlight java>}}
@Test
public void testDynamoDBEncryption() throws IOException {
    Stack stack = new Stack();

    Function hello = Function.Builder.create(stack, "HelloHandler")
        .runtime(Runtime.NODEJS_14_X)
        .code(Code.fromAsset("lambda"))
        .handler("hello.handler")
        .build();

    HitCounter helloWithCounter = new HitCounter(stack, "HelloHitCounter", HitCounterProps.builder()
        .downstream(hello)
        .build());

    // synthesize the stack to a CloudFormation template
    Template template = Template.fromStack(stack);
    Capture envCapture = new Capture();
    Map<String, Object> expected = Map.of(
      "SSESpecification", Map.of("SSEEnabled", true));

    template.hasResourceProperties("AWS::DynamoDB::Table", expected);
}
{{</highlight>}}

ここでテストを実行すると、失敗するはずです。

```bash
$ mvn test

-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.myorg.HitCounterTest
Tests run: 3, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 1.805 sec <<< FAILURE!
com.myorg.HitCounterTest.testDynamoDBEncryption()  Time elapsed: 0.043 sec  <<< FAILURE!
software.amazon.jsii.JsiiException: Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.
The closest result is:
  {
    "Type": "AWS::DynamoDB::Table",
    "Properties": {
      "KeySchema": [
        {
          "AttributeName": "path",
          "KeyType": "HASH"
        }
      ],
      "AttributeDefinitions": [
        {
          "AttributeName": "path",
          "AttributeType": "S"
        }
      ],
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 5,
        "WriteCapacityUnits": 5
      }
    },
    "UpdateReplacePolicy": "Retain",
    "DeletionPolicy": "Retain"
  }
with the following mismatches:
        Missing key at /Properties/SSESpecification (using objectLike matcher)
Error: Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.
The closest result is:
  {
    "Type": "AWS::DynamoDB::Table",
    "Properties": {
      "KeySchema": [
        {
          "AttributeName": "path",
          "KeyType": "HASH"
        }
      ],
      "AttributeDefinitions": [
        {
          "AttributeName": "path",
          "AttributeType": "S"
        }
      ],
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 5,
        "WriteCapacityUnits": 5
      }
    },
    "UpdateReplacePolicy": "Retain",
    "DeletionPolicy": "Retain"
  }
with the following mismatches:
        Missing key at /Properties/SSESpecification (using objectLike matcher)


Results :

Failed tests:   com.myorg.HitCounterTest.testDynamoDBEncryption(): Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.(..)

Tests run: 3, Failures: 1, Errors: 0, Skipped: 0

[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  10.141 s
[INFO] Finished at: 2021-11-01T12:44:41Z
[INFO] ------------------------------------------------------------------------
```

次に、壊れたテストを直しましょう。hitcounter のコードを更新して、デフォルトで暗号化を有効にします。

{{<highlight java "hl_lines=11 28">}}
package com.myorg;

import java.util.HashMap;
import java.util.Map;

import software.constructs.Construct;

import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.AttributeType;
import software.amazon.awscdk.services.dynamodb.Table;
import software.amazon.awscdk.services.dynamodb.TableEncryption;
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
            .encryption(TableEncryption.AWS_MANAGED)
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

次にテストを実行します。成功するはずです。

```bash
$ mvn test

-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.myorg.HitCounterTest
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.807 sec


Results :

Tests run: 3, Failures: 0, Errors: 0, Skipped: 0

[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  10.072 s
[INFO] Finished at: 2021-11-01T12:46:58Z
[INFO] ------------------------------------------------------------------------
```
