+++
title = "Pruebas de Validación"
weight = 300
+++

### Pruebas de Validación

Algunas veces queremos que las entradas sean configurables, pero a la misma vez queremos poner restricciones en las entradas o validar que los valores asignados a ellas sean correctos.

Supongamos que para el constructo `HitCounter` queremos permitir al usuario especificar la capacidad de lectura (`read_capacity`) en la tabla de DynamoDB, pero también queremos asegurar que el valor asignado está dentro de un rango razonable. Podemos escribir una prueba que asegure que la lógica de validación trabaje: pasar valores no válidos y observar el resultado.

Primero, adicionemos la propiedad `read_capacity` a `HitCounter`:

{{<highlight python "hl_lines=11">}}
class HitCounter(Construct):

    @property
    def handler(self):
        return self._handler

    @property
    def table(self):
        return self._table

    def __init__(self, scope: Construct, id: str, downstream: _lambda.IFunction, read_capacity: int = 5, **kwargs):

    ...
{{</highlight>}}

Luego, actualizemos la tabla de DynamoDB para adicionar la propiedad `read_capacity`.

{{<highlight python "hl_lines=5">}}
self._table = ddb.Table(
    self, 'Hits',
    partition_key={'name': 'path', 'type': ddb.AttributeType.STRING},
    encryption=ddb.TableEncryption.AWS_MANAGED,
    read_capacity=read_capacity,
)
{{</highlight>}}

Ahora adicionemos una validación que generará un error si la propiedad `read_capacity` no está dentro del rango permitido.

{{<highlight python "hl_lines=12-13">}}
class HitCounter(Construct):

    @property
    def handler(self):
        return self._handler

    @property
    def table(self):
        return self._table

    def __init__(self, scope: Construct, id: str, downstream: _lambda.IFunction, read_capacity: int = 5, **kwargs):
        if read_capacity < 5 or read_capacity > 20:
                raise ValueError("readCapacity must be greater than 5 or less than 20")

        super().__init__(scope, id, **kwargs)

        ...
{{</highlight>}}

Y por último, adicionemos una prueba que valide si se generó un error.

```python
def test_dynamodb_raises():
    stack = Stack()
    with pytest.raises(Exception):
        HitCounter(stack, "HitCounter",
                downstream=_lambda.Function(stack, "TestFunction",
                    runtime=_lambda.Runtime.PYTHON_3_7,
                    handler='hello.handler',
                    code=_lambda.Code.from_asset('lambda')),
                read_capacity=1,
                )
```

Ejecutemos la prueba.

```bash
$ pytest
```

Usted debería ver una salida similar a esta:

```bash
$ pytest

================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 4 items

tests/unit/test_cdk_workshop.py ....                                                                                                                                                                            [100%]

================================================================================================== 4 passed in 1.59s ==================================================================================================
```
