+++
title = "Define resources"
weight = 300
+++

## Add resources to the hit counter construct

Now, let's define the AWS Lambda function and the DynamoDB table in our
`HitCounter` construct.

As usual, we first need to install the DynamoDB construct library (we already
have the Lambda library installed):

```
dotnet add package Amazon.CDK.AWS.Dynamodb
```

Now, go back to `src/CdkWorkshop/HitCounter.cs` and add the following highlighted code:

{{<highlight ts "hl_lines=3-4 16 20-39">}}
using Amazon.CDK;
using Amazon.CDK.AWS.Lambda;
using Amazon.CDK.AWS.DynamoDB;
using System.Collections.Generic;

namespace CdkWorkshop
{
    public interface HitCounterProps
    {
        // The function for which we want to count url hits
        IFunction Downstream { get; set; }
    }

    public class HitCounter : Construct
    {
        public readonly Function Handler;

        public HitCounter(Construct scope, string id, HitCounterProps props) : base(scope, id, props)
        {
            var table = new Table(this, "Hits", new TableProps()
            {
                PartitionKey = new Attribute()
                {
                    Name = "path",
                    Type = AttributeType.STRING
                }
            });

            Handler = new Function(this, "HitCounterHandler", new FunctionProps()
            {
                Runtime = Runtime.NODEJS_10_X,
                Handler = "hitcounter.handler",
                Code = Code.Asset("lambda"),
                Environment = new Dictionary<string, string>()
                {
                    {"DOWNSTREAM_FUNCTION_NAME", props.Downstream.FunctionName},
                    {"HITS_TABLE_NAME", table.TableName}
                }
            });
        }
    }
}

{{</highlight>}}

## What did we do here?

This code is hopefully quite easy to understand:

 * We defined a DynamoDB table with `path` as the partition key (every DynamoDB
   table must have a single partition key).
 * We defined a Lambda function which is bound to the `lambda/hitcounter.handler` code.
 * We __wired__ the Lambda's environment variables to the `FunctionName` and `TableName`
   of our resources.

## Late-bound values

The `FunctionName` and `TableName` properties are values that only resolve when
we deploy our stack (notice that we haven't configured these physical names when
we defined the table/function, only logical IDs). This means that if you print
their values during synthesis, you will get a "TOKEN", which is how the CDK
represents these late-bound values. You should treat tokens as _opaque strings_.
This means you can concatenate them together for example, but don't be tempted
to parse them in your code.
