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
npm install @aws-cdk/aws-dynamodb
```

{{% notice info %}}

**Windows users**: on Windows, you will have to stop the `npm run watch` command
that is running in the background, then run `npm install`, then start
`npm run watch` again. Otherwise you will get an error about files being
in use.

{{% /notice %}}

Now, go back to `lib/hitcounter.ts` and add the following highlighted code:

{{<highlight ts "hl_lines=3 12-13 18-29">}}
import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.Function;
}

export class HitCounter extends cdk.Construct {

  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
      super(scope, id);

    const table = new dynamodb.Table(this, 'Hits', {
        partitionKey: {
            name: 'path',
            type: dynamodb.AttributeType.STRING
        }
    });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
        runtime: lambda.Runtime.NODEJS_8_10,
        handler: 'hitcounter.handler',
        code: lambda.Code.asset('lambda'),
        environment: {
            DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
            HITS_TABLE_NAME: table.tableName
        }
    });
  }
}
{{</highlight>}}

## What did we do here?

This code is hopefully quite easy to understand:

 * We defined a DynamoDB table with `path` as the partition key (every DynamoDB
   table must have a single partition key).
 * We defined a Lambda function which is bound to the `lambda/hitcounter.handler` code.
 * We __wired__ the Lambda's environment variables to the `functionName` and `tableName`
   of our resources.

## Late-bound values

The `functionName` and `tableName` properties are values that only resolve when
we deploy our stack (notice that we haven't configured these physical names when
we defined the table/function, only logical IDs). This means that if you print
their values during synthesis, you will get a "TOKEN", which is how the CDK
represents these late-bound values. You should treat tokens as _opaque strings_.
This means you can concatenate them together for example, but don't be tempted
to parse them in your code.
