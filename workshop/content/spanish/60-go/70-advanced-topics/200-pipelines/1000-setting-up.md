+++
title = "Introducción a las Canalizaciones"
weight = 1000
+++

> Nota: Esta sección del workshop asume que usted ha completado las secciones previas.  Si usted no lo ha hecho, y solamente quiere seguir esta sección, o si usted está retornando a intentar este workshop, usted puede utilizar el código [aquí](https://github.com/aws-samples/aws-cdk-intro-workshop/tree/master/code/typescript/tests-workshop) que representa el último estado del proyecto después de adicionar las pruebas.

## Refactorizar
Antes de crear la canalización, refactoricemos el proyecto un poco.
Primero, creemos un nuevo folder llamado `infra`, y un nuevo archivo llamado `workshop-stack.go`
con el contenido que declaramos en  `cdk-workshop.go`, excepto la función `main()`.

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

Por supuesto, mantener este código en `cdk-workshop.go` es innecesario, así que podemos removerlo de allí y dejar solamente:

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

No estamos desplegando ninguna pila ahora! Está bien, lo haremos dentro de poco.

## Crear la Pila para la Canalización
Ahora creeemos la pila que contendrá nuestra canalización.
Teniendo en cuenta que esta pila es independiente de nuestra aplicación de "producción" real, queremos mantenerla completamente separada.

Cree un nuevo archivo bajo `infra` llamado `pipeline-stack.go`. Adicione el siguiente código al archivo.

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

Parece familiar? En este punto, la canalización es como cualquier otra pila de CDK.

## Actualizar el Punto de Entrada para el Despliegue de CDK
A continuación, ya que el propósito de nuestra canalización es desplegar la pila de nuestra aplicación, no necesitamos que la aplicación principal de CDK despliegue nuestra aplicación original. En su lugar, podemos cambiar el punto de entrada para que se despliegue nuestra canalización, que a su vez hará el despliegue de la aplicación.

Para hacer esto, edite el código en `cdk-workshop.go` así:

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


Y ahora estamos listos!

# Construyamos una canalización!
