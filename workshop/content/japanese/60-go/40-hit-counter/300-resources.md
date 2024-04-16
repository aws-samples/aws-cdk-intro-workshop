+++
title = "Define resources"
weight = 300
+++

## Add resources to the hit counter construct

Now, let's define the AWS Lambda function and the DynamoDB table in our
`HitCounter` construct. Go back to `hitcounter/hitcounter.go` and add the following highlighted code:

{{<highlight go "hl_lines=4 7 16 21 27-41 44-46">}}
package hitcounter

import (
	"github.com/aws/aws-cdk-go/awscdk/v2/awsdynamodb"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type HitCounterProps struct {
	Downstream awslambda.IFunction
}

type hitCounter struct {
	constructs.Construct
	handler awslambda.IFunction
}

type HitCounter interface {
	constructs.Construct
	Handler() awslambda.IFunction
}

func NewHitCounter(scope constructs.Construct, id string, props *HitCounterProps) HitCounter {
	this := constructs.NewConstruct(scope, &id)

	table := awsdynamodb.NewTable(this, jsii.String("Hits"), &awsdynamodb.TableProps{
		PartitionKey: &awsdynamodb.Attribute{Name: jsii.String("path"), Type: awsdynamodb.AttributeType_STRING},
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

	return &hitCounter{this, handler}
}

func (h *hitCounter) Handler() awslambda.IFunction {
	return h.handler
}
{{</highlight>}}

## What did we do here?

This code is hopefully quite easy to understand:

 * We defined a DynamoDB table with `path` as the partition key.
 * We defined a Lambda function which is bound to the `lambda/hitcounter.handler` code.
 * We __wired__ the Lambda's environment variables to the `FunctionName` and `TableName`
   of our resources.

## Late-bound values

The `FunctionName` and `TableName` properties are values that only resolve when
we deploy our stack (notice that we haven't configured these physical names when
we defined the table/function, only logical IDs). This means that if you print
their values during synthesis, you will get a "TOKEN", which is how the CDK
represents these late-bound values. You should treat tokens as *opaque strings*.
This means you can concatenate them together for example, but don't be tempted
to parse them in your code.

{{< nextprevlinks >}}