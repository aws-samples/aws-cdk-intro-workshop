+++
title = "Definir recursos"
weight = 300
+++

## Agregue recursos a la construcción del contador de solicitudes

Now, let's define the AWS Lambda function and the DynamoDB table in our
`HitCounter` construct. Go back to `lib/hitcounter.ts` and add the following highlighted code:

{{<highlight ts "hl_lines=3 13-14 19-31">}}
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;
}

export class HitCounter extends Construct {

  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'Hits', {
        partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
    });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'hitcounter.handler',
        code: lambda.Code.fromAsset('lambda'),
        environment: {
            DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
            HITS_TABLE_NAME: table.tableName
        }
    });
  }
}
{{</highlight>}}

## ¿Qué hicimos aquí?

Este código es bastante fácil de entender:

* Definimos una tabla de DynamoDB con `path` como partition key (todas las tablas de DynamoDB debe tener una sola partition key).
* Definimos una función Lambda que está vinculada al código `lambda/hitcount.handler`.
* __Conectamos__ las variables de entorno de Lambda a `functionName` y `tableName` de nuestros recursos.

## Valores enlazados en tiempo de ejecución

Las propiedades `functionName` y `tableName` son valores que solo se resuelven cuando deplegamos nuestro stack (observe que no hemos configurado estos nombres físicos cuando definimos la tabla/función, solo ID lógicos). Esto significa que si imprime sus valores durante la síntesis, obtendrá un "TOKEN", que es cómo el CDK representa estos valores enlazados en tiempo de ejecución. Debe tratar los tokens como *opaque strings*. Esto significa que puede concatenarlos juntos, por ejemplo, pero no caiga en la tentación de analizarlos en su código.
