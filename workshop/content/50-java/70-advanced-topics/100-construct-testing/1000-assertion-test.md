+++
title = "Assertion Tests"
weight = 200
+++

### Fine-Grained Assertion Tests

#### Create a test for the DynamoDB table

{{% notice info %}} This section assumes that you have [created the hit counter construct](/50-java/40-hit-counter.html) {{% /notice %}}

Our `HitCounter` construct creates a simple DynamoDB table. Lets create a test that
validates that the table is getting created.

If you do not already have a `src/test` directory (usually created automatically when you run `cdk init`), then create a `test` directory
under `src`:

```bash
mkdir -p src/test/java/com/myorg
```

And then create a file called `HitCounterTest.java` with the following code.

```java
package com.myorg;

import software.amazon.awscdk.core.Stack;
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

This test is simply testing to ensure that the synthesized stack includes a DynamoDB table.

Run the test.

```bash
$ mvn test
```

You should see output like this:

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

#### Create a test for the Lambda function

Now lets add another test, this time for the Lambda function that the `HitCounter` construct creates.
This time in addition to testing that the Lambda function is created, we also want to test that
it is created with the two environment variables `DOWNSTREAM_FUNCTION_NAME` & `HITS_TABLE_NAME`.

Add another test below the DynamoDB test. If you remember, when we created the lambda function the
environment variable values were references to other constructs.

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

At this point we don't really know what the value of the `functionName` or `tableName` will be since the
CDK will calculate a hash to append to the end of the name of the constructs, so we will just use a
dummy value for now. Once we run the test it will fail and show us the expected value.

Create a new test in `HitCounterTest.Java` with the below code:

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

Save the file and run the test again.

```bash
$ mvn test
```

This time the test should fail and you should be able to grab the correct value for the
variables from the expected output.

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

Grab the real values for the environment variables and update your test

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

Now run the test again. This time is should pass.

```bash
$ mvn test
```

You should see output like this:

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

You can also apply TDD (Test Driven Development) to developing CDK Constructs. For a very simple example, lets add a new
requirement that our DynamoDB table be encrypted.

First we'll update the test to reflect this new requirement.

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

Now run the test, which should fail.

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

Now lets fix the broken test. Update the hitcounter code to enable encryption by default.

{{<highlight java "hl_lines=6">}}
this.table = Table.Builder.create(this, "Hits")
    .partitionKey(Attribute.builder()
        .name("path")
        .type(AttributeType.STRING)
        .build())
    .encryption(TableEncryption.AWS_MANAGED)
    .build();
{{</highlight>}}

Now run the test again, which should now pass.

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
