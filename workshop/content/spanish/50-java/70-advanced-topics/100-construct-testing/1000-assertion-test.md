+++
title = "Pruebas de Aserción"
weight = 200
+++

### Pruebas de Aserción Detalladas

#### Crear una prueba para la tabla de DynamoDB

{{% notice info %}} Esta sección asume que usted ha [creado el constructo contador de hits](/es/50-java/40-hit-counter.html) {{% /notice %}}

Nuestro constructo `HitCounter` crea una tabla simple de DynamoDB. Ahora, creemos una prueba que valide que la tabla está siendo creada.

Ya que borramos el directorio `src/test` (usualmente creado automáticamente cuando se ejecuta `cdk init`), es necesario crear un nuevo directorio `test` bajo `src`:

```bash
mkdir -p src/test/java/com/myorg
```

Y luego creemos un archivo llamado `HitCounterTest.java` con el siguiente código.

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

Esta prueba simplemente está asegurando que la pila sintetizada incluye una tabla de DynamoDB.

Ejecute la prueba.

```bash
$ mvn test
```

Usted debería ver una salida similar a esta:

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

#### Crear una prueba para la función Lambda

Ahora adicionemos otra prueba, esta vez para la función Lambda que el constructo `HitCounter` crea.
Además de probar que la función Lambda es creada, también queremos probar que es creada con las dos variables de entorno `DOWNSTREAM_FUNCTION_NAME` & `HITS_TABLE_NAME`.

Adicione otra prueba debajo de la prueba de la tabla de DynamoDB. Si recuerda, cuando creamos la función Lambda los valores de las variables de entorno eran referencias a otros constructos.

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

En este punto no sabemos realmente cuales serán los valores de `functionName` o `tableName` ya que CDK calculará un hash que será añadido al final del nombre de los constructos, así que utilizaremos un valor ficticio por el momento. Una vez que ejecutemos la prueba, fallará y nos mostrará el valor esperado.

Cree una nueva prueba en `HitCounterTest.Java` con el siguiente código:

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

Guarde el archivo y ejecute la prueba de nuevo.

```bash
$ mvn test
```

Esta vez la prueba debe fallar y usted podrá obtener los valores correctos para las variables de la salida.

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

Tome nota de los valores reales para las variables de entorno y actualice su prueba.

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

Ahora, ejecute la prueba de nuevo.  Esta vez debe ser exitosa.

```bash
$ mvn test
```

Usted debe ver una salida como la siguiente:

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

Usted también puede aplicar TDD (Test Driven Development) para desarrollar Constructos de CDK. Para mostrar un ejemplo muy simple, adicionemos un nuevo requerimiento para que nuestra tabla de Dynamo DB sea encriptada.

Primero actualizaremos la prueba para reflejar este nuevo requerimiento.

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

Ahora ejecutemos la prueba, que debe fallar.

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

Ahora, corrijamos el problema. Actualicemos el código de hitcounter para habilitar la encripción por defecto.

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

Ejecutemos la prueba nuevamente, esta vez debe ser exitosa.

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
