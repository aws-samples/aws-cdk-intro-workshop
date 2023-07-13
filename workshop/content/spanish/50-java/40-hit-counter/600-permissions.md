+++
title = "Otorgando permisos"
weight = 600
+++

## Permita que Lambda lea/escriba nuestra tabla de DynamoDB

Démosle permisos al rol de ejecución de Lambda para leer/escribir desde nuestra tabla.

Regrese a `~/HitCounter.java` y agregue la siguiente línea resaltada:

{{<highlight java "hl_lines=40-41">}}
package com.myorg;

import java.util.HashMap;
import java.util.Map;

import software.constructs.Construct;

import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.AttributeType;
import software.amazon.awscdk.services.dynamodb.Table;
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

        // Grants the lambda function read/write permissions to our table
        this.table.grantReadWriteData(this.handler);
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
    "errorType": "AccessDeniedException",
    "errorMessage": "User: arn:aws:sts::XXXXXXXXXX:assumed-role/CdkWorkshopStack-HelloHitCounterHitCounterHandlerS-TU5M09L1UBID/CdkWorkshopStack-HelloHitCounterHitCounterHandlerD-144HVUNEWRWEO is not authorized to perform: lambda:InvokeFunction on resource: arn:aws:lambda:us-east-1:XXXXXXXXXXX:function:CdkWorkshopStack-HelloHandler2E4FBA4D-149MVAO4969O7",
    "stack": [
        "AccessDeniedException: User: arn:aws:sts::XXXXXXXXXX:assumed-role/CdkWorkshopStack-HelloHitCounterHitCounterHandlerS-TU5M09L1UBID/CdkWorkshopStack-HelloHitCounterHitCounterHandlerD-144HVUNEWRWEO is not authorized to perform: lambda:InvokeFunction on resource: arn:aws:lambda:us-east-1:XXXXXXXXXXX:function:CdkWorkshopStack-HelloHandler2E4FBA4D-149MVAO4969O7",
        "at Object.extractError (/var/runtime/node_modules/aws-sdk/lib/protocol/json.js:48:27)",
        "at Request.extractError (/var/runtime/node_modules/aws-sdk/lib/protocol/rest_json.js:52:8)",
        "at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:105:20)",
        "at Request.emit (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:77:10)",
        "at Request.emit (/var/runtime/node_modules/aws-sdk/lib/request.js:683:14)",
        "at Request.transition (/var/runtime/node_modules/aws-sdk/lib/request.js:22:10)",
        "at AcceptorStateMachine.runTo (/var/runtime/node_modules/aws-sdk/lib/state_machine.js:14:12)",
        "at /var/runtime/node_modules/aws-sdk/lib/state_machine.js:26:10",
        "at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:38:9)",
        "at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:685:12)"
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

Agregue las líneas resaltadas a `src/CdkWorkshop/HitCounter.java`:


{{<highlight java "hl_lines=43-44">}}
package com.myorg;

import java.util.HashMap;
import java.util.Map;

import software.constructs.Construct;

import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.AttributeType;
import software.amazon.awscdk.services.dynamodb.Table;
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

        // Grants the lambda function read/write permissions to our table
        this.table.grantReadWriteData(this.handler);

        // Grants the lambda function invoke permissions to the downstream function
        props.getDownstream().grantInvoke(this.handler);
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

## Diff

Puede verificar lo que esto hizo usando `cdk diff`:

```
cdk diff
```

La sección de **Resources** debería tener un aspecto similar a esto, que muestra que la declaración de IAM se agregó al rol:

```
IAM Statement Changes
┌───┬────────────────────────────────────────┬────────┬────────────────────────────────────────┬─────────────────────────────────────────┬───────────┐
│   │ Resource                               │ Effect │ Action                                 │ Principal                               │ Condition │
├───┼────────────────────────────────────────┼────────┼────────────────────────────────────────┼─────────────────────────────────────────┼───────────┤
│ + │ ${HelloHandler.Arn}                    │ Allow  │ lambda:InvokeFunction                  │ AWS:${HelloHitCounter/HitCounterHandler │           │
│   │                                        │        │                                        │ /ServiceRole}                           │           │
├───┼────────────────────────────────────────┼────────┼────────────────────────────────────────┼─────────────────────────────────────────┼───────────┤
│ + │ ${HelloHitCounter/Hits.Arn}            │ Allow  │ dynamodb:BatchGetItem                  │ AWS:${HelloHitCounter/HitCounterHandler │           │
│   │                                        │        │ dynamodb:BatchWriteItem                │ /ServiceRole}                           │           │
│   │                                        │        │ dynamodb:DeleteItem                    │                                         │           │
│   │                                        │        │ dynamodb:GetItem                       │                                         │           │
│   │                                        │        │ dynamodb:GetRecords                    │                                         │           │
│   │                                        │        │ dynamodb:GetShardIterator              │                                         │           │
│   │                                        │        │ dynamodb:PutItem                       │                                         │           │
│   │                                        │        │ dynamodb:Query                         │                                         │           │
│   │                                        │        │ dynamodb:Scan                          │                                         │           │
│   │                                        │        │ dynamodb:UpdateItem                    │                                         │           │
└───┴────────────────────────────────────────┴────────┴────────────────────────────────────────┴─────────────────────────────────────────┴───────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Resources
[+] AWS::IAM::Policy HelloHitCounter/HitCounterHandler/ServiceRole/DefaultPolicy HelloHitCounterHitCounterHandlerServiceRoleDefaultPolicy1487A60A
[~] AWS::Lambda::Function HelloHitCounter/HitCounterHandler HelloHitCounterHitCounterHandlerDAEA7B37
 └─ [~] DependsOn
     └─ @@ -1,3 +1,4 @@
        [ ] [
        [+]   "HelloHitCounterHitCounterHandlerServiceRoleDefaultPolicy1487A60A",
        [ ]   "HelloHitCounterHitCounterHandlerServiceRoleD45002B8"
        [ ] ]

```

Que es exactamente lo que queríamos.

## Despliegue

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
