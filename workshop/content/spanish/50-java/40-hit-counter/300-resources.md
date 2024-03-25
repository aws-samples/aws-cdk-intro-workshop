+++
title = "Definir recursos"
weight = 300
+++

## AAgregue recursos a la construcción del contador de solicitudes 

Ahora, definamos la función AWS Lambda y la tabla DynamoDB en nuestro constructo `HitCounter`. 

Regrese a `~/HitCounter.java` y agregue el siguiente código resaltado:

{{<highlight java "hl_lines=3-4 8-13 16-17 22-38 41-53">}}
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

## ¿Qué hicimos aquí?

Este código es bastante fácil de entender:

* Definimos una tabla de DynamoDB con `path` como partition key (todas las tablas de DynamoDB debe tener una sola partition key).
* Definimos una función Lambda que está vinculada al código `lambda/hitcount.handler`.
* __Conectamos__ las variables de entorno de Lambda a `Function.name` y `Table.name` de nuestros recursos via `environment.put(...)`.

## Valores enlazados en tiempo de ejecución

Las propiedades `FunctionName` y `TableName` son valores que solo se resuelven cuando deplegamos nuestro stack (observe que no hemos configurado estos nombres físicos cuando definimos la tabla/función, solo ID lógicos). Esto significa que si imprime sus valores durante la síntesis, obtendrá un "TOKEN", que es cómo el CDK representa estos valores enlazados en tiempo de ejecución. Debe tratar los tokens como *opaque strings*. Esto significa que puede concatenarlos juntos, por ejemplo, pero no caiga en la tentación de analizarlos en su código.
