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
   * Must be greater than 5 and less than 20
   *
   * @default 5
   */
  readCapacity?: number;
}
{{</highlight>}}

Then update the DynamoDB table resource to add the `readCapacity` property.

{{<highlight ts "hl_lines=3">}}
const table = new dynamodb.Table(this, 'Hits', {
  partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
  readCapacity: props.readCapacity || 5
});
{{</highlight>}}

Now add a validation which will throw an error if the readCapacity is not in the allowed range.

{{<highlight ts "hl_lines=9-11">}}
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
{{</highlight>}}

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
