+++
title = "Define resources"
weight = 300
+++

## Add resources to the hit counter construct

Now, let's define the AWS Lambda function and the DynamoDB table in our
`HitCounter` construct. Go back to `lib/hitcounter.ts` and add the following highlighted code:

{{<highlight ts "hl_lines=3 13-14 19-32">}}
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
        partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
        removalPolicy: cdk.RemovalPolicy.DESTROY
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

{{% notice info %}}
When destroying a stack, resources may be deleted, retained, or snapshotted according to their deletion policy.
By default, most resources will get deleted upon stack deletion, however that's not the case for all resources.
The DynamoDB table will be retained by default. Since this is a workshop we want to have a clean destroy so we have set the removal policy to delete. It is not advisable to do this in a production environment.
{{% /notice %}}

## What did we do here?

This code is hopefully quite easy to understand:

 * We defined a DynamoDB table with `path` as the partition key.
 * We defined a Lambda function which is bound to the `lambda/hitcounter.handler` code.
 * We __wired__ the Lambda's environment variables to the `functionName` and `tableName`
   of our resources.

## Late-bound values

The `functionName` and `tableName` properties are values that only resolve when
we deploy our stack (notice that we haven't configured these physical names when
we defined the table/function, only logical IDs). This means that if you print
their values during synthesis, you will get a "TOKEN", which is how the CDK
represents these late-bound values. You should treat tokens as *opaque strings*.
This means you can concatenate them together for example, but don't be tempted
to parse them in your code.
