+++
title = "Getting Started with Pipelines"
weight = 1000
+++

> Note: This segment of the workshop assumes you have completed the previous sections of the workshop. If you have not, and just want to follow this segment, or you are returning to try this workshop, you can use the code [here](https://github.com/aws-samples/aws-cdk-intro-workshop/tree/master/code/typescript/tests-workshop) that represents the last state of the project after adding the tests.

## Refactor
To prepare for creating a pipeline, let's refactor the project a little bit.
First, create a new folder called `infra`, and create a new file `workshop-stack.go`
with the contents we've declared in `cdk-workshop.go`, aside from the `main()` function

```go
package infra

import (
	"cdk-workshop/hitcounter"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsapigateway"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
	"github.com/cdklabs/cdk-dynamo-table-viewer-go/dynamotableviewer"
)

type CdkWorkshopStackProps struct {
	awscdk.StackProps
}

func NewCdkWorkshopStack(scope constructs.Construct, id string, props *cdkWorkshopStackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)

	helloHandler := awslambda.NewFunction(stack, jsii.String("HelloHandler"), &awslambda.FunctionProps{
		Code:    awslambda.Code_FromAsset(jsii.String("lambda"), nil),
		Runtime: awslambda.Runtime_NODEJS_16_X(),
		Handler: jsii.String("hello.handler"),
	})

	hitcounter := hitcounter.NewHitCounter(stack, "HelloHitCounter", &hitcounter.HitCounterProps{
		Downstream:   helloHandler,
		ReadCapacity: 10,
	})

	awsapigateway.NewLambdaRestApi(stack, jsii.String("Endpoint"), &awsapigateway.LambdaRestApiProps{
		Handler: hitcounter.Handler(),
	})

	dynamotableviewer.NewTableViewer(stack, jsii.String("ViewHitCounter"), &dynamotableviewer.TableViewerProps{
		Title: jsii.String("Hello Hits"),
		Table: hitcounter.Table(),
	})

	return stack
}
```

Keeping this code in `cdk-workshop.go` is unnecessary of course, so we can remove the redundant code
and end up with this barebones file

```go
package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
)

func main() {
	defer jsii.Close()

	app := awscdk.NewApp(nil)

	app.Synth(nil)
}
```

We aren't deploying any stacks now! That's okay, we'll get to that real quick.

## Create Pipeline Stack
Now let's create the stack that will contain our pipeline.
Since this is separate from our actual "production" application, we want this to be entirely self-contained.

Create a new file under `infra` called `pipeline-stack.go`. Add the following to that file.

{{<highlight go>}}
package infra

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/constructs-go/constructs/v10"
)

type PipelineStackProps struct {
	awscdk.StackProps
}

func NewPipelineStack(scope constructs.Construct, id string, props *PipelineStackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)

	return stack
}
{{</highlight>}}

Look familiar? At this point, the pipeline is like any other CDK stack.

## Update CDK Deploy Entrypoint
Next, since the purpose of our pipeline is to deploy our application stack, we no longer want the main CDK application to deploy our original app. Instead, we can change the entry point to deploy our pipeline, which will in turn deploy the application.

To do this, edit the code in `cdk-workshop.go` as follows:

{{<highlight ts "hl_lines=4 15">}}
package main

import (
	"cdk-workshop/infra"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
)

func main() {
	defer jsii.Close()

	app := awscdk.NewApp(nil)

	infra.NewPipelineStack(app, "PipelineStack", &infra.PipelineStackProps{})

	app.Synth(nil)
}
{{</highlight>}}


And now we're ready!

# Lets build a pipeline!
