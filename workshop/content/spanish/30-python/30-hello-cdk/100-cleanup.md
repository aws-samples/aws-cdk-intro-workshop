+++
title = "Limpieza del código de ejemplo"
weight = 100
+++

## Elimina el código de ejemplo de tu pila (stack)

El proyecto creado por `cdk init sample-app` incluye una cola SQS y un política de cola, un tema de SNS y una suscripción. No vamos a usar éstos en nuestro proyecto, entonces los removeremos del `CdkWorkshopStack` constructo.

Abre `cdk_workshop/cdk_workshop_stack.py` y remueve. Eventualmente debería verse así:

```py
from constructs import Construct

from aws_cdk import (

    Stack

)


class CdkWorkshopStack(Stack):


    def __init__(self, scope: Construct, id: str, **kwargs) -> None:

        super().__init__(scope, id, **kwargs)

        # Nada para ver aquí!

```

## cdk diff

Ahora que hemos modificado el contenido de nuestra pila (stack), podemos pedirle al toolkit que nos muestre la diferencia entre nuestra aplicación CDK y lo que está actualmente desplegado. Esta es una manera segura de verificar que podría pasar una vez ejecutemos el comando `cdk deploy` y siempre es una buena práctica:

```
cdk diff
```

La salida debería verse así:

```
Stack cdk-workshop
IAM Statement Changes
┌───┬─────────────────────────────────┬────────┬─────────────────┬───────────────────────────┬─────────────────────────────────────────────────────────────────┐
│   │ Resource                        │ Effect │ Action          │ Principal                 │ Condition                                                       │
├───┼─────────────────────────────────┼────────┼─────────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ - │ ${CdkworkshopQueue18864164.Arn} │ Allow  │ sqs:SendMessage │ Service:sns.amazonaws.com │ "ArnEquals": {                                                  │
│   │                                 │        │                 │                           │   "aws:SourceArn": "${CdkworkshopTopic58CFDD3D}"                │
│   │                                 │        │                 │                           │ }                                                               │
└───┴─────────────────────────────────┴────────┴─────────────────┴───────────────────────────┴─────────────────────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Resources
[-] AWS::SQS::Queue CdkworkshopQueue18864164 destroy
[-] AWS::SQS::QueuePolicy CdkworkshopQueuePolicy78D5BF45 destroy
[-] AWS::SNS::Subscription CdkworkshopQueuecdkworkshopCdkworkshopTopic7642CC2FCF70B637 destroy
[-] AWS::SNS::Topic CdkworkshopTopic58CFDD3D destroy
```

Como es de esperarse, todos nuestros recursos estarán siendo borrados completamente.


## cdk deploy

Ejecuta `cdk deploy` y procede a la siguiente sección (No es necesario esperar):

```
cdk deploy
```

Deberías ver los recursos que están siendo eliminados.
