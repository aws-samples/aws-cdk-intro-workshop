+++
title = "Validation Tests"
weight = 300
+++

### Validation Tests

Sometimes we want the inputs to be configurable, but we also want to put constraints on those inputs or validate
that the input is valid.

Suppose for the `HitCounter` construct we want to allow the user to specify the `ReadCapacity` on the DynamoDB
table, but we also want to ensure the value is within a reasonable range. We can write a test to make sure
that the validation logic works: pass in invalid values and see what happens.

First, add a `ReadCapacity` property to the `HitCounterProps` struct:

{{<highlight go "hl_lines=3">}}
type HitCounterProps struct {
	Downstream awslambda.IFunction
	ReadCapacity float64
}
{{</highlight>}}

Then update the DynamoDB table resource to add the `ReadCapacity` property.

{{<highlight go "hl_lines=5">}}
	table := awsdynamodb.NewTable(this, jsii.String("Hits"), &awsdynamodb.TableProps{
		PartitionKey: &awsdynamodb.Attribute{Name: jsii.String("path"), Type: awsdynamodb.AttributeType_STRING},
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
		Encryption: awsdynamodb.TableEncryption_AWS_MANAGED,
		ReadCapacity: jsii.Number(props.ReadCapacity)
	})
{{</highlight>}}

Now add a validation which will throw an error if the `ReadCapacity` is not in the allowed range.

{{<highlight go "hl_lines=9-11">}}
func NewHitCounter(scope constructs.Construct, id string, props *HitCounterProps) HitCounter {
	if props.ReadCapacity < 5 || props.ReadCapacity > 20 {
		panic("ReadCapacity must be between 5 and 20")
	}
{{</highlight>}}

Don't forget to pass in the ReadCapacity both in our app where we create a HitCounter, and in our existing tests as well

{{<highlight go "hl_lines=3">}}
hitcounter := hitcounter.NewHitCounter(stack, "HelloHitCounter", &hitcounter.HitCounterProps{
	Downstream: helloHandler,
	ReadCapacity: 10,
})
{{</highlight>}}

Now lets add a test that validates the error is thrown.

```go
func TestCanPassReadCapacity(t *testing.T) {
  defer func() {
    if r := recover(); r == nil {
      t.Error("Did not throw ReadCapacity error")
    }
  }()
  
  // GIVEN
  stack := awscdk.NewStack(nil, nil, nil)

  // WHEN
  testFn := awslambda.NewFunction(stack, jsii.String("TestFunction"), &awslambda.FunctionProps{
    Code: awslambda.Code_FromAsset(jsii.String("lambda"), nil),
    Runtime: awslambda.Runtime_NODEJS_16_X(),
    Handler: jsii.String("hello.handler"),
  })
  hitcounter.NewHitCounter(stack, "MyTestConstruct", &hitcounter.HitCounterProps{
    Downstream: testFn,
    ReadCapacity: 10,
  })
}
```

Run the test.

```bash
$ go test
```

You should see an output like this:

```bash
╰─ go test
--- FAIL: TestCanPassReadCapacity (0.01s)
    cdk-workshop_test.go:78: Did not throw ReadCapacity error
FAIL
exit status 1
FAIL    cdk-workshop    5.442s
```

Now let's change the value of ReadCapacity to be outside the valid range so that this test can succeed

{{<highlight go "hl_lines=19">}}
func TestCanPassReadCapacity(t *testing.T) {
  defer func() {
    if r := recover(); r == nil {
      t.Error("Did not throw ReadCapacity error")
    }
  }()
  
  // GIVEN
  stack := awscdk.NewStack(nil, nil, nil)

  // WHEN
  testFn := awslambda.NewFunction(stack, jsii.String("TestFunction"), &awslambda.FunctionProps{
    Code: awslambda.Code_FromAsset(jsii.String("lambda"), nil),
    Runtime: awslambda.Runtime_NODEJS_16_X(),
    Handler: jsii.String("hello.handler"),
  })
  hitcounter.NewHitCounter(stack, "MyTestConstruct", &hitcounter.HitCounterProps{
    Downstream: testFn,
    ReadCapacity: 21,
  })
}
{{</highlight>}}

Now when we run the test it should succeed

```bash
╰─ go test
PASS
ok      cdk-workshop    5.384s
```