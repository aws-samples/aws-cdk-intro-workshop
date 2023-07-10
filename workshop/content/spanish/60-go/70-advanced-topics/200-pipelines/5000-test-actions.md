+++
title = "Mejorar la Canalización"
weight = 5000
+++

## Obtener Puntos de Conexión
Observando detenidamente, podemos ver que hay un problema ahora que la aplicación esta siendo desplegada por nuestra canalización. No hay una manera fácil de encontrar los puntos de conexión de nuestra aplicación (para `TableViewer` y `APIGateway`), así que no podemos acceder a ellos! Agreguemos un poco de código que nos permita exponerlos de una manera más obvia.

Primero editemos `infra/workshop-stack.go` para obtener estos valores y exponerlos como propiedades de nuestra pila:

{{<highlight go "hl_lines=18-30 48 52 57-63 65 68-74">}}
package infra

import (
	"cdk-workshop/hitcounter"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsapigateway"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
	"github.com/cdklabs/cdk-dynamo-table-viewer-go/dynamotableviewer"
)

type CdkWorkshopStackProps struct {
	awscdk.StackProps
}

type cdkWorkshopStack struct {
	awscdk.Stack
	hcViewerUrl awscdk.CfnOutput
	hcEndpoint  awscdk.CfnOutput
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
{{</highlight>}}

Al agregar las salidas `hcViewerUrl` y `hcEnpoint`, estamos exponiendo los puntos de conexión necesarios para nuestra aplicación HitCounter. Estamos utilizando el constructo básico `CfnOutput` para declarar estas salidas como salidas de la pila de CloudFormation (explicaremos mas detalles en un minuto).

Confirmemos estos cambios a nuestro repositorio (`git commit -am "MESSAGE" && git push`), y naveguemos a la [consola de CloudFormation](https://console.aws.amazon.com/cloudformation). Allí usted puede ver que hay tres pilas.

* `CDKToolkit`: La primera es la pila integrada de CDK (ustede debe ver esta pila en todas las cuentas en donde haya configurado CDK). Puede ignorar esta pila.
* `WorkshopPipelineStack`: Esta es la pila que declara nuestra canalización. No es realmente la que necesitamos ahora.
* `Deploy-WebService`: Aquí está nuestra aplicación! Seleccione esta pila, y bajo sus detalles, seleccione el tab `Outputs`. Aquí ustede debe encontrar cuatro puntos de conexión (dos pares de valores duplicados).  Dos de ellos, `EndpointXXXXXX` y `ViewerHitCounterViewerEndpointXXXXXXX`, son los generados por Cloudformation, y los otros dos son los que nosotros mismos generamos.

![](./stack-outputs.png)

Si usted hace click en `TableViewerUrl`, usted debería ver nuestra bella tabla contadora de hits que creamos durante el workshop inicial.

## Adicionar una Prueba de Validación
Ahora ya hemos desplegado nuestra aplicación, pero una canalización de CD no es completa sin pruebas!

Comencemos con una simple prueba que le haga ping a nuestros puntos de conexión para confirmar que están vivos.
Volvamos a `infra/pipeline-stack.go` y agreguemos lo siguiente:

{{<highlight go "hl_lines=40-61">}}
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
				"npx cdk synth",
			),
		}),
	})

	deploy := NewWorkshopPipelineStage(stack, "Deploy", nil)
	deployStage := pipeline.AddStage(deploy, nil)

	deployStage.AddPost(
		pipelines.NewCodeBuildStep(jsii.String("TestViewerEndpoint"), &pipelines.CodeBuildStepProps{
			ProjectName: jsii.String("TestViewerEndpoint"),
			EnvFromCfnOutputs: &map[string]awscdk.CfnOutput{
				"ENDPOINT_URL": //TBD
			},
			Commands: jsii.Strings("curl -Ssf $ENDPOINT_URL"),
		}),
		pipelines.NewCodeBuildStep(jsii.String("TestAPIGatewayEndpoint"), &pipelines.CodeBuildStepProps{
			ProjectName: jsii.String("TestAPIGatewayEndpoint"),
			EnvFromCfnOutputs: &map[string]awscdk.CfnOutput{
				"ENDPOINT_URL": //TBD
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
{{</highlight>}}

Adicionamos pasos post-implementación utilizando `deployStage.AddPost(...)` de Canalizaciones de CDK. Agregamos dos acciones a nuestra etapa de despliegue: para probar el punto de conexión de nuestro TableViewer y el punto de conexión de nuestro APIGateway, respectivamente.

> Nota: Enviamos varios requerimientos de `curl` al punto de conexión de APIGateway de tal forma que cuando accedamos a nuestro TableViewer, haya varios valores ya poblados.

Usted puede haber notado que aun no hemos asignado el valor de los URLs de estos puntos de conexión. Esto se debe a que aún no han sido expuestos a esta pila!

Con una pequeña modificación a `infra/pipeline-stage.go` los podemos exponer:

{{<highlight go "hl_lines=12-22 24 31 33 36-46">}}
package infra

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/constructs-go/constructs/v10"
)

type WorkshopPipelineStageProps struct {
	awscdk.StageProps
}

type workshopPipelineStage struct {
	stage awscdk.Stage
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
{{</highlight>}}

Y ahora podemos agregar esos valores a nuestras acciones en `infra/pipeline-stack.go` obteniendo el `stackOutput` de nuestra pila de canalización:
{{<highlight go "hl_lines=2 8 15">}}
	// CODE HERE...
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
{{</highlight>}}

## Confirmar y Verificar!
Confirme estos cambios, espere a que la canalización haga el re-despliegue de la aplicación, navegue de nuevo a la [consola de CodePipeline](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) y allí usted podrá ver que hay dos acciones de prueba contenidas dentro de la etapa de despliegue (`Deploy`)!

![](./pipeline-tests.png)

Felicitaciones! Usted ha creado exitosamente una canalización de CD para su aplicación completa con pruebas y todo! Sientase libre de explorar la consola para ver los detalles de la pila creada, o dele un vistazo a la sección en la [Referencia del API](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html) acerca de Canalizaciones de CDK y construya una para su aplicación.
