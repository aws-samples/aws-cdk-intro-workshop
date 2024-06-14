+++
title = "Limpieza del código de ejemplo"
weight = 100
+++

## Elimina el código de ejemplo de tu pila (stack)

El proyecto creado por `cdk init sample-app` incluye una cola SQS y un política de cola, un tema de SNS y una suscripción. No vamos a usar éstos en nuestro proyecto, entonces los removeremos de la función `NewCdkWorkshopStack`. Nosotros no necesitaremos importar estos módulos más, por lo tanto podemos eliminarlos desde los imports (Pero necesitaremos importar después `jsii-runtime-go`).
Además, no necesitaremos pasarlo al ambiente a ser usado en la pila.

Abre `cdk-workshop.go` y remueve. Eventualmente debería verse así:

```go
package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type CdkWorkshopStackProps struct {
	awscdk.StackProps
}

func NewCdkWorkshopStack(scope constructs.Construct, id string, props *CdkWorkshopStackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)

	return stack
}

func main() {
	defer jsii.Close()

	app := awscdk.NewApp(nil)

	NewCdkWorkshopStack(app, "CdkWorkshopStack", &CdkWorkshopStackProps{})

	app.Synth(nil)
}
```

## cdk diff

Ahora que hemos modificado el contenido de nuestra pila (stack), podemos pedirle al toolkit que nos muestre la diferencia entre nuestra aplicación CDK y lo que está actualmente desplegado. Esta es una manera segura de verificar que podría pasar una vez ejecutemos el comando `cdk deploy` y siempre es una buena práctica:

```
cdk diff
```

La salida debería verse así:

```
Stack CdkWorkshopStack
IAM Statement Changes
┌───┬─────────────────────────────────┬────────┬─────────────────┬───────────────────────────┬──────────────────────────────────────────────────┐
│   │ Resource                        │ Effect │ Action          │ Principal                 │ Condition                                        │
├───┼─────────────────────────────────┼────────┼─────────────────┼───────────────────────────┼──────────────────────────────────────────────────┤
│ - │ ${CdkWorkshopQueue50D9D426.Arn} │ Allow  │ sqs:SendMessage │ Service:sns.amazonaws.com │ "ArnEquals": {                                   │
│   │                                 │        │                 │                           │   "aws:SourceArn": "${CdkWorkshopTopicD368A42F}" │
│   │                                 │        │                 │                           │ }                                                │
└───┴─────────────────────────────────┴────────┴─────────────────┴───────────────────────────┴──────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Resources
[-] AWS::SQS::Queue CdkWorkshopQueue50D9D426 destroy
[-] AWS::SQS::QueuePolicy CdkWorkshopQueuePolicyAF2494A5 destroy
[-] AWS::SNS::Topic CdkWorkshopTopicD368A42F destroy
[-] AWS::SNS::Subscription CdkWorkshopTopicCdkWorkshopQueueSubscription88D211C7 destroy
```

Como es de esperarse, todos nuestros recursos estarán siendo borrados completamente.

## cdk deploy

Ejecuta `cdk deploy` y __procede a la siguiente sección__ (No es necesario esperar):

```
cdk deploy
```

Deberías ver los recursos que están siendo eliminados.
