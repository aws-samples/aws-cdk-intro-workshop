+++
title = "Exponiendo la tabla de nuestro contador"
weight = 400
+++

## Agregar una propiedad table a nuestro contador

Editaremos `src/CdkWorkshop/HitCounter.cs` y lo modificaremos para que `table` quede expuesto como una propiedad pública llamada `MyTable`.

{{<highlight csharp "hl_lines=18 30">}}
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
        public readonly Function Handler;
        public readonly Table MyTable;

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
            MyTable = table;

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

            // Grant the lambda role read/write permissions to our table
            table.GrantReadWriteData(Handler);

            // Grant the lambda role invoke permissions to the downstream function
            props.Downstream.GrantInvoke(Handler);
        }
    }
}
{{</highlight>}}

## Ahora podemos acceder a la tabla desde nuestro stack

Volveremos a `CdkWorkshopStack.cs` y asignaremos la propiedad `Table` del table viewer:

{{<highlight csharp "hl_lines=37">}}
using Amazon.CDK;
using Amazon.CDK.AWS.APIGateway;
using Amazon.CDK.AWS.Lambda;
using Cdklabs.DynamoTableViewer;
using Constructs;

namespace CdkWorkshop
{
    public class CdkWorkshopStack : Stack
    {
        public CdkWorkshopStack(Construct scope, string id) : base(scope, id)
        {
            // Defines a new lambda resource
            var hello = new Function(this, "HelloHandler", new FunctionProps
            {
                Runtime = Runtime.NODEJS_14_X, // execution environment
                Code = Code.FromAsset("lambda"), // Code loaded from the "lambda" directory
                Handler = "hello.handler" // file is "hello", function is "handler"
            });

            // Defines out HitCounter resource
            var helloWithCounter = new HitCounter(this, "HelloHitCounter", new HitCounterProps
            {
                Downstream = hello
            });

            // Defines an API Gateway REST API resource backed by our "hello" function.
            new LambdaRestApi(this, "Endpoint", new LambdaRestApiProps
            {
                Handler = helloWithCounter.Handler
            });

            // Defines a new TableViewer resource
            new TableViewer(this, "ViewerHitCount", new TableViewerProps
            {
                Title = "Hello Hits",
                Table = helloWithCounter.MyTable
            });
        }
    }
}

{{</highlight>}}

Terminamos de hacer cambios en el código, felicitaciones!
Ahora pueden guardar y cerrar el editor de código si quieren.
