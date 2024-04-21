+++
title = "Add Application to Pipeline"
weight = 4000
+++

## Create Stage
At this point, you have a fully operating CDK pipeline that will automatically update itself on every commit, *BUT* at the moment, that is all it does. We need to add a stage to the pipeline that will deploy our application.

Create a new file in `infra` called `pipeline-stage.go` with the code below:

{{<highlight go>}}
package infra

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/constructs-go/constructs/v10"
)

type WorkshopPipelineStageProps struct {
	awscdk.StageProps
}

func NewWorkshopPipelineStage(scope constructs.Construct, id string, props *WorkshopPipelineStageProps) awscdk.Stage {
	var sprops awscdk.StageProps
	if props != nil {
		sprops = props.StageProps
	}
	stage := awscdk.NewStage(scope, &id, &sprops)

	NewCdkWorkshopStack(stage, "WebService", nil)

	return stage
}
{{</highlight>}}

All this does is declare a new `Stage` (component of a pipeline), and in that stage instantiate our application stack.

## Add stage to pipeline
Now we must add the stage to the pipeline by adding the following code to `infra/pipeline-stack.go`:

{{<highlight go "hl_lines=26 39-40">}}
package infra

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscodecommit"
	"github.com/aws/aws-cdk-go/awscdk/v2/pipelines"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
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

	repo := awscodecommit.NewRepository(stack, jsii.String("WorkshopRepo"), &awscodecommit.RepositoryProps{
		RepositoryName: jsii.String("WorkshopRepo"),
	})

	pipeline := pipelines.NewCodePipeline(stack, jsii.String("Pipeline"), &pipelines.CodePipelineProps{
		PipelineName: jsii.String("WorkshopPipeline"),
		Synth: pipelines.NewCodeBuildStep(jsii.String("SynthStep"), &pipelines.CodeBuildStepProps{
			Input: pipelines.CodePipelineSource_CodeCommit(repo, jsii.String("main"), nil),
			Commands: jsii.Strings(
				"npm install -g aws-cdk",
                "goenv install 1.18.3",
				"goenv local 1.18.3",
				"cdk synth",
			),
		}),
	})

	deploy := NewWorkshopPipelineStage(stack, "Deploy", nil)
	pipeline.AddStage(deploy, nil)

	return stack
}
{{</highlight>}}

This imports and creates an instance of the `WorkshopPipelineStage`. Later, you might instantiate this stage multiple times (e.g. you want a Production deployment and a separate development/test deployment).

Then we add that stage to our pipeline (`pipeline.AddStage(deploy);`). A Stage in a CDK Pipeline represents a set of one or more CDK Stacks that should be deployed together, to a particular environment.

## Commit/Deploy
Now that we have added the code to deploy our application, all that's left is to commit and push those changes to the repo.

```
git commit -am "Add deploy stage to pipeline" && git push
```

Once that is done, we can go back to the [CodePipeline console](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) and take a look as the pipeline runs (this may take a while).

![](./pipeline-succeed.png)

Success!

{{< nextprevlinks >}}