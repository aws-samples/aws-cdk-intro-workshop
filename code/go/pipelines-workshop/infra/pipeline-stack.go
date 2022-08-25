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
			Input: pipelines.CodePipelineSource_CodeCommit(repo, jsii.String("master"), nil),
			Commands: jsii.Strings(
				"npm install -g aws-cdk",
				"goenv install 1.18.3",
				"goenv local 1.18.3",
				"npx cdk synth",
			),
		}),
	})

	deploy := NewWorkshopPipelineStage(stack, "Deploy", nil)
	deployStage := pipeline.AddStage(deploy.Stage(), nil)

	deployStage.AddPost(
		pipelines.NewCodeBuildStep(jsii.String("TestViewerEndpoint"), &pipelines.CodeBuildStepProps{
			ProjectName: jsii.String("TestViewerEndpoint"),
			EnvFromCfnOutputs: &map[string]awscdk.CfnOutput{
				"ENDPOINT_URL": deploy.HcViewerUrl(),
			},
			Commands: jsii.Strings("curl -Ssf $ENDPOINT_URL"),
		}),
		pipelines.NewCodeBuildStep(jsii.String("TestAPIGatewayEndpoint"), &pipelines.CodeBuildStepProps{
			ProjectName: jsii.String("TestAPIGatewayEndpoint"),
			EnvFromCfnOutputs: &map[string]awscdk.CfnOutput{
				"ENDPOINT_URL": deploy.HcEndpoint(),
			},
			Commands: jsii.Strings(
				"curl -Ssf $ENDPOINT_URL",
				"curl -Ssf $ENDPOINT_URL/hello",
				"curl -Ssf $ENDPOINT_URL/test",
			),
		}),
	)

	return stack
}