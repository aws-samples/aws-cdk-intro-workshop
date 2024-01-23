+++
title = "Define resources"
weight = 300
+++

## Add resources to the hit counter construct

Now, let's define the AWS Lambda function and the DynamoDB table in our
`HitCounter` construct. Go back to `lib/hitcounter.ts` and add the following highlighted code:

{{<highlight ts "hl_lines=2 16-17 22-36">}}
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

    const table = new dynamodb.Table(this, "Hits2", {
      partitionKey: { name: "path", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
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
  }
}

{{</highlight>}}

## What did we do here?

This code is hopefully quite easy to understand:

- We defined a DynamoDB table with `path` as the partition key and `PAY_PER_REQUEST` billing.
- We defined a Lambda function which is bound to the `lambda/hitcounter.handler` code.
- We **wired** the Lambda's environment variables to the `functionName` and `tableName`
  of our resources.

## Late-bound values

The `functionName` and `tableName` properties are values that only resolve when
we deploy our stack (notice that we haven't configured these physical names when
we defined the table/function, only logical IDs). This means that if you print
their values during synthesis, you will get a "TOKEN", which is how the CDK
represents these late-bound values. You should treat tokens as _opaque strings_.
This means you can concatenate them together for example, but don't be tempted
to parse them in your code.
