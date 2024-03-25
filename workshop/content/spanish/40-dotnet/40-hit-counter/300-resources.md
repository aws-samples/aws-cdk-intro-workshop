+++
title = "Definir recursos"
weight = 300
+++

## Agregue recursos a la construcción del contador de solicitudes

hora, definamos la función AWS Lambda y la tabla DynamoDB en nuestro constructo `HitCounter`.

Regrese a `src/CdkWorkshop/HitCounter.cs` y agregue el siguiente código resaltado:

{{<highlight csharp "hl_lines=2 5 17 21-40">}}
using Amazon.CDK;
using Amazon.CDK.AWS.DynamoDB;
using Amazon.CDK.AWS.Lambda;
using Constructs;
using System.Collections.Generic;

namespace CdkWorkshop
{
    public class HitCounterProps
    {
        // The function for which we want to count url hits
        public IFunction Downstream { get; set; }
    }

    public class HitCounter : Construct
    {
        public Function Handler { get; }

        public HitCounter(Construct scope, string id, HitCounterProps props) : base(scope, id)
        {
            var table = new Table(this, "Hits", new TableProps
            {
                PartitionKey = new Attribute
                {
                    Name = "path",
                    Type = AttributeType.STRING
                }
            });

            Handler = new Function(this, "HitCounterHandler", new FunctionProps
            {
                Runtime = Runtime.NODEJS_14_X,
                Handler = "hitcounter.handler",
                Code = Code.FromAsset("lambda"),
                Environment = new Dictionary<string, string>
                {
                    ["DOWNSTREAM_FUNCTION_NAME"] = props.Downstream.FunctionName,
                    ["HITS_TABLE_NAME"] = table.TableName
                }
            });
        }
    }
}

{{</highlight>}}

## ¿Qué hicimos aquí?

Este código es bastante fácil de entender:

* Definimos una tabla de DynamoDB con `path` como partition key (todas las tablas de DynamoDB debe tener una sola partition key).
* Definimos una función Lambda que está vinculada al código `lambda/hitcount.handler`.
* __Conectamos__ las variables de entorno de Lambda a `FunctionName` y `TableName` de nuestros recursos.


## Valores enlazados en tiempo de ejecución

Las propiedades `FunctionName` y `TableName` son valores que solo se resuelven cuando deplegamos nuestro stack (observe que no hemos configurado estos nombres físicos cuando definimos la tabla/función, solo ID lógicos). Esto significa que si imprime sus valores durante la síntesis, obtendrá un "TOKEN", que es cómo el CDK representa estos valores enlazados en tiempo de ejecución. Debe tratar los tokens como *opaque strings*. Esto significa que puede concatenarlos juntos, por ejemplo, pero no caiga en la tentación de analizarlos en su código.
