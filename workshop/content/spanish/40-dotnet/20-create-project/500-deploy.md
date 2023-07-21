+++
title = "cdk deploy"
weight = 500
+++

Vale, tenemos una plantilla de CloudFormation. ¿Qué es lo siguiente? __¡Vamos a implementarlo en nuestra cuenta!__

## Arrancar un entorno

La primera vez que implemente una aplicación de AWS CDK en un entorno (cuenta/región),
puede instalar una "pila de arranque". Esta pila incluye recursos que
se utilizan en el funcionamiento del kit de herramientas. Por ejemplo, la pila incluye un S3
depósito que se usa para almacenar plantillas y activos durante el proceso de implementación.

Puede usar el comando `cdk bootstrap` para instalar la pila de arranque en un
entorno:

```
cdk bootstrap
```

Entonces:

```
 ⏳  Bootstrapping environment 123456789012/us-west-2...
...
```

{{% notice info %}}
Si recibe un mensaje de acceso denegado en este paso, compruebe que
has [configurado correctamente la CLI de AWS](/15-prerequisites/200-account.html) (o has especificado una clave secreta o de acceso adecuada) y también has comprobado que tienes permiso para llamar a `CloudFormation:createChangeset` en el ámbito de tu [cuenta/sesión](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html){{% /notice %}}

### Vamos a desplegar

Use `cdk deploy` para implementar una aplicación de CDK:

```
cdk deploy
```

En primer lugar, se le informará de los cambios relacionados con la seguridad que el CDK realizará en su nombre, si se producen cambios relacionados con la seguridad

```
This deployment will make potentially sensitive changes according to your current security approval level (--require-approval broadening).
Please confirm you intend to make the following modifications:

IAM Statement Changes
┌───┬────────────────────────────────┬────────┬─────────────────┬────────────────────────────────┬────────────────────────────────┐
│   │ Resource                       │ Effect │ Action          │ Principal                      │ Condition                      │
├───┼────────────────────────────────┼────────┼─────────────────┼────────────────────────────────┼────────────────────────────────┤
│ + │ ${CdkWorkshopQueue.Arn}        │ Allow  │ sqs:SendMessage │ Service:sns.amazonaws.com      │ "ArnEquals": {                 │
│   │                                │        │                 │                                │   "aws:SourceArn": "${CdkWorks │
│   │                                │        │                 │                                │ hopTopic}"                     │
│   │                                │        │                 │                                │ }                              │
└───┴────────────────────────────────┴────────┴─────────────────┴────────────────────────────────┴────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Do you wish to deploy these changes (y/n)?
```

Esto te avisa de que la implementación de la aplicación contiene cambios sensibles a la seguridad.
Como necesitamos permitir que el tema envíe mensajes a la cola,
escriba **y** para implementar la pila y crear los recursos.

El resultado debería tener el siguiente aspecto, donde ACCOUNT-ID es el ID de tu cuenta, REGION es la región en la que creaste la aplicación,
y STACK-ID es el identificador único de tu pila:

```
CdkWorkshopStack: deploying...
CdkWorkshopStack: creating CloudFormation changeset...
 0/6 | 7:26:27 PM | CREATE_IN_PROGRESS   | AWS::CDK::Metadata     | CDKMetadata
 0/6 | 7:26:27 PM | CREATE_IN_PROGRESS   | AWS::SQS::Queue        | CdkWorkshopQueue (CdkWorkshopQueue50D9D426)
 0/6 | 7:26:28 PM | CREATE_IN_PROGRESS   | AWS::SQS::Queue        | CdkWorkshopQueue (CdkWorkshopQueue50D9D426) Resource creation Initiated
 0/6 | 7:26:28 PM | CREATE_IN_PROGRESS   | AWS::SNS::Topic        | CdkWorkshopTopic (CdkWorkshopTopicD368A42F)
 0/6 | 7:26:28 PM | CREATE_IN_PROGRESS   | AWS::SNS::Topic        | CdkWorkshopTopic (CdkWorkshopTopicD368A42F) Resource creation Initiated
 0/6 | 7:26:29 PM | CREATE_IN_PROGRESS   | AWS::CDK::Metadata     | CDKMetadata Resource creation Initiated
 1/6 | 7:26:29 PM | CREATE_COMPLETE      | AWS::CDK::Metadata     | CDKMetadata
 2/6 | 7:26:29 PM | CREATE_COMPLETE      | AWS::SQS::Queue        | CdkWorkshopQueue (CdkWorkshopQueue50D9D426)
 3/6 | 7:26:39 PM | CREATE_COMPLETE      | AWS::SNS::Topic        | CdkWorkshopTopic (CdkWorkshopTopicD368A42F)
 3/6 | 7:26:40 PM | CREATE_IN_PROGRESS   | AWS::SNS::Subscription | CdkWorkshopQueue/CdkWorkshopStackCdkWorkshopTopicD7BE9643 (CdkWorkshopQueueCdkWorkshopStackCdkWorkshopTopicD7BE96438B5AD106)
 3/6 | 7:26:41 PM | CREATE_IN_PROGRESS   | AWS::SQS::QueuePolicy  | CdkWorkshopQueue/Policy (CdkWorkshopQueuePolicyAF2494A5)
 3/6 | 7:26:41 PM | CREATE_IN_PROGRESS   | AWS::SQS::QueuePolicy  | CdkWorkshopQueue/Policy (CdkWorkshopQueuePolicyAF2494A5) Resource creation Initiated
 3/6 | 7:26:41 PM | CREATE_IN_PROGRESS   | AWS::SNS::Subscription | CdkWorkshopQueue/CdkWorkshopStackCdkWorkshopTopicD7BE9643 (CdkWorkshopQueueCdkWorkshopStackCdkWorkshopTopicD7BE96438B5AD106) Resource creation Initiated
 4/6 | 7:26:41 PM | CREATE_COMPLETE      | AWS::SQS::QueuePolicy  | CdkWorkshopQueue/Policy (CdkWorkshopQueuePolicyAF2494A5)
 5/6 | 7:26:41 PM | CREATE_COMPLETE      | AWS::SNS::Subscription | CdkWorkshopQueue/CdkWorkshopStackCdkWorkshopTopicD7BE9643 (CdkWorkshopQueueCdkWorkshopStackCdkWorkshopTopicD7BE96438B5AD106)
 6/6 | 7:26:43 PM | CREATE_COMPLETE      | AWS::CloudFormation::Stack | CdkWorkshopStack

 ✅  CdkWorkshopStack

Stack ARN:
arn:aws:cloudformation:REGION:ACCOUNT-ID:stack/CdkWorkshopStack/STACK-ID
```

## La consola de CloudFormation

Las aplicaciones de CDK se implementan a través de AWS CloudFormation. Cada pila de CDK se mapea 1:1 con
Pila de CloudFormation.

Esto significa que puede usar la consola de AWS CloudFormation para administrar
tus pilas.

Echemos un vistazo a [AWS CloudFormation
consola](https://console.aws.amazon.com/cloudformation/home).

Es probable que veas algo como esto (si no lo ves, asegúrate de estar en la región correcta):

![](./cfn1.png)

Si selecciona `CdkWorkshopStack` y abre la pestaña __Resources__, verá la
identidades físicas de nuestros recursos:

![](./cfn2.png)

# ¡Estoy listo para un poco de codificación real!
