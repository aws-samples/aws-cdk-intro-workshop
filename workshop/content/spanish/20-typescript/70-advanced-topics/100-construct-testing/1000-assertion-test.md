+++
title = "Pruebas de Aserción"
weight = 200
+++

### Pruebas de Aserción Detalladas

#### Crear una prueba para la tabla de DynamoDB

{{% notice info %}} Esta sección asume que usted ha [creado el constructo contador de hits](/es/20-typescript/40-hit-counter.html) {{% /notice %}}

Nuestro constructo `HitCounter` crea una tabla simple de DynamoDB. Ahora, creemos una prueba que valide que la tabla está siendo creada.

Si `cdk init` creó un directorio llamado `test` por usted, entonces usted debe tener allí un archivo llamado `cdk-workshop.test.ts`. Borre este archivo.

Si usted no cuenta con un directorio llamado `test` (que es automáticamente creado cuento se ejecuta `cdk init`), entonces cree un directorio `test` al mismo nivel que `bin` y `lib` y luego un archivo llamado `hitcounter.test.ts` con el siguiente código:

```typescript
import { Template, Capture } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter }  from '../lib/hitcounter';

test('DynamoDB Table Created', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    })
  });
  // THEN

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});
```
Esta prueba simplemente está asegurando que la pila sintetizada incluye una tabla de DynamoDB.

Ejecute la prueba.

```bash
$ npm run test
```

Usted debería ver una salida similar a esta:

```bash
$ npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (182ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        3.273s
Ran all test suites.
```

#### Crear una prueba para la función Lambda

Ahora adicionemos otra prueba, esta vez para la función Lambda que el constructo `HitCounter` crea.
Además de probar que la función Lambda es creada, también queremos probar que es creada con las dos variables de entorno `DOWNSTREAM_FUNCTION_NAME` & `HITS_TABLE_NAME`.

Adicione otra prueba debajo de la prueba de la tabla de DynamoDB. Si recuerda, cuando creamos la función Lambda los valores de las variables de entorno eran referencias a otros constructos.

{{<highlight ts "hl_lines=6-7">}}
this.handler = new lambda.Function(this, 'HitCounterHandler', {
  runtime: lambda.Runtime.NODEJS_14_X,
  handler: 'hitcounter.handler',
  code: lambda.Code.fromAsset('lambda'),
  environment: {
    DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
    HITS_TABLE_NAME: table.tableName
  }
});
{{</highlight>}}

En este punto no sabemos realmente cuales serán los valores de `functionName` o `tableName` ya que CDK calculará un hash que será añadido al final del nombre de los constructos, así que utilizaremos un valor ficticio por el momento. Una vez que ejecutemos la prueba, fallará y nos mostrará el valor esperado.

Cree una nueva prueba en `hitcounter.test.ts` con el siguiente código:

```typescript
test('Lambda Has Environment Variables', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    })
  });
  // THEN
  const template = Template.fromStack(stack);
  const envCapture = new Capture();
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual(
    {
      Variables: {
        DOWNSTREAM_FUNCTION_NAME: {
          Ref: "TestFunctionXXXXX",
        },
        HITS_TABLE_NAME: {
          Ref: "MyTestConstructHitsXXXXX",
        },
      },
    }
  );
});
```

Guarde el archivo y ejecute la prueba de nuevo.

```bash
$ npm run test
```

Esta vez la prueba debe fallar y usted podrá obtener los valores correctos para las variables de la salida.

{{<highlight bash "hl_lines=20-21 24-25">}}
$ npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 FAIL  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (184ms)
  ✕ Lambda Has Environment Variables (53ms)

  ● Lambda Has Environment Variables

    expect(received).toEqual(expected) // deep equality

    - Expected  - 2
    + Received  + 2

      Object {
        "Variables": Object {
          "DOWNSTREAM_FUNCTION_NAME": Object {
    -       "Ref": "TestFunctionXXXXX",
    +       "Ref": "TestFunction22AD90FC",
          },
          "HITS_TABLE_NAME": Object {
    -       "Ref": "MyTestConstructHitsXXXXX",
    +       "Ref": "MyTestConstructHits24A357F0",
          },
        },
      }

      37 |     Environment: envCapture,
      38 |   });
    > 39 |   expect(envCapture.asObject()).toEqual(
         |                                 ^
      40 |     {
      41 |       Variables: {
      42 |         DOWNSTREAM_FUNCTION_NAME: {

      at Object.<anonymous> (test/hitcounter.test.ts:39:33)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        3.971 s, estimated 4 s
Ran all test suites.
{{</highlight>}}

Tome nota de los valores reales para las variables de entorno y actualice su prueba.

{{<highlight ts "hl_lines=22 25">}}
test('Lambda Has Environment Variables', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    })
  });
  // THEN
  const template = Template.fromStack(stack);
  const envCapture = new Capture();
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual(
    {
      Variables: {
        DOWNSTREAM_FUNCTION_NAME: {
          Ref: "VALUE_GOES_HERE",
        },
        HITS_TABLE_NAME: {
          Ref: "VALUE_GOES_HERE",
        },
      },
    }
  );
});
{{</highlight>}}

Ahora, ejecute la prueba de nuevo.  Esta vez debe ser exitosa.

```bash
$ npm run test
```

Usted debe ver una salida como la siguiente:

```bash
$ npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (182ms)
  ✓ Lambda Has Environment Variables (50ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        3.294s
Ran all test suites.
```

Usted también puede aplicar TDD (Test Driven Development) para desarrollar Constructos de CDK. Para mostrar un ejemplo muy simple, adicionemos un nuevo requerimiento para que nuestra tabla de Dynamo DB sea encriptada.

Primero actualizaremos la prueba para reflejar este nuevo requerimiento.

{{<highlight ts "hl_lines=6-23">}}
import { Template, Capture } from 'aws-cdk-lib/assertions';
import cdk = require('aws-cdk-lib');
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter }  from '../lib/hitcounter';

test('DynamoDB Table Created With Encryption', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    })
  });
  // THEN
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    SSESpecification: {
      SSEEnabled: true
    }
  });
});
{{</highlight>}}

Ahora ejecutemos la prueba, que debe fallar.

```bash
$ npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 FAIL  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (170ms)
  ✓ Lambda Has Environment Variables (50ms)
  ✕ DynamoDB Table Created With Encryption (49ms)

  ● DynamoDB Table Created With Encryption

    Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.
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

      63 |
      64 |   const template = Template.fromStack(stack);
    > 65 |   template.hasResourceProperties("AWS::DynamoDB::Table", {
         |            ^
      66 |     SSESpecification: {
      67 |       SSEEnabled: true
      68 |     }

      at Template.hasResourceProperties (node_modules/aws-cdk-lib/assertions/lib/template.ts:50:13)
      at Object.<anonymous> (test/hitcounter.test.ts:65:12)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 3 passed, 4 total
Snapshots:   0 total
Time:        3.947 s, estimated 4 s
Ran all test suites.
```

Ahora, corrijamos el problema. Actualicemos el código de hitcounter para habilitar la encripción por defecto.

{{<highlight ts "hl_lines=13">}}
export class HitCounter extends Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  /** the hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
      encryption: dynamodb.TableEncryption.AWS_MANAGED
    });
    ...
  }
}
{{</highlight>}}

Ejecutemos la prueba nuevamente, esta vez debe ser exitosa.

```bash
npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (171ms)
  ✓ Lambda Has Environment Variables (52ms)
  ✓ DynamoDB Table Created With Encryption (47ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        3.913s
Ran all test suites.
```
