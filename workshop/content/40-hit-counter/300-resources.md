+++
title = "Define resources"
weight = 300
+++

Now, let's define the AWS Lambda function and the DynamoDB table in our
`HitCounter` construct.

Before we do that, we will need to install the DynamoDB construct library:

```s
$ npm i @aws-cdk/aws-dynamodb
```

Now, go back to `bin/hitcounter.ts` and add the following code:

{{<highlight ts "hl_lines=3 12-13 18-28">}}
import cdk = require('@aws-cdk/cdk');
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.FunctionRef;
}

export class HitCounter extends cdk.Construct {

  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  constructor(parent: cdk.Construct, id: string, props: HitCounterProps) {
    super(parent, id);

    const table = new dynamodb.Table(this, 'Hits');
    table.addPartitionKey({ name: 'path', type: dynamodb.AttributeType.String });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NodeJS810,
      handler: 'hitcounter.handler',
      code: lambda.Code.directory('lambda'),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName
      }
    });
  }
}
{{</highlight>}}

This code is hopefully quite easy to understand:

 * We define a DynamoDB table with a "path" partition key.
 * We define a Lambda function that is bound to the "hitcounter.handler" code.
 * We wire the Lambda's environment variables to the `functionName` and `tableName`
   of our resources.

{{% notice info %}} The `functionName` and `tableName` properties are values
that can only resolve when we deploy our stack. This means that if you print
their values during synthesis, you will get a "TOKEN", which is how the CDK
represents these late-bound values. Don't be tempted to parse this value. {{%
/notice %}}