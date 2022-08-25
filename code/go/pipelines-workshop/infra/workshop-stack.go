package infra

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

type cdkWorkshopStack struct {
	awscdk.Stack
	hcViewerUrl awscdk.CfnOutput
	hcEndpoint awscdk.CfnOutput
}

type CdkWorkshopStack interface {
	awscdk.Stack
	HcViewerUrl() awscdk.CfnOutput
	HcEndpoint() awscdk.CfnOutput
}

func NewCdkWorkshopStack(scope constructs.Construct, id string, props *CdkWorkshopStackProps) CdkWorkshopStack {
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
		ReadCapacity: 10,
	})

	gateway := awsapigateway.NewLambdaRestApi(stack, jsii.String("Endpoint"), &awsapigateway.LambdaRestApiProps{
		Handler: hitcounter.Handler(),
	})

	tv := dynamotableviewer.NewTableViewer(stack, jsii.String("ViewHitCounter"), &dynamotableviewer.TableViewerProps{
		Title: jsii.String("Hello Hits"),
		Table: hitcounter.Table(),
	})

	hcViewerUrl := awscdk.NewCfnOutput(stack, jsii.String("GatewayUrl"), &awscdk.CfnOutputProps{
		Value: gateway.Url(),
	})

	hcEndpoint := awscdk.NewCfnOutput(stack, jsii.String("TableViewerUrl"), &awscdk.CfnOutputProps{
		Value: tv.Endpoint(),
	})

	return &cdkWorkshopStack{stack, hcViewerUrl, hcEndpoint}
}

func (s *cdkWorkshopStack) HcViewerUrl() awscdk.CfnOutput {
	return s.hcViewerUrl
}

func (s *cdkWorkshopStack) HcEndpoint() awscdk.CfnOutput {
	return s.hcEndpoint
}