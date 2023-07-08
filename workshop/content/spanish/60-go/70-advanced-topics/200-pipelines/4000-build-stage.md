+++
title = "Adicionar una Aplicación a la Canalización"
weight = 4000
+++

## Crear una Etapa
En este punto, usted tiene una canalización operativa completa de CDK que se actualiza automáticamente con cada confirmacióm, *PERO* por el momento, eso es todo lo que hace. Necesitamos adicionar una etapa a la canalización que despliegue nuestra aplicación.

Cree un nuevo archivo llamado `pipeline-stage.go` en el directorio `infra` con el siguiente código:

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

Esto solamente declara una nueva etapa (`Stage`) (componente de una canalización), y en esa etapa crea una instancia de la pila de nuestra aplicación.

## Adicionar la pila a la canalización
Ahora debemos adicionar la etapa a la canalización agregando el siguiento código a `infra/pipeline-stack.go`:

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
				"npx cdk synth",
			),
		}),
	})

	deploy := NewWorkshopPipelineStage(stack, "Deploy", nil)
	pipeline.AddStage(deploy, nil)

	return stack
}
{{</highlight>}}

Esto importa y crea una instancia de `WorkshopPipelineStage`. Más tarde, usted podría instanciar esta etapa múltiples veces (por ejemplo, usted desea crear un despliegue de Producción y un despliegue de Desarrollo/Pruebas separados).

Luego agregamos esa etapa a nuestra canalización (`pipeline.AddStage(deploy);`). Una etapa (`Stage`) en una canalización de CDK representa un juego de una o mas pilas de CDK que deben ser desplegadas juntas, a un ambiente particular.

## Confirmar/Desplegar
Ahora que hemos adicionado el código para desplegar nuestra aplicación, solo nos falta confirmar y enviar los cambios al repositorio.

```
git commit -am "Add deploy stage to pipeline" && git push
```

Una que que esto se ha hecho, podemos volver a la [consola de CodePipeline](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) y observar que la canalización está en ejecución (esto puede tomar algún tiempo).

![](./pipeline-succeed.png)

Éxito!
