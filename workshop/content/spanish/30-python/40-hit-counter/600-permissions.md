+++
title = "Otorgando permisos"
weight = 600
+++

## Permita que Lambda lea/escriba nuestra tabla de DynamoDB

Démosle permisos al rol de ejecución de Lambda para leer/escribir desde nuestra tabla.

Regrese a `hitcounter.py` y agregue la siguiente línea resaltada:

{{<highlight python "hl_lines=32">}}
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

        table.grant_read_write_data(self._handler)
{{</highlight>}}

## Despliegue

Guarda y deploy: 

```
cdk deploy
```

## Prueba de nuevo

Bien, la implementación está completa. Ejecutemos nuestra prueba nuevamente (ya sea usando `curl` o su navegador web):

```
curl -i https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

¿De nuevo?

```
HTTP/1.1 502 Bad Gateway
...

{"message": "Internal server error"}
```

# 😢

¡Seguimos recibiendo este molesto error 5xx! Veamos nuestros registros de CloudWatch nuevamente (haga clic en "Refresh"):

```json
{
    "errorMessage": "User: arn:aws:sts::585695036304:assumed-role/hello-cdk-1-HelloHitCounterHitCounterHandlerS-TU5M09L1UBID/hello-cdk-1-HelloHitCounterHitCounterHandlerD-144HVUNEWRWEO is not authorized to perform: lambda:InvokeFunction on resource: arn:aws:lambda:us-east-1:585695036304:function:hello-cdk-1-HelloHandler2E4FBA4D-149MVAO4969O7",
    "errorType": "AccessDeniedException",
    "stackTrace": [
        "Object.extractError (/var/runtime/node_modules/aws-sdk/lib/protocol/json.js:48:27)",
        "Request.extractError (/var/runtime/node_modules/aws-sdk/lib/protocol/rest_json.js:52:8)",
        "Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:105:20)",
        "Request.emit (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:77:10)",
        "Request.emit (/var/runtime/node_modules/aws-sdk/lib/request.js:683:14)",
        "Request.transition (/var/runtime/node_modules/aws-sdk/lib/request.js:22:10)",
        "AcceptorStateMachine.runTo (/var/runtime/node_modules/aws-sdk/lib/state_machine.js:14:12)",
        "/var/runtime/node_modules/aws-sdk/lib/state_machine.js:26:10",
        "Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:38:9)",
        "Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:685:12)"
    ]
}
```

Otro acceso denegado, pero esta vez, si miras de cerca:

```
User: <VERY-LONG-STRING> is not authorized to perform: lambda:InvokeFunction on resource: <VERY-LONG-STRING>"
```

Así que parece que nuestro contador de solicitudes logró escribir en la base de datos. Podemos confirmar yendo a la consola de [DynamoDB Console](https://console.aws.amazon.com/dynamodb/home):

![](./logs5.png)

Pero también debemos otorgar permisos a nuestro contador de visitas para solicitudes la función lambda downstream.

## Otorgar permisos de invocación 

Agregue las líneas resaltadas a `cdk_workshop/hitcounter.py`:

{{<highlight python "hl_lines=33-34">}}
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

        table.grant_read_write_data(self._handler)
        downstream.grant_invoke(self._handler)
{{</highlight>}}

## Diff

Puede verificar lo que esto hizo usando `cdk diff`:

```
cdk diff
```

La sección de **Resources** debería tener un aspecto similar a esto, que muestra que la declaración de IAM se agregó al rol:


```
Stack cdk-workshop
The cdk-workshop stack uses assets, which are currently not accounted for in the diff output! See https://github.com/awslabs/aws-cdk/issues/395
IAM Statement Changes
┌───┬────────────────────────┬────────┬────────────────────────┬────────────────────────┬───────────┐
│   │ Resource               │ Effect │ Action                 │ Principal              │ Condition │
├───┼────────────────────────┼────────┼────────────────────────┼────────────────────────┼───────────┤
│ + │ ${HelloHandler.Arn}    │ Allow  │ lambda:InvokeFunction  │ AWS:${HelloHitCounter/ │           │
│   │                        │        │                        │ HitCounterHandler/Serv │           │
│   │                        │        │                        │ iceRole}               │           │
└───┴────────────────────────┴────────┴────────────────────────┴────────────────────────┴───────────┘
(NOTE: There may be security-related changes not in this list. See http://bit.ly/cdk-2EhF7Np)

Resources
[~] AWS::IAM::Policy HelloHitCounter/HitCounterHandler/ServiceRole/DefaultPolicy HelloHitCounterHitCounterHandlerServiceRoleDefaultPolicy1487A60A
 └─ [~] PolicyDocument
     └─ [~] .Statement:
         └─ @@ -24,5 +24,15 @@
            [ ]         "Ref": "AWS::NoValue"
            [ ]       }
            [ ]     ]
            [+]   },
            [+]   {
            [+]     "Action": "lambda:InvokeFunction",
            [+]     "Effect": "Allow",
            [+]     "Resource": {
            [+]       "Fn::GetAtt": [
            [+]         "HelloHandler2E4FBA4D",
            [+]         "Arn"
            [+]       ]
            [+]     }
            [ ]   }
            [ ] ]
```

Que es exactamente lo que queríamos.

## Deploy

Bien... démosle otra oportunidad:

```
cdk deploy
```

Luego acceda a su punto de enlace con `curl` o con su navegador web:

```
curl -i https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

La salida debería verse así:

```
HTTP/1.1 200 OK
...

Hello, CDK! You've hit /
```

> Si aún obtiene 5xx, espere unos segundos e intente nuevamente. A veces, API Gateway tarda un poco en "voltear" el punto final para usar la nueva implementación.

# 😲
