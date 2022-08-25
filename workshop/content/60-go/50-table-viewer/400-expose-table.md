+++
title = "Exposing our hit counter table"
weight = 400
+++

## Add a table property to our hit counter

Edit `hitcounter.go` and modify it so that `table` is exposed as a public property.

{{<highlight go "hl_lines=17 46 53-55">}}
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
	table awsdynamodb.Table
}

type HitCounter interface {
	constructs.Construct
	Handler() awslambda.IFunction
	Table() awsdynamodb.Table
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
			"DOWNSTREAM_FUNCTION_NAME": (*props).Downstream.FunctionName(),
			"HITS_TABLE_NAME":          table.TableName(),
		},
	})

	table.GrantReadWriteData(handler)
	props.Downstream.GrantInvoke(handler)

	return &hitCounter{this, handler, table}
}

func (h *hitCounter) Handler() awslambda.IFunction {
	return h.handler
}

func (h *hitCounter) Table() awsdynamodb.Table {
	return h.table
}
{{</highlight>}}

## Now we can access the table from our stack

Go back to `cdk-workshop.go` and assign the `Table` property of the table viewer:

{{<highlight go "hl_lines=40">}}
package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsapigateway"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
	"cdk-workshop/hitcounter"
	"github.com/cdklabs/cdk-dynamo-table-viewer-go/dynamotableviewer"
)

type CdkWorkshopStackProps struct {
	awscdk.StackProps
}

func NewCdkWorkshopStack(scope constructs.Construct, id string, props *CdkWorkshopStackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)

	helloHandler := awslambda.NewFunction(stack, jsii.String("HelloHandler"), &awslambda.FunctionProps{
		Code: awslambda.Code_FromAsset(jsii.String("lambda"), nil),
		Runtime: awslambda.Runtime_NODEJS_16_X(),
		Handler: jsii.String("hello.handler"),
	})

	hitcounter := hitcounter.NewHitCounter(stack, "HelloHitCounter", &hitcounter.HitCounterProps{
		Downstream: helloHandler,
	})

	awsapigateway.NewLambdaRestApi(stack, jsii.String("Endpoint"), &awsapigateway.LambdaRestApiProps{
		Handler: hitcounter.Handler(),
	})

	dynamotableviewer.NewTableViewer(stack, jsii.String("ViewHitCounter"), &dynamotableviewer.TableViewerProps{
		Title: jsii.String("Hello Hits"),
		Table: hitcounter.Table()
	})

	return stack
}

func main() {
	defer jsii.Close()

	app := awscdk.NewApp(nil)

	NewCdkWorkshopStack(app, "CdkWorkshopStack", &CdkWorkshopStackProps{})

	app.Synth(nil)
}
{{</highlight>}}
