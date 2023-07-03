+++
title = "Clean up"
weight = 60
bookFlatSection = true
+++

# Clean up your stack

When destroying a stack, resources may be deleted, retained, or snapshotted according to their deletion policy.
By default, most resources will get deleted upon stack deletion, however that's not the case for all resources.
The DynamoDB table will be retained by default. If you don't want to retain this table, we can set this in CDK
code by using `RemovalPolicy`:

## Set the DynamoDB table to be deleted upon stack deletion

Edit `src/CdkWorkshop/HitCounter.cs` and add the `RemovalPolicy` prop to the table

{{<highlight csharp "hl_lines=29">}}
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
                },
                RemovalPolicy = RemovalPolicy.DESTROY
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

Additionally, the Lambda function created will generate CloudWatch logs that are
permanently retained. These will not be tracked by CloudFormation since they are
not part of the stack, so the logs will still persist. You will have to manually
delete these in the console if desired.

Now that we know which resources will be deleted, we can proceed with deleting the
stack. You can either delete the stack through the AWS CloudFormation console or use
`cdk destroy`:

```
cdk destroy
```

You'll be asked:

```
Are you sure you want to delete: CdkWorkshopStack (y/n)?
```

Hit "y" and you'll see your stack being destroyed.

The bootstrapping stack created through `cdk bootstrap` still exists. If you plan
on using the CDK in the future (we hope you do!) do not delete this stack.

If you would like to delete this stack, it will have to be done through the CloudFormation
console. Head over to the CloudFormation console and delete the `CDKToolkit` stack. The S3
bucket created will be retained by default, so if you want to avoid any unexpected charges,
be sure to head to the S3 console and empty + delete the bucket generated from bootstrapping.
