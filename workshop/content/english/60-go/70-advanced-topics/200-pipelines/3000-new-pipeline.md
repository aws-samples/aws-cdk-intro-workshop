+++
title = "Create New Pipeline"
weight = 3000
+++

## Define an Empty Pipeline
Now we are ready to define the basics of the pipeline.

Return to the file `infra/pipeline-stack.go` and edit as follows:

{{<highlight go "hl_lines=6 22 26-37">}}
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

	pipelines.NewCodePipeline(stack, jsii.String("Pipeline"), &pipelines.CodePipelineProps{
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

	return stack
}
{{</highlight>}}

### Component Breakdown
The above code does several things:

* `NewCodePipeline(...)`: This initializes the pipeline with the required values. This will serve as the base component moving forward. Every pipeline requires at bare minimum:
    * `Synth(...)`: The `synthAction` of the pipeline describes the commands necessary to install dependencies, build, and synth the CDK application from source. This should always end in a *synth* command, for NPM-based projects this is always `cdk synth`.
  * The `Input` of the synth step specifies the repository where the CDK source code is stored.

## Deploy Pipeline and See Result
All that's left to get our pipeline up and running is to commit our changes and run one last cdk deploy.

```
git commit -am "MESSAGE" && git push
cdk deploy
```

CDK Pipelines auto-update for each commit in a source repo, so this is the *last time* we will need to execute this command!

Once deployment is finished, you can go to the [CodePipeline console](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) and you will see a new pipeline! If you navigate to it, it should look like this:

![](./pipeline-init.png)

{{< nextprevlinks >}}