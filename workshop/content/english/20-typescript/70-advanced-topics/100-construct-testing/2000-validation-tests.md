+++
title = "Validation Tests"
weight = 300
+++

### Validation Tests

Sometimes we want the inputs to be configurable, but we also want to put constraints on those inputs or validate
that the input is valid.

Suppose for the `HitCounter` construct we want to allow the user to specify the `readCapacity` on the DynamoDB
table, but we also want to ensure the value is within a reasonable range. We can write a test to make sure
that the validation logic works: pass in invalid values and see what happens.

First, add a `readCapacity` property to the `HitCounterProps` interface:

{{<highlight ts "hl_lines=12">}}
export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;

  /**
   * The read capacity units for the table
   *
   * Must be greater than 5 and lower than 20
   *
   * @default 5
   */
  readCapacity?: number;
}
{{</highlight>}}

Then update the DynamoDB table resource to add the `readCapacity` property and remove the `billingMode: dynamodb.BillingMode.PAY_PER_REQUEST` property.

{{<highlight ts "hl_lines=4">}}
const table = new dynamodb.Table(this, 'Hits', {
  partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
  encryption: dynamodb.TableEncryption.AWS_MANAGED,
  readCapacity: props.readCapacity ?? 5
});
{{</highlight>}}

Now add a validation which will throw an error if the readCapacity is not in the allowed range.

{{<highlight ts "hl_lines=9-11">}}
export class HitCounter extends Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  /** the hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
      throw new Error('readCapacity must be greater than 5 and less than 20');
    }

    super(scope, id);
    // ...
  }
}
{{</highlight>}}

Now lets add a test that validates the error is thrown.

```typescript
test('read capacity can be configured', () => {
  const stack = new cdk.Stack();

  expect(() => {
    new HitCounter(stack, 'MyTestConstruct', {
      downstream:  new NodejsFunction(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, '../lambda/hello.ts'),
        handler: 'handler'
      }),
      readCapacity: 3
    });
  }).toThrowError('readCapacity must be greater than 5 and less than 20');
});
```

Run the test.

```bash
$ npm run test
```

You should see an output like this:

```bash
$ npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (206 ms)
  ✓ Lambda Has Environment Variables (61 ms)
  ✓ DynamoDB Table Created With Encryption (55 ms)
  ✓ Read Capacity can be configured (14 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        4.755 s, estimated 5 s
Ran all test suites.
```

Now we also need to confirm that we'll get the same error if we have over 20 read capacity. We could create a new test, or add another expect criteria to the same test.

{{<highlight ts "hl_lines=15-24">}}
test('read capacity can be configured', () => {
  const stack = new cdk.Stack();

  expect(() => {
    new HitCounter(stack, 'MyTestConstruct', {
      downstream:  new NodejsFunction(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, '../lambda/hello.ts'),
        handler: 'handler'
      }),
      readCapacity: 3
    });
  }).toThrowError('readCapacity must be greater than 5 and less than 20');

  expect(() => {
    new HitCounter(stack, 'MyTestConstruct', {
      downstream:  new NodejsFunction(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, '../lambda/hello.ts'),
        handler: 'handler'
      }),
      readCapacity: 25
    });
  }).toThrowError('readCapacity must be greater than 5 and less than 20');
});
{{</highlight >}}

Run the tests again.

```bash
$ npm run test
```

{{<highlight bash "hl_lines=11-12">}}
 FAIL  test/hitcounter.test.ts (9.888 s)cker login
  ✓ DynamoDB Table Created (2255 ms)
  ✓ Lambda Has Environment Variables (1947 ms)
  ✓ DynamoDB Table Created With Encryption (1833 ms)
  ✕ Read Capacity can be configured (1329 ms)

  ● Read Capacity can be configured

    expect(received).toThrowError(expected)

    Expected substring: "readCapacity must be greater than 5 and less than 20"
    Received message:   "There is already a Construct with name 'TestFunction' in Stack [Default]"

....

Test Suites: 1 failed, 1 total
Tests:       1 failed, 3 passed, 4 total
Snapshots:   0 total
Time:        9.93 s, estimated 11 s
Ran all test suites.
{{</highlight>}}

This has happened as we are trying to add a new hits counter and new test function to the same stack. This can be solved by adding a second stack and passing that into the `HitCounter` and `NodejsFunction`.

{{<highlight ts "hl_lines=15 17 18">}}
test('Read Capacity can be configured', () => {
  const stack = new cdk.Stack();

  expect(() => {
    new HitCounter(stack, 'MyTestConstruct', {
      downstream: new NodejsFunction(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, '../lambda/hello.ts'),
        handler: 'handler'
      }),
      readCapacity: 3
    });
  }).toThrowError('readCapacity must be greater than 5 and less than 20');

  const stack2 = new cdk.Stack();
  expect(() => {
    new HitCounter(stack2, 'MyTestConstruct', {
      downstream: new NodejsFunction(stack2, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, '../lambda/hello.ts'),
        handler: 'handler'
      }),
      readCapacity: 25
    });
  }).toThrowError('readCapacity must be greater than 5 and less than 20');
})
{{</highlight>}}

Now our test pass again!

```bash

 PASS  test/hitcounter.test.ts (10.985 s)
  ✓ DynamoDB Table Created (3182 ms)
  ✓ Lambda Has Environment Variables (1908 ms)
  ✓ DynamoDB Table Created With Encryption (1801 ms)
  ✓ Read Capacity can be configured (1755 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        11.027 s, estimated 13 s
Ran all test suites.
```

The last thing to validate is that if we pass a valid value then we don't get any error. We can use what we just learnt and create a third stack in this test.

{{<highlight ts "hl_lines=9 11">}}
const stack3 = new cdk.Stack();
expect(() => {
  new HitCounter(stack3, 'MyTestConstruct', {
    downstream: new NodejsFunction(stack3, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambda/hello.ts'),
      handler: 'handler'
    }),
    readCapacity: 12
  });
}).not.toThrowError('readCapacity must be greater than 5 and less than 20');
{{</highlight>}}

The important change here is that we changed our expectation. We are now expecting this `NOT` to throw an error. The `.not` method is really nice for keeping a test consistent whilst testing the positive and negative cases.

Rerunning the tests doesn't change the output much, only increasing the time it takes to run the final test. This isn't great as if one of the expections fail, you don't know which one. What we can do is change this test into a `description` that contains multiple tests.




{{<highlight ts "hl_lines=1 2 15 28">}}
describe('Read Capacity can be configured', () => {
  test('can't set read capacity to 3', () => {
    const stack = new cdk.Stack();
    expect(() => {
      new HitCounter(stack, 'MyTestConstruct', {
        downstream: new NodejsFunction(stack, 'TestFunction', {
          runtime: lambda.Runtime.NODEJS_20_X,
          entry: path.join(__dirname, '../lambda/hello.ts'),
          handler: 'handler'
        }),
        readCapacity: 3
      });
    }).toThrowError('readCapacity must be greater than 5 and less than 20');
  });
  test('can't set read capacity to 25', () => {
    const stack2 = new cdk.Stack();
    expect(() => {
      new HitCounter(stack2, 'MyTestConstruct', {
        downstream: new NodejsFunction(stack2, 'TestFunction', {
          runtime: lambda.Runtime.NODEJS_20_X,
          entry: path.join(__dirname, '../lambda/hello.ts'),
          handler: 'handler'
        }),
        readCapacity: 25
      });
    }).toThrowError('readCapacity must be greater than 5 and less than 20');
  });
  test('can set read capacity to 12', () => {
    const stack3 = new cdk.Stack();
    expect(() => {
      new HitCounter(stack3, 'MyTestConstruct', {
        downstream: new NodejsFunction(stack3, 'TestFunction', {
          runtime: lambda.Runtime.NODEJS_20_X,
          entry: path.join(__dirname, '../lambda/hello.ts'),
          handler: 'handler'
        }),
        readCapacity: 12
      });
    }).not.toThrowError('readCapacity must be greater than 5 and less than 20');
  });
});
{{</highlight>}}

Save the test file and re-run the tests

```bash
npm run test
```

And you get a different output.

```bash
PASS  test/hitcounter.test.ts (13.018 s)
  ✓ DynamoDB Table Created (2895 ms)
  ✓ Lambda Has Environment Variables (1869 ms)
  ✓ DynamoDB Table Created With Encryption (1852 ms)
  Read Capacity can be configured
    ✓ cant set read capacity to 3 (918 ms)
    ✓ cant set read capacity to 25 (926 ms)
    ✓ can set read capacity to 12 (1856 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        13.065 s
Ran all test suites.
```

As you can see, you get a lot better information on exactly what is working and what isn't, but have the capacity tests all grouped together.