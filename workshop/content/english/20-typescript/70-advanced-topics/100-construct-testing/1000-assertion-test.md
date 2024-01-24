+++
title = "Assertion Tests"
weight = 200
+++

### Fine-Grained Assertion Tests

#### Create a test for the DynamoDB table

{{% notice info %}} This section assumes that you have [created the hit counter construct](/20-typescript/40-hit-counter.html) {{% /notice %}}

Our `HitCounter` construct creates a simple DynamoDB table. Lets create a test that
validates that the table is getting created.

If `cdk init` created a test directory for you, then you should have a `cdk-workshop.test.ts` file. Delete this file.

If you do not already have a `test` directory (usually created automatically when you run `cdk init`), then create a `test` directory at the
same level as `bin` and `lib` and then create a file called `hitcounter.test.ts` with the following code.

```typescript
import { Template, Capture } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import { HitCounter }  from '../lib/hitcounter';

test('DynamoDB Table Created', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new NodejsFunction(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, "../lambda/hello.ts"),
      handler: "handler",
   });
  });

  // THEN
  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});
```

This test is simply testing to ensure that the synthesized stack includes a DynamoDB table.

Run the test.

```bash
$ npm run test
```

You should see output like this:

```bash
$ npm run test

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
this.handler = new NodejsFunction(this, "HitCounterHandler", {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: "handler",
  entry: path.join(__dirname, "../lambda/hitcounter.ts"),
  environment: {
    DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
    HITS_TABLE_NAME: table.tableName,
  },
});
{{</highlight>}}

At this point we don't really know what the value of the `functionName` or `tableName` will be since the
CDK will calculate a hash to append to the end of the name of the constructs, so we will just use a
dummy value for now. Once we run the test it will fail and show us the expected value.

Create a new test in `hitcounter.test.ts` with the below code:

```typescript
test("Lambda Has Environment Variables", () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new NodejsFunction(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, "../lambda/hello.ts"),
      handler: "handler",
    }),
  });
  // THEN
  const template = Template.fromStack(stack);
  const envCapture = new Capture();
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual({
    Variables: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      DOWNSTREAM_FUNCTION_NAME: {
        Ref: "TestFunctionXXXXX",
      },
      HITS_TABLE_NAME: {
        Ref: "MyTestConstructHitsXXXXX",
      },
    },
  });
});
```
Here we are doing a few things:
- Using `Capture` to capture the environment variables for the resource `AWS::Lambda::Function`.
- Expecting that the captured environment varibles have three values:
  - `AWS_NODEJS_CONNECTION_REUSE_ENABLED` - This is added by default to all Lambdas created with the `NodejsFunction` construct.
  - `DOWNSTREAM_FUNCTION_NAME` - This references the function we passed into the hit counter.
  - `HITS_TABLE_NAME` - This is the hits counter table name.


Save the file and run the test again.

```bash
$ npm run test
```

This will fail with an error saying that the object received was missing the `DOWNSTREAM_FUNCTION_NAME` and `HITS_TABLE_NAME` variables.

{{<highlight bash "hl_lines=19-24">}}
$ npm run test

......

FAIL test/hitcounter.test.ts
✓ DynamoDB Table Created (184ms)
✕ Lambda Has Environment Variables (53ms)

● Lambda Has Environment Variables

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 0

      Object {
        "Variables": Object {
          "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1",
    -     "DOWNSTREAM_FUNCTION_NAME": Object {
    -       "Ref": "TestFunctionXXXXX",
    -     },
    -     "HITS_TABLE_NAME": Object {
    -       "Ref": "MyTestConstructHitsXXXXX",
    -     },
        },
      }

...

Test Suites: 1 failed, 1 total
Tests: 1 failed, 1 passed, 2 total
Snapshots: 0 total
Time: 9.378 s
Ran all test suites.

{{</highlight>}}

If we think about what our test is doing we are getting the environment variables for a Lambda function:

```ts
template.hasResourceProperties("AWS::Lambda::Function", {
```

The issue we have is that we have more than one function in our stack. We have the hits counter function, but also the hello function. Our tests are failing because we aren't controlling which Lambda's environment we should be looking at.

To fix this we can modify our test to be more detailed about the environment we want to capture.

{{<highlight bash "hl_lines=14-23">}}
test("Lambda Has Environment Variables", () => {
  const stack = new cdk.Stack();

  new HitCounter(stack, "MyTestConstruct", {
    downstream: new NodejsFunction(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(\_\_dirname, "../lambda/hello.ts"),
      handler: "handler",
    }),
  });

  const template = Template.fromStack(stack);
  console.log(template.findResources("AWS::Lambda::Function"));
  const envCapture = new Capture({
    Variables: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      DOWNSTREAM_FUNCTION_NAME: {
        Ref: Match.stringLikeRegexp("TestFunction*"),
      },
      HITS_TABLE_NAME: {
        Ref: Match.stringLikeRegexp("MyTestConstructHits*"),
      },
    },
  });

  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual({
    Variables: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      DOWNSTREAM_FUNCTION_NAME: {
        Ref: "TestFunctionXXXXX",
      },
      HITS_TABLE_NAME: {
        Ref: "MyTestConstructHitsXXXXX",
      },
    },
  });
});
{{</highlight>}}

What we've done here is specify a pattern for the environment capture to try and match.

```ts
const envCapture = new Capture({
  Variables: {
    AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    DOWNSTREAM_FUNCTION_NAME: {
      Ref: Match.stringLikeRegexp("TestFunction*"),
    },
    HITS_TABLE_NAME: {
      Ref: Match.stringLikeRegexp("MyTestConstructHits*"),
    },
  },
});
```

One thing you might have noticed is that we're using `Match.stringLikeRegexp`. This is because we still don't know the name of the test function or the hits DynamoDB table. What we do know is the structure they'll get.

When we pass in our downstream function, we gave it an ID of `TestFunction`, therefore the name will be `TestFunction{someRandomValue}`. We can use `Match.stringLikeRegexp` to test for that, using `*` as a wildcard match.

We can do the same for the DynamoDB table resulting in a table name of `Match.stringLikeRegexp("MyTestConstructHits*")`.

If you are ever struggling to create the names you want to match, you can always console log out the template and find the values you need to use.

```ts
console.log(JSON.stringify(template));
```

Now that we have specified the pattern for the environment variables, it will only match one of the Lambda functions - the one we want.

If we re-run the test they will still fail. This is just because we are still expecting to match `TestFunctionXXXXX`. You should be able to grab the correct value for the
variables from the expected output.

{{<highlight bash "hl_lines=20-21 24-25">}}
$ npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

FAIL test/hitcounter.test.ts
✓ DynamoDB Table Created (184ms)
✕ Lambda Has Environment Variables (53ms)

● Lambda Has Environment Variables

    expect(received).toEqual(expected) // deep equality

    - Expected  - 2
    + Received  + 2

      Object {
        "Variables": Object {
          "DOWNSTREAM_FUNCTION_NAME": Object {
    -       "Ref": "TestFunctionXXXXX",
    +       "Ref": "TestFunction22AD90FC",
          },
          "HITS_TABLE_NAME": Object {
    -       "Ref": "MyTestConstructHitsXXXXX",
    +       "Ref": "MyTestConstructHits24A357F0",
          },
        },
      }

      37 |     Environment: envCapture,
      38 |   });
    > 39 |   expect(envCapture.asObject()).toEqual(
         |                                 ^
      40 |     {
      41 |       Variables: {
      42 |         DOWNSTREAM_FUNCTION_NAME: {

      at Object.<anonymous> (test/hitcounter.test.ts:39:33)

Test Suites: 1 failed, 1 total
Tests: 1 failed, 1 passed, 2 total
Snapshots: 0 total
Time: 3.971 s, estimated 4 s
Ran all test suites.
{{</highlight>}}

Grab the real values for the environment variables and update your test

{{<highlight ts "hl_lines=22 25">}}
test("Lambda Has Environment Variables", () => {
  const stack = new cdk.Stack();

  new HitCounter(stack, "MyTestConstruct", {
    downstream: new NodejsFunction(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, "../lambda/hello.ts"),
      handler: "handler",
    }),
  });

  const template = Template.fromStack(stack);
  console.log(template.findResources("AWS::Lambda::Function"));
  const envCapture = new Capture({
    Variables: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      DOWNSTREAM_FUNCTION_NAME: {
        Ref: Match.stringLikeRegexp("TestFunction*"),
      },
      HITS_TABLE_NAME: {
        Ref: Match.stringLikeRegexp("MyTestConstructHits*"),
      },
    },
  });

  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });
  console.log(envCapture.asObject());

  expect(envCapture.asObject()).toEqual({
    Variables: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      DOWNSTREAM_FUNCTION_NAME: {
        Ref: YOUR_VALUE_GOES_HERE,
      },
      HITS_TABLE_NAME: {
        Ref: YOUR_VALUE_GOES_HERE,
      },
    },
  });
});
{{</highlight>}}

Now run the test again. This time is should pass.

```bash
$ npm run test
```

You should see output like this:

```bash
$ npm run test

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

First we'll add a new test to reflect this new requirement.

```ts
test("DynamoDB Table Created With Encryption", () => {
  const stack = new cdk.Stack();

  new HitCounter(stack, "MyTestConstruct", {
    downstream: new NodejsFunction(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, "../lambda/hello.ts"),
      handler: "handler",
    }),
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::DynamoDB::Table", {
    SSESpecification: {
      SSEEnabled: true,
    },
  });
});
```

Now run the test, which should fail.

```bash
$ npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 FAIL  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (170ms)
  ✓ Lambda Has Environment Variables (50ms)
  ✕ DynamoDB Table Created With Encryption (49ms)

  ● DynamoDB Table Created With Encryption

    Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.
    The closest result is:
      {
        "Type": "AWS::DynamoDB::Table",
        "Properties": {
          "KeySchema": [
            {
              "AttributeName": "path",
              "KeyType": "HASH"
            }
          ],
          "AttributeDefinitions": [
            {
              "AttributeName": "path",
              "AttributeType": "S"
            }
          ],
          "ProvisionedThroughput": {
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
          }
        },
        "UpdateReplacePolicy": "Retain",
        "DeletionPolicy": "Retain"
      }
    with the following mismatches:
        Missing key at /Properties/SSESpecification (using objectLike matcher)

      63 |
      64 |   const template = Template.fromStack(stack);
    > 65 |   template.hasResourceProperties("AWS::DynamoDB::Table", {
         |            ^
      66 |     SSESpecification: {
      67 |       SSEEnabled: true
      68 |     }

      at Template.hasResourceProperties (node_modules/aws-cdk-lib/assertions/lib/template.ts:50:13)
      at Object.<anonymous> (test/hitcounter.test.ts:65:12)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 2 passed, 3 total
Snapshots:   0 total
Time:        9.02 s
Ran all test suites.
```

Now lets fix the broken test. Update the hitcounter code to enable encryption by default.

{{<highlight ts "hl_lines=13">}}
export class HitCounter extends Construct {
/\*_ allows accessing the counter function _/
public readonly handler: lambda.Function;

/\*_ the hit counter table _/
public readonly table: dynamodb.Table;

constructor(scope: Construct, id: string, props: HitCounterProps) {
super(scope, id);

    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED
    });
    ...

}
}
{{</highlight>}}

Now run the test again, which should now pass.

```bash
npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (2880 ms)
  ✓ Lambda Has Environment Variables (1908 ms)
  ✓ DynamoDB Table Created With Encryption (1852 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        9.273s
Ran all test suites.
```
