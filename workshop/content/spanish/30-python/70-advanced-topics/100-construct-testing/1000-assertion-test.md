+++
title = "Pruebas de Aserción"
weight = 200
+++

### Pruebas de Aserción Detalladas

#### Crear una prueba para la tabla de DynamoDB

{{% notice info %}} Esta sección asume que usted ha [creado el constructo contador de hits](/es/30-python/40-hit-counter.html) {{% /notice %}}

Nuestro constructo `HitCounter` crea una tabla simple de DynamoDB. Ahora, creemos una prueba que valide que la tabla está siendo creada.

Si usted ha creado el proyecto con `cdk init` entonces usted debe contar ya con un directorio llamado `tests`. En este caso usted necesitará remover el archivo llamado `test_cdk_workshop_stack.py` que se encuentra allí.

Si usted no cuenta con un directorio llamado `tests` (que es automáticamente creado cuento se ejecuta `cdk init`), entonces cree un directorio `tests` en la raíz del proyecto y luego cree los siguientes archivos:

```bash
mkdir -p tests/unit
touch tests/__init__.py
touch tests/unit/__init__.py
touch tests/unit/test_cdk_workshop.py
```

En el archivo llamado `test_cdk_workshop.py` cree su primera prueba utilizando el siguiente código.

```python
from aws_cdk import (
        Stack,
        aws_lambda as _lambda,
        assertions
    )
from cdk_workshop.hitcounter import HitCounter
import pytest


def test_dynamodb_table_created():
    stack = Stack()
    HitCounter(stack, "HitCounter",
            downstream=_lambda.Function(stack, "TestFunction",
                runtime=_lambda.Runtime.PYTHON_3_7,
                handler='hello.handler',
                code=_lambda.Code.from_asset('lambda')),
    )
    template = assertions.Template.from_stack(stack)
    template.resource_count_is("AWS::DynamoDB::Table", 1)
```

Esta prueba simplemente está asegurando que la pila sintetizada incluye una tabla de DynamoDB.

Ejecute la prueba.

```bash
$ pytest
```

Usted debería ver una salida similar a esta:

```bash
$ pytest
================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 1 item

tests/unit/test_cdk_workshop.py .                                                                                                                                                                               [100%]

================================================================================================== 1 passed in 1.49s ==================================================================================================
```

#### Crear una prueba para la función Lambda

Ahora adicionemos otra prueba, esta vez para la función Lambda que el constructo `HitCounter` crea.
Además de probar que la función Lambda es creada, también queremos probar que es creada con las dos variables de entorno `DOWNSTREAM_FUNCTION_NAME` & `HITS_TABLE_NAME`.

Adicione otra prueba debajo de la prueba de la tabla de DynamoDB. Si recuerda, cuando creamos la función Lambda los valores de las variables de entorno eran referencias a otros constructos.

{{<highlight python "hl_lines=7-8">}}
self._handler = _lambda.Function(
    self, 'HitCounterHandler',
    runtime=_lambda.Runtime.PYTHON_3_7,
    handler='hitcount.handler',
    code=_lambda.Code.from_asset('lambda'),
    environment={
        'DOWNSTREAM_FUNCTION_NAME': downstream.function_name,
        'HITS_TABLE_NAME': self._table.table_name
    }
)
{{</highlight>}}

En este punto no sabemos realmente cuales serán los valores de `function_name` o `table_name` ya que CDK calculará un hash que será añadido al final del nombre de los constructos, así que utilizaremos un valor ficticio por el momento. Una vez que ejecutemos la prueba, fallará y nos mostrará el valor esperado.

Cree una nueva prueba en `test_cdk_workshop.py` con el siguiente código:

```python
def test_lambda_has_env_vars():
    stack = Stack()
    HitCounter(stack, "HitCounter",
            downstream=_lambda.Function(stack, "TestFunction",
                runtime=_lambda.Runtime.PYTHON_3_7,
                handler='hello.handler',
                code=_lambda.Code.from_asset('lambda')))

    template = assertions.Template.from_stack(stack)
    envCapture = assertions.Capture()

    template.has_resource_properties("AWS::Lambda::Function", {
        "Handler": "hitcount.handler",
        "Environment": envCapture,
        })

    assert envCapture.as_object() == {
            "Variables": {
                "DOWNSTREAM_FUNCTION_NAME": {"Ref": "TestFunctionXXXXX"},
                "HITS_TABLE_NAME": {"Ref": "HitCounterHitsXXXXXX"},
                },
            }
```

Guarde el archivo y ejecute la prueba de nuevo.

```bash
$ pytest
```

Esta vez la prueba debe fallar y usted podrá obtener los valores correctos para las variables de la salida.

{{<highlight bash "hl_lines=17">}}
$ pytest
================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 2 items

tests/unit/test_cdk_workshop.py .F                                                                                                                                                                              [100%]

====================================================================================================== FAILURES =======================================================================================================
______________________________________________________________________________________________ test_lambda_has_env_vars _______________________________________________________________________________________________

    ...


E       AssertionError: assert {'Variables':...ts079767E5'}}} == {'Variables':...tsXXXXXXXX'}}}
E         Differing items:
E         {'Variables': {'DOWNSTREAM_FUNCTION_NAME': {'Ref': 'TestFunction22AD90FC'}, 'HITS_TABLE_NAME': {'Ref': 'HitCounterHits079767E5'}}} != {'Variables': {'DOWNSTREAM_FUNCTION_NAME': {'Ref': 'TestFunctionXXXXXXXX'}, 'HITS_TABLE_NAME': {'Ref': 'HitCounterHitsXXXXXXXX'}}}
E         Use -v to get the full diff

tests/unit/test_cdk_workshop.py:35: AssertionError
=============================================================================================== short test summary info ===============================================================================================
FAILED tests/unit/test_cdk_workshop.py::test_lambda_has_env_vars - AssertionError: assert {'Variables':...ts079767E5'}}} == {'Variables':...tsXXXXXXXX'}}}
============================================================================================= 1 failed, 1 passed in 1.60s =============================================================================================
{{</highlight>}}

Tome nota de los valores reales para las variables de entorno y actualice su prueba.

{{<highlight python "hl_lines=16-17">}}
def test_lambda_has_env_vars():
    stack = Stack()
    HitCounter(stack, "HitCounter",
            downstream=_lambda.Function(stack, "TestFunction",
                runtime=_lambda.Runtime.PYTHON_3_7,
                handler='hello.handler',
                code=_lambda.Code.from_asset('lambda')))
    template = assertions.Template.from_stack(stack)
    envCapture = assertions.Capture()
    template.has_resource_properties("AWS::Lambda::Function", {
        "Handler": "hitcount.handler",
        "Environment": envCapture,
        })
    assert envCapture.as_object() == {
            "Variables": {
                "DOWNSTREAM_FUNCTION_NAME": {"Ref": "REPLACE_VALUE_HERE"},
                "HITS_TABLE_NAME": {"Ref": "REPLACE_VALUE_HERE"},
                },
            }

{{</highlight>}}

Ahora, ejecute la prueba de nuevo.  Esta vez debe ser exitosa.

```bash
$ pytest
```

Usted debe ver una salida como la siguiente:

```bash
$ pytest

================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 2 items

tests/unit/test_cdk_workshop.py ..                                                                                                                                                                              [100%]

================================================================================================== 2 passed in 1.58s ==================================================================================================
```

Usted también puede aplicar TDD (Test Driven Development) para desarrollar Constructos de CDK. Para mostrar un ejemplo muy simple, adicionemos un nuevo requerimiento para que nuestra tabla de Dynamo DB sea encriptada.

Primero actualizaremos la prueba para reflejar este nuevo requerimiento.

{{<highlight python>}}
def test_dynamodb_with_encryption():
    stack = Stack()
    HitCounter(stack, "HitCounter",
            downstream=_lambda.Function(stack, "TestFunction",
                runtime=_lambda.Runtime.PYTHON_3_7,
                handler='hello.handler',
                code=_lambda.Code.from_asset('lambda')))

    template = assertions.Template.from_stack(stack)
    template.has_resource_properties("AWS::DynamoDB::Table", {
        "SSESpecification": {
            "SSEEnabled": True,
            },
        })
{{</highlight>}}

Ahora ejecutemos la prueba, que debe fallar.

```bash
$ pytest
================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 3 items

tests/unit/test_cdk_workshop.py ..F                                                                                                                                                                             [100%]

====================================================================================================== FAILURES =======================================================================================================
____________________________________________________________________________________________ test_dynamodb_with_encryption ____________________________________________________________________________________________
jsii.errors.JavaScriptError:
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
      at Template.hasResourceProperties (/tmp/jsii-kernel-4Be5Dy/node_modules/@aws-cdk/assertions/lib/template.js:85:19)
      at /tmp/tmpdj0kczj7/lib/program.js:8248:134
      at Kernel._wrapSandboxCode (/tmp/tmpdj0kczj7/lib/program.js:8860:24)
      at /tmp/tmpdj0kczj7/lib/program.js:8248:107
      at Kernel._ensureSync (/tmp/tmpdj0kczj7/lib/program.js:8841:28)
      at Kernel.invoke (/tmp/tmpdj0kczj7/lib/program.js:8248:34)
      at KernelHost.processRequest (/tmp/tmpdj0kczj7/lib/program.js:9757:36)
      at KernelHost.run (/tmp/tmpdj0kczj7/lib/program.js:9720:22)
      at Immediate._onImmediate (/tmp/tmpdj0kczj7/lib/program.js:9721:46)
      at processImmediate (internal/timers.js:464:21)

The above exception was the direct cause of the following exception:

    ...more error info...

=============================================================================================== short test summary info ===============================================================================================
FAILED tests/unit/test_cdk_workshop.py::test_dynamodb_with_encryption - jsii.errors.JSIIError: Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.
============================================================================================= 1 failed, 2 passed in 1.65s =============================================================================================
```

Ahora, corrijamos el problema. Actualicemos el código de hitcounter para habilitar la encripción por defecto.

Edite `hitcounter.py`
{{<highlight python "hl_lines=4">}}
self._table = ddb.Table(
    self, 'Hits',
    partition_key={'name': 'path', 'type': ddb.AttributeType.STRING},
    encryption=ddb.TableEncryption.AWS_MANAGED,
)
{{</highlight>}}

Ejecutemos la prueba nuevamente, esta vez debe ser exitosa.

```bash
$ pytest

================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 3 items

tests/unit/test_cdk_workshop.py ...                                                                                                                                                                             [100%]

================================================================================================== 3 passed in 1.59s ==================================================================================================
```
