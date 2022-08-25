package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	"cdk-workshop/infra"
)

func main() {
	defer jsii.Close()

	app := awscdk.NewApp(nil)

	infra.NewPipelineStack(app, "PipelineStack", &infra.PipelineStackProps{})

	app.Synth(nil)
}
