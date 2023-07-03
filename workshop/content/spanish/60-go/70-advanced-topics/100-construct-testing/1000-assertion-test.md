+++
title = "Assertion Tests"
weight = 1000
+++

### Fine-Grained Assertion Tests

#### Create a test for the DynamoDB table

{{% notice info %}} This section assumes that you have [created the hit counter construct](/60-go/40-hit-counter.html) {{% /notice %}}

Our `HitCounter` construct creates a simple DynamoDB table. Lets create a test that
validates that the table is getting created.

`cdk init` created a test file for us in `cdk-workshop_test.go`.
Replace the contents of this file with the following:

```go
package main

import (
	"testing"

	"cdk-workshop/hitcounter"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/assertions"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/jsii-runtime-go"
)

func TestHitCounterConstruct(t *testing.T) {
	defer jsii.Close()

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
	})

	// THEN
	template := assertions.Template_FromStack(stack, nil)
	template.ResourceCountIs(jsii.String("AWS::DynamoDB::Table"), jsii.Number(1))
}

```
This test is simply testing to ensure that the synthesized stack includes a DynamoDB table.

Run the test.

```bash
$ go test
```

You should see output like this:

```bash
╰─ go test
PASS
ok      cdk-workshop    6.224s
```

#### Create a test for the Lambda function

Now lets add another test, this time for the Lambda function that the `HitCounter` construct creates.
This time in addition to testing that the Lambda function is created, we also want to test that
it is created with the two environment variables `DOWNSTREAM_FUNCTION_NAME` & `HITS_TABLE_NAME`.

Add another test below the DynamoDB test. If you remember, when we created the lambda function the
environment variable values were references to other constructs.

{{<highlight go "hl_lines=6-7">}}
handler := awslambda.NewFunction(this, jsii.String("HitCounterHandler"), &awslambda.FunctionProps{
	Runtime: awslambda.Runtime_NODEJS_16_X(),
	Handler: jsii.String("hitcounter.handler"),
	Code:    awslambda.Code_FromAsset(jsii.String("lambda"), nil),
	Environment: &map[string]*string{
		"DOWNSTREAM_FUNCTION_NAME": props.Downstream.FunctionName(),
		"HITS_TABLE_NAME":          table.TableName(),
	},
})
{{</highlight>}}

At this point we don't really know what the value of the `FunctionName` or `TableName` will be since the
CDK will calculate a hash to append to the end of the name of the constructs, so we will just use a
dummy value for now. Once we run the test it will fail and show us the expected value.

We will need to compare the values of structs, so we will need to import a module which easily allows
us to do that: 	[`go-cmp`](https://pkg.go.dev/github.com/google/go-cmp/cmp)

```
go get github.com/google/go-cmp/cmp
```

Don't forget to add this module to our imports

{{<highlight go "hl_lines=10">}}
import (
	"testing"

	"cdk-workshop/hitcounter"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/assertions"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/jsii-runtime-go"
	"github.com/google/go-cmp/cmp"
)
{{</highlight>}}

Create a new test in `cdk-workshop_test.go` with the below code:

```go
func TestLambdaFunction(t *testing.T) {
	defer jsii.Close()

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
	})

	// THEN
	template := assertions.Template_FromStack(stack, nil)
	envCapture := assertions.NewCapture(nil)
	template.HasResourceProperties(jsii.String("AWS::Lambda::Function"), &map[string]any{
		"Environment": envCapture,
		"Handler": "hitcounter.handler",
	})
	expectedEnv := &map[string]any{
		"Variables": map[string]any{
			"DOWNSTREAM_FUNCTION_NAME": map[string]any{
		  		"Ref": "TestFunctionXXXXX",
			},
			"HITS_TABLE_NAME": map[string]any{
		  		"Ref": "MyTestConstructHitsXXXXX",
			},
	  	},
	}
	if !cmp.Equal(envCapture.AsObject(), expectedEnv) {
		t.Error(expectedEnv, envCapture.AsObject())
	}
}
```

Save the file and run the test again.

```bash
$ go test
```

This time the test should fail and you should be able to grab the correct value for the
variables from the expected output.

{{<highlight bash "hl_lines=3">}}
╰─ go test
--- FAIL: TestLambdaFunction (0.04s)
    cdk-workshop_test.go:65: &map[Variables:map[DOWNSTREAM_FUNCTION_NAME:map[Ref:TestFunctionXXXXX] HITS_TABLE_NAME:map[Ref:MyTestConstructHitsXXXXX]]] &map[Variables:map[DOWNSTREAM_FUNCTION_NAME:map[Ref:TestFunction22AD90FC] HITS_TABLE_NAME:map[Ref:MyTestConstructHits24A357F0]]]
FAIL
exit status 1
FAIL    cdk-workshop    5.960s
{{</highlight>}}

Grab the real values for the environment variables and update your test

{{<highlight go "hl_lines=25 28">}}
func TestLambdaFunction(t *testing.T) {
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
	})

	// THEN
	template := assertions.Template_FromStack(stack, nil)
	envCapture := assertions.NewCapture(nil)
	template.HasResourceProperties(jsii.String("AWS::Lambda::Function"), &map[string]any{
		"Environment": envCapture,
		"Handler": "hitcounter.handler",
	})
	expectedEnv := &map[string]any{
		"Variables": map[string]any{
			"DOWNSTREAM_FUNCTION_NAME": map[string]any{
		  		"Ref": "TestFunction22AD90FC",
			},
			"HITS_TABLE_NAME": map[string]any{
		  		"Ref": "MyTestConstructHits24A357F0",
			},
	  	},
	}
	if !cmp.Equal(envCapture.AsObject(), expectedEnv) {
		t.Error(expectedEnv, envCapture.AsObject())
	}
}
{{</highlight>}}

Now run the test again. This time is should pass.

```bash
$ go test
```

You should see output like this:

```bash
╰─ go test
PASS
ok      cdk-workshop    6.095s
```

You can also apply TDD (Test Driven Development) to developing CDK Constructs. For a very simple example, lets add a new
requirement that our DynamoDB table be encrypted.

First we'll update the first test to reflect this new requirement.

{{<highlight go "hl_lines=1 19-23">}}
func TestTableCreatedWithEncryption(t *testing.T) {
	defer jsii.Close()

	// GIVEN
	stack := awscdk.NewStack(nil, nil, nil)

	// WHEN
	testFn := awslambda.NewFunction(stack, jsii.String("TestFunction"), &awslambda.FunctionProps{
		Code:    awslambda.Code_FromAsset(jsii.String("lambda"), nil),
		Runtime: awslambda.Runtime_NODEJS_16_X(),
		Handler: jsii.String("hello.handler"),
	})
	hitcounter.NewHitCounter(stack, "MyTestConstruct", &hitcounter.HitCounterProps{
		Downstream: testFn,
	})

	// THEN
	template := assertions.Template_FromStack(stack, nil)
	template.HasResourceProperties(jsii.String("AWS::DynamoDB::Table"), &map[string]any{
		"SSESpecification": map[string]any{
			"SSEEnabled": true,
		},
	})
}
{{</highlight>}}

Now run the test, which should fail.

```bash
╰─ go test
--- FAIL: TestTableCreatedWithEncryption (4.51s)
panic: "Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.\nThe closest result is:\n  {\n    \"Type\": \"AWS::DynamoDB::Table\",\n    \"Properties\": {\n      \"KeySchema\": [\n        {\n          \"AttributeName\": \"path\",\n          \"KeyType\": \"HASH\"\n        }\n      ],\n      \"AttributeDefinitions\": [\n        {\n          \"AttributeName\": \"path\",\n          \"AttributeType\": \"S\"\n        }\n      ],\n      \"ProvisionedThroughput\": {\n        \"ReadCapacityUnits\": 5,\n        \"WriteCapacityUnits\": 5\n      }\n    },\n    \"UpdateReplacePolicy\": \"Delete\",\n    \"DeletionPolicy\": \"Delete\"\n  }\nwith the following mismatches:\n\tMissing key 'SSESpecification' among {KeySchema,AttributeDefinitions,ProvisionedThroughput} at /Properties/SSESpecification (using objectLike matcher)" [recovered]
        panic: "Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.\nThe closest result is:\n  {\n    \"Type\": \"AWS::DynamoDB::Table\",\n    \"Properties\": {\n      \"KeySchema\": [\n        {\n          \"AttributeName\": \"path\",\n          \"KeyType\": \"HASH\"\n        }\n      ],\n      \"AttributeDefinitions\": [\n        {\n          \"AttributeName\": \"path\",\n          \"AttributeType\": \"S\"\n        }\n      ],\n      \"ProvisionedThroughput\": {\n        \"ReadCapacityUnits\": 5,\n        \"WriteCapacityUnits\": 5\n      }\n    },\n    \"UpdateReplacePolicy\": \"Delete\",\n    \"DeletionPolicy\": \"Delete\"\n  }\nwith the following mismatches:\n\tMissing key 'SSESpecification' among {KeySchema,AttributeDefinitions,ProvisionedThroughput} at /Properties/SSESpecification (using objectLike matcher)"

goroutine 6 [running]:
testing.tRunner.func1.2({0x163f040, 0xc0002eb760})
        /usr/local/go/src/testing/testing.go:1396 +0x24e
testing.tRunner.func1()
        /usr/local/go/src/testing/testing.go:1399 +0x39f
panic({0x163f040, 0xc0002eb760})
        /usr/local/go/src/runtime/panic.go:884 +0x212
github.com/aws/jsii-runtime-go/runtime.InvokeVoid({0x16f8de0, 0xc0002fffc0}, {0x1778bcd, 0x15}, {0xc0003a5e80, 0x2, 0x2})
        /Users/woodwoop/go/pkg/mod/github.com/aws/jsii-runtime-go@v1.65.0/runtime/runtime.go:237 +0x266
github.com/aws/aws-cdk-go/awscdk/v2/assertions.(*jsiiProxy_Template).HasResourceProperties(0x1646300?, 0xc00010f2f0?, {0x15fb9c0?, 0xc0000122b0?})
        /Users/woodwoop/go/pkg/mod/github.com/aws/aws-cdk-go/awscdk/v2@v2.38.1/assertions/assertions.go:1104 +0x71
cdk-workshop.TestTableCreatedWithEncryption(0x0?)
        /Users/woodwoop/dev/CdkRepos/goWorkshop/aws-cdk-intro-workshop/code/go/main-workshop/cdk-workshop_test.go:30 +0x352
testing.tRunner(0xc0002ddba0, 0x199a290)
        /usr/local/go/src/testing/testing.go:1446 +0x10b
created by testing.(*T).Run
        /usr/local/go/src/testing/testing.go:1493 +0x35f
exit status 2
FAIL    cdk-workshop    5.667s
```

Now lets fix the broken test. Update the hitcounter code to enable encryption by default.

{{<highlight go "hl_lines=7">}}
func NewHitCounter(scope constructs.Construct, id string, props *HitCounterProps) HitCounter {
	this := constructs.NewConstruct(scope, &id)

	table := awsdynamodb.NewTable(this, jsii.String("Hits"), &awsdynamodb.TableProps{
		PartitionKey:  &awsdynamodb.Attribute{Name: jsii.String("path"), Type: awsdynamodb.AttributeType_STRING},
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
		Encryption:    awsdynamodb.TableEncryption_AWS_MANAGED,
	})

	handler := awslambda.NewFunction(this, jsii.String("HitCounterHandler"), &awslambda.FunctionProps{
		Runtime: awslambda.Runtime_NODEJS_16_X(),
		Handler: jsii.String("hitcounter.handler"),
		Code:    awslambda.Code_FromAsset(jsii.String("lambda"), nil),
		Environment: &map[string]*string{
			"DOWNSTREAM_FUNCTION_NAME": props.Downstream.FunctionName(),
			"HITS_TABLE_NAME":          table.TableName(),
		},
	})

	table.GrantReadWriteData(handler)
	props.Downstream.GrantInvoke(handler)

	return &hitCounter{this, handler, table}
}
{{</highlight>}}

Now run the test again, which should now pass.

```console
$ go test
ok      cdk-workshop    42.069s
```
