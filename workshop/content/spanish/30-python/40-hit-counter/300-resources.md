+++
title = "Definir recursos"
weight = 300
+++

## Agregue recursos a la construcción del contador de solicitudes 

Ahora, definamos la función AWS Lambda y la tabla DynamoDB en nuestro constructo `HitCounter`. Regrese a `cdkworkshop/hitcounter.py` y agregue el siguiente código resaltado:

{{<highlight python "hl_lines=4 9-11 16-19 21-30">}}
from constructs import Construct
from aws_cdk import (
    aws_lambda as _lambda,
    aws_dynamodb as ddb,
)

class HitCounter(Construct):

    @property
    def handler(self):
        return self._handler    

    def __init__(self, scope: Construct, id: str, downstream: _lambda.IFunction, **kwargs):
        super().__init__(scope, id, **kwargs)

        table = ddb.Table(
            self, 'Hits',
            partition_key={'name': 'path', 'type': ddb.AttributeType.STRING}
        )

        self._handler = _lambda.Function(
            self, 'HitCountHandler',
            runtime=_lambda.Runtime.PYTHON_3_7,
            handler='hitcount.handler',
            code=_lambda.Code.from_asset('lambda'),
            environment={
                'DOWNSTREAM_FUNCTION_NAME': downstream.function_name,
                'HITS_TABLE_NAME': table.table_name,
            }
        )
{{</highlight>}}

## ¿Qué hicimos aquí?

Este código es bastante fácil de entender:

* Definimos una tabla de DynamoDB con `path` como partition key (todas las tablas de DynamoDB debe tener una sola partition key).
* Definimos una función Lambda que está vinculada al código `lambda/hitcount.handler`.
* __Conectamos__ las variables de entorno de Lambda a `function_name` y `table_name` de nuestros recursos.


## Valores enlazados en tiempo de ejecución

Las propiedades `function_name` y `table_name` son valores que solo se resuelven cuando deplegamos nuestro stack (observe que no hemos configurado estos nombres físicos cuando definimos la tabla/función, solo ID lógicos). Esto significa que si imprime sus valores durante la síntesis, obtendrá un "TOKEN", que es cómo el CDK representa estos valores enlazados en tiempo de ejecución. Debe tratar los tokens como *opaque strings*. Esto significa que puede concatenarlos juntos, por ejemplo, pero no caiga en la tentación de analizarlos en su código.
