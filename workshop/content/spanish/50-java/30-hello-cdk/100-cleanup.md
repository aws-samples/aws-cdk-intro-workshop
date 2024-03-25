+++
title = "Limpieza del código de ejemplo"
weight = 100
+++

## Elimina el código de ejemplo de tu pila (stack)

El proyecto creado por `cdk init sample-app` incluye una cola SQS y un política de cola, un tema de SNS y una suscripción. No vamos a usar éstos en nuestro proyecto, entonces los removeremos del constructo `CdkWorkshopStack`.

Abre `~/CdkWorkshopStack.java` y remueve. Eventualmente debería verse así:

```java
package com.myorg;

import software.constructs.Construct;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;

public class CdkWorkshopStack extends Stack {
    public CdkWorkshopStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public CdkWorkshopStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        // Nada por aquí!
    }
}
```

## Elimina el directorio `test`

El directorio `test` puede ser usado para crear pruebas con la librería `junit`. Para el propósito de este workshop, no lo necesitamos, así que puedes eliminar el directorio de la raíz.

## cdk diff

Ahora que hemos modificado el contenido de nuestra pila (stack), podemos pedirle al toolkit que nos muestre la diferencia entre nuestra aplicación CDK y lo que está actualmente desplegado. Esta es una manera segura de verificar que podría pasar una vez ejecutemos el comando `cdk deploy` y siempre es una buena práctica:

```
mvn clean package
cdk diff
```

La salida debería verse así:

```
IAM Statement Changes
┌───┬─────────────────────────────────┬────────┬─────────────────┬───────────────────────────┬──────────────────────────────────────────────────┐
│   │ Resource                        │ Effect │ Action          │ Principal                 │ Condition                                        │
├───┼─────────────────────────────────┼────────┼─────────────────┼───────────────────────────┼──────────────────────────────────────────────────┤
│ - │ ${CdkWorkshopQueue50D9D426.Arn} │ Allow  │ sqs:SendMessage │ Service:sns.amazonaws.com │ "ArnEquals": {                                   │
│   │                                 │        │                 │                           │   "aws:SourceArn": "${CdkWorkshopTopicD368A42F}" │
│   │                                 │        │                 │                           │ }                                                │
└───┴─────────────────────────────────┴────────┴─────────────────┴───────────────────────────┴──────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See http://bit.ly/cdk-2EhF7Np)

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
