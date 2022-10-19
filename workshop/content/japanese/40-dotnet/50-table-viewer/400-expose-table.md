+++
title = "HitCounter テーブルを公開"
weight = 400
+++

## HitCounter にテーブルのプロパティを追加

`src/CdkWorkshop/HitCounter.cs` を編集し、`table` が `MyTable` というパブリックプロパティとして公開されるように変更します。

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

## これでスタックからテーブルにアクセスできるようになりました

`CdkWorkshopStack.cs` に戻り、 `Table` プロパティを指定します。

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

コードの変更が完了したので、このファイルを保存し、`Ctrl-C` で `npm run watch` を終了します。
