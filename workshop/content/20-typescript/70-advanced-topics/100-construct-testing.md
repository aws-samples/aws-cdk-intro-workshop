+++
title = "Testing Constructs"
weight = 100
+++

## Testing Constructs (Optional)

The [CDK Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/testing.html) has a good guide on
testing constructs. For this section of the workshop we are going to use the [Fine-Grained Assertions](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_fine_grained) and [Validation](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_validation) type tests.

### Prerequisites

1. Install the required testing packages.

```bash
$ npm install --save-dev jest @types/jest @aws-cdk/assert
```

#### CDK assert Library

We will be using the CDK `assert` (`@aws-cdk/assert`) library throughout this guide.
The library contains several helper functions for writing unit and integration tests.


For this workshop we will mostly be using the `haveResource` function. This helper is used when you
only care that a resource of a particular type exists (regardless of its logical identfier), and that _some_
properties are set to specific values.

```typescript
haveResource(type, subsetOfProperties)
```

Example:

```ts
expect(stack).to(haveResource('AWS::CertificateManager::Certificate', {
    DomainName: 'test.example.com',
    // Note: some properties omitted here

    ShouldNotExist: ABSENT
}));
```

`ABSENT` is a magic value to assert that a particular key in an object is *not* set (or set to `undefined`).

To see the rest of the documentation, please read the docs [here](https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/assert/README.md).

### Fine-Grained Assertion Tests

#### Create a test for the DynamoDB table

{{% notice info %}} This section assumes that you have [created the hit counter construct](/20-typescript/40-hit-counter.html) {{% /notice %}}

Our `HitCounter` construct creates a simple DynamoDB table. Lets create a test that
validates that the table is getting created.

Create a `test` directory at the same level as `bin` and `lib` and then create a file called
`hitcounter.test.ts` with the following code.

```typescript
import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import { HitCounter }  from '../lib/hitcounter';

test('DynamoDB Table Created', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'lambda.handler',
      code: lambda.Code.inline('test')
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

```typescript {hl_lines=["6-7"]}
this.handler = new lambda.Function(this, 'HitCounterHandler', {
  runtime: lambda.Runtime.NODEJS_10_X,
  handler: 'hitcounter.handler',
  code: lambda.Code.asset('lambda'),
  environment: {
    DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
    HITS_TABLE_NAME: table.tableName
  }
});
```

At this point we don't really know what the value of the `functionName` or `tableName` will be since the 
CDK will calculate a hash to append to the end of the name of the constructs, so we will just use a 
dummy value for now. Once we run the test it will fail and show us the expected value.
Create a new test below the DynamoDB test like this:

```typescript
test('Lambda Has Environment Variables', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'lambda.handler',
      code: lambda.Code.inline('test')
    })
  });
  // THEN
  expectCDK(stack).to(haveResource("AWS::Lambda::Function", {
    Environment: {
      Variables: {
        DOWNSTREAM_FUNCTION_NAME: "TestFunction",
        HITS_TABLE_NAME: "MyTestConstructHits"
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

```bash {hl_lines=["16-21"]}
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
                  "Ref": "TestFunction22AD90FC"
                },
                "HITS_TABLE_NAME": {
                  "Ref": "MyTestConstructHits24A357F0"
                }
              }
            }
          },
          "DependsOn": [
            "MyTestConstructHitCounterHandlerServiceRoleDefaultPolicy8F2C3785",
            "MyTestConstructHitCounterHandlerServiceRoleD0F1215D"
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
```

Grab the real values for the environment variables and update your test

```typescript {hl_lines=["16-17"]}
test('Lambda Has Environment Variables', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'lambda.handler',
      code: lambda.Code.inline('test')
    })
  });
  // THEN
  expectCDK(stack).to(haveResource("AWS::Lambda::Function", {
    Environment: {
      Variables: {
        DOWNSTREAM_FUNCTION_NAME: {"Ref": "TestFunction22AD90FC"},
        HITS_TABLE_NAME: {"Ref": "MyTestConstructHits24A357F0"}
      }
    }
  }));
});
```

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

You can also apply TDD to developing CDK Constructs. For a very simple example, lets add a new
requirement that our DynamoDB table be encrypted.

First we'll update the test to reflect this new requirement.

```typescript {hl_lines=["18-20"]}
import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import { HitCounter }  from '../lib/hitcounter';

test('DynamoDB Table Created With Encryption', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'lambda.handler',
      code: lambda.Code.inline('test')
    })
  });
  // THEN
  expectCDK(stack).to(haveResource("AWS::DynamoDB::Table", {
    SSESpecification: {
      SSEEnabled: true
    }
  }));
});
```

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

```typescript {hl_lines=[13]}
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
```

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

### Validation Tests

Sometimes we want the inputs to be configurable, but we also want to put constraints on those inputs or validate
that the input is valid.

Suppose for the `HitCounter` construct we want to allow the user to specify the `readCapacity` on the DynamoDB
table, but we also want to ensure the value is within a reasonable range. We can write a test to make sure
that the validation logic works: pass in invalid values and see what happens.

First, add a `readCapacity` property to the `HitCounterProps` interface:

```typescript {hl_lines=[12]}
export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;

  /**
   * The read capacity units for the table
   *
   * Must be greater than 5 and less than 20
   *
   * @default 5
   */
  readCapacity?: number;
}
```

Then update the DynamoDB table resource to add the `readCapacity` property.

```typescript {hl_lines=[3]}
const table = new dynamodb.Table(this, 'Hits', {
  partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
  readCapacity: props.readCapacity || 5
});
```

Now add a validation which will throw an error if the readCapacity is not in the allowed range.

```typescript {hl_lines=["9-11"]}
export class HitCounter extends cdk.Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  /** the hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
    if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
      throw new Error('readCapacity must be greater than 5 and less than 20');
    }

    super(scope, id);
    // ...
  }
}
```

Now lets add a test that validates the error is thrown.

```typescript
test('read capacity can be configured', () => {
  const stack = new cdk.Stack();

  expect(() => {
    new HitCounter(stack, 'MyTestConstruct', {
      downstream:  new lambda.Function(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_10_X,
        handler: 'lambda.handler',
        code: lambda.Code.inline('test')
      }),
      readCapacity: 3
    });
  }).toThrowError(/readCapacity must be greater than 5 and less than 20/);
});
```

Run the test.

```bash
$ npm run build && npx jest
```

You should see an output like this:

```bash
$ npm run build && npx jest

> cdk-workshop@0.1.0 build /home/aws-cdk-intro-workshop
> tsc


> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (175ms)
  ✓ Lambda Has Environment Variables (54ms)
  ✓ read capacity can be configured (7ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        1.801s, estimated 3s
Ran all test suites.
```
