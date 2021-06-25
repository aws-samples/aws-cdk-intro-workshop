+++
title = "Assertion Tests"
weight = 200
+++

### Fine-Grained Assertion Tests

#### Create a test for the DynamoDB table

{{% notice info %}} This section assumes that you have [created the hit counter construct](/20-typescript/40-hit-counter.html) {{% /notice %}}

Our `HitCounter` construct creates a simple DynamoDB table. Lets create a test that
validates that the table is getting created.

If you do not already have a `test` directory (usually created automatically when you run `cdk init`), then create a `test` directory at the 
same level as `bin` and `lib` and then create a file called `hitcounter.test.ts` with the following code.

```typescript
import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import * as lambda from '@aws-cdk/aws-lambda';

import { HitCounter }  from '../lib/hitcounter';

test('DynamoDB Table Created', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromInline('test')
    })
  });
  // THEN
  expectCDK(stack).to(haveResource("AWS::DynamoDB::Table"));
});
```
This test is simply testing to ensure that the synthesized stack includes a DynamoDB table.

Run the test.

```bash
$ npm run build && npx jest
```

You should see output like this:

```bash
$ npx jest

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (182ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        3.273s
Ran all test suites.
```

#### Create a test for the Lambda function

Now lets add another test, this time for the Lambda function that the `HitCounter` construct creates.
This time in addition to testing that the Lambda function is created, we also want to test that
it is created with the two environment variables `DOWNSTREAM_FUNCTION_NAME` & `HITS_TABLE_NAME`.

Add another test below the DynamoDB test. If you remember, when we created the lambda function the
environment variable values were references to other constructs. 

{{<highlight ts "hl_lines=6-7">}}
this.handler = new lambda.Function(this, 'HitCounterHandler', {
  runtime: lambda.Runtime.NODEJS_10_X,
  handler: 'hitcounter.handler',
  code: lambda.Code.from_asset('lambda'),
  environment: {
    DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
    HITS_TABLE_NAME: table.tableName
  }
});
{{</highlight>}}

At this point we don't really know what the value of the `functionName` or `tableName` will be since the 
CDK will calculate a hash to append to the end of the name of the constructs, so we will just use a 
dummy value for now. Once we run the test it will fail and show us the expected value.

Create a new test in `hitcounter.test.ts` with the below code:

```typescript
test('Lambda Has Environment Variables', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromInline('test')
    })
  });
  // THEN
  expectCDK(stack).to(haveResource("AWS::Lambda::Function", {
    Environment: {
      Variables: {
        DOWNSTREAM_FUNCTION_NAME: {
          Ref: "TestFunctionXXXXX",
        },
        HITS_TABLE_NAME: {
          Ref: "MyTestConstructHitsXXXXX",
        }
      }
    }
  }));
})
```

Save the file and run the test again.

```bash
$ npm run build && npx jest
```

This time the test should fail and you should be able to grab the correct value for the
variables from the expected output.

{{<highlight bash "hl_lines=16-21">}}
$ npx jest

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 FAIL  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (184ms)
  ✕ Lambda Has Environment Variables (53ms)
  ✓ read capacity can be configured (9ms)

  ● Lambda Has Environment Variables
  ...
  ...
  "Environment": {
              "Variables": {
                "DOWNSTREAM_FUNCTION_NAME": {
                  "Ref": "TestFunctionXXXXX"
                },
                "HITS_TABLE_NAME": {
                  "Ref": "MyTestConstructHitsXXXXX"
                }
              }
            }
          },
          "DependsOn": [
            "MyTestConstructHitCounterHandlerServiceRoleDefaultPolicyXXXXX",
            "MyTestConstructHitCounterHandlerServiceRoleXXXXX"
          ]
        }

      37 |   });
      38 |   // THEN
    > 39 |   expectCDK(stack).to(haveResource("AWS::Lambda::Function", {
         |                    ^
      40 |     Environment: {
      41 |       Variables: {
      42 |         DOWNSTREAM_FUNCTION_NAME: {"Ref": "TestFunction"},

      ...
      ...

Test Suites: 1 failed, 1 total
Tests:       1 failed, 2 passed, 3 total
Snapshots:   0 total
Time:        3.686s
{{</highlight>}}

Grab the real values for the environment variables and update your test

{{<highlight ts "hl_lines=15-16">}}
test('Lambda Has Environment Variables', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromInline('test')
    })
  });
  // THEN
  expectCDK(stack).to(haveResource("AWS::Lambda::Function", {
    Environment: {
      Variables: {
        DOWNSTREAM_FUNCTION_NAME: {"Ref": [VALUE_GOES_HERE]},
        HITS_TABLE_NAME: {"Ref": [VALUE_GOES_HERE]}
      }
    }
  }));
});
{{</highlight>}}

Now run the test again. This time is should pass.

```bash
$ npx jest
```

You should see output like this:

```bash
$ npm run build && npx jest

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (182ms)
  ✓ Lambda Has Environment Variables (50ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        3.294s
Ran all test suites.
```

You can also apply TDD (Test Driven Development) to developing CDK Constructs. For a very simple example, lets add a new
requirement that our DynamoDB table be encrypted.

First we'll update the test to reflect this new requirement.

{{<highlight ts "hl_lines=18-20">}}
import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import * as lambda from '@aws-cdk/aws-lambda';
import { HitCounter }  from '../lib/hitcounter';

test('DynamoDB Table Created With Encryption', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromInline('test')
    })
  });
  // THEN
  expectCDK(stack).to(haveResource('AWS::DynamoDB::Table', {
    SSESpecification: {
      SSEEnabled: true
    }
  }));
});
{{</highlight>}}

Now run the test, which should fail.

```bash
$ npx jest

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 FAIL  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (170ms)
  ✓ Lambda Has Environment Variables (50ms)
  ✕ DynamoDB Table Created With Encryption (49ms)

  ● DynamoDB Table Created With Encryption

    None of 1 resources matches resource 'AWS::DynamoDB::Table' with properties {
      "SSESpecification": {
        "SSEEnabled": true
      }
    }.
    ...

      60 |   });
      61 |   // THEN
    > 62 |   expectCDK(stack).to(haveResource("AWS::DynamoDB::Table", {
         |                    ^
      63 |     SSESpecification: {
      64 |       SSEEnabled: true
      ...


Test Suites: 1 failed, 1 total
Tests:       1 failed, 2 passed, 3 total
Snapshots:   0 total
Time:        3.932s, estimated 4s
```

Now lets fix the broken test. Update the hitcounter code to enable encryption by default.

{{<highlight ts "hl_lines=13">}}
export class HitCounter extends cdk.Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  /** the hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
      serverSideEncryption: true
    });
    ...
  }
}
{{</highlight>}}

Now run the test again, which should now pass.

```bash
npx jest

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (171ms)
  ✓ Lambda Has Environment Variables (52ms)
  ✓ DynamoDB Table Created With Encryption (47ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        3.913s
Ran all test suites.
```
