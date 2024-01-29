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

Edit `hitcounter.ts` and add the `removalPolicy` prop to the table

{{<highlight ts "hl_lines=25">}}
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;
}

export class HitCounter extends Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  /** the hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, "Hits", {
      partitionKey: { name: "path", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    this.table = table;

    this.handler = new NodejsFunction(this, "HitCounterHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../lambda/hitcounter.ts"),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName,
      },
    });

    // grant the lambda role read/write permissions to our table
    table.grantReadWriteData(this.handler);

    // grant the lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler);
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
