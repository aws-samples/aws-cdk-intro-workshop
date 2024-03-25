+++
title = "Controlador del contador de solicitudes"
weight = 100
+++

## Controlador de Lambda para el Hit counter

Ahora escribiremos el código del controlador Lambda para nuestro contador de solicitudes.

Cree el archivo `lambda/hitcount.py`:

```python
import json
import os

import boto3

ddb = boto3.resource('dynamodb')
table = ddb.Table(os.environ['HITS_TABLE_NAME'])
_lambda = boto3.client('lambda')


def handler(event, context):
    print('request: {}'.format(json.dumps(event)))
    table.update_item(
        Key={'path': event['path']},
        UpdateExpression='ADD hits :incr',
        ExpressionAttributeValues={':incr': 1}
    )

    resp = _lambda.invoke(
        FunctionName=os.environ['DOWNSTREAM_FUNCTION_NAME'],
        Payload=json.dumps(event),
    )

    body = resp['Payload'].read()

    print('downstream response: {}'.format(body))
    return json.loads(body)
```

## Descubriendo recursos en tiempo de ejecución 

Notarás que este código se basa en dos variables de entorno: 

 * `HITS_TABLE_NAME` es el nombre de la tabla de DynamoDB que se usará para el almacenamiento. 
 * `DOWNSTREAM_FUNCTION_NAME` es el nombre de la función downstream de AWS Lambda.

Dado que el nombre real de la tabla y la función downstream solo se decidirán cuando implementemos nuestra aplicación, debemos conectar estos valores desde nuestro constructo. Lo haremos en la siguiente sección.