package infra

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/constructs-go/constructs/v10"
)

type WorkshopPipelineStageProps struct {
	awscdk.StageProps
}

type workshopPipelineStage struct {
	stage       awscdk.Stage
	hcViewerUrl awscdk.CfnOutput
	hcEndpoint  awscdk.CfnOutput
}

type WorkshopPipelineStage interface {
	Stage() awscdk.Stage
	HcViewerUrl() awscdk.CfnOutput
	HcEndpoint() awscdk.CfnOutput
}

func NewWorkshopPipelineStage(scope constructs.Construct, id string, props *WorkshopPipelineStageProps) WorkshopPipelineStage {
	var sprops awscdk.StageProps
	if props != nil {
		sprops = props.StageProps
	}
	stage := awscdk.NewStage(scope, &id, &sprops)

	workshopStack := NewCdkWorkshopStack(stage, "WebService", nil)

	return &workshopPipelineStage{stage, workshopStack.HcViewerUrl(), workshopStack.HcEndpoint()}
}

func (s *workshopPipelineStage) Stage() awscdk.Stage {
	return s.stage
}

func (s *workshopPipelineStage) HcViewerUrl() awscdk.CfnOutput {
	return s.hcViewerUrl
}

func (s *workshopPipelineStage) HcEndpoint() awscdk.CfnOutput {
	return s.hcEndpoint
}
