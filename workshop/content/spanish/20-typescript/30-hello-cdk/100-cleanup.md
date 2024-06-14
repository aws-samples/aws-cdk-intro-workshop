+++
title = "Limpieza del código de ejemplo"
weight = 100
+++

## Elimina el código de ejemplo de tu pila (stack)

El proyecto creado por `cdk init sample-app` incluye una cola SQS y un política de cola, un tema de SNS y una suscripción. No vamos a usar éstos en nuestro proyecto, entonces los removeremos del constructo `CdkWorkshopStack`.

Abre `lib/cdk-workshop-stack.ts` y remueve. Eventualmente debería verse así:

```ts
import * as cdk from 'aws-cdk-lib';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Nada por aquí!
  }
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

