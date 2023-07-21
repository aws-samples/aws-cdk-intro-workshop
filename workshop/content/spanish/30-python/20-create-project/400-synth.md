+++
title = "cdk synth"
weight = 400
+++

## Sintetiza una plantilla desde tu aplicación

De hecho, las aplicaciones de AWS CDK son solo una __definición__ de su infraestructura mediante
código. Cuando se ejecutan aplicaciones de CDK, producen (o "__synthesize__", en CDK
(lenguaje): una plantilla de AWS CloudFormation para cada pila definida en su
aplicación.

Para sintetizar una aplicación de CDK, usa el comando `cdk synth`. Vamos a echar un vistazo al
plantilla sintetizada a partir de la aplicación de muestra:

{{% notice info %}}La **CDK CLI** requiere que estés en el mismo directorio 
como tu archivo `cdk.json`. Si ha cambiado de directorio en su terminal, 
navega hacia atrás ahora.{{% /notice %}}

```
$ cdk ls
cdk_workshop
$ cd cdk_workshop
```

Luego podemos sintetizar:

```
$ cdk synth
```

Generará la siguiente plantilla de CloudFormation:

```yaml
Resources:
  CdkworkshopQueue18864164:
    Type: AWS::SQS::Queue
    Properties:
      VisibilityTimeout: 300
    Metadata:
      aws:cdk:path: cdkworkshop/CdkworkshopQueue/Resource
  CdkworkshopQueuePolicy78D5BF45:
    Type: AWS::SQS::QueuePolicy
    Properties:
      PolicyDocument:
        Statement:
          - Action: sqs:SendMessage
            Condition:
              ArnEquals:
                aws:SourceArn:
                  Ref: CdkworkshopTopic58CFDD3D
            Effect: Allow
            Principal:
              Service: sns.amazonaws.com
            Resource:
              Fn::GetAtt:
                - CdkworkshopQueue18864164
                - Arn
        Version: "2012-10-17"
      Queues:
        - Ref: CdkworkshopQueue18864164
    Metadata:
      aws:cdk:path: cdkworkshop/CdkworkshopQueue/Policy/Resource
  CdkworkshopQueuecdkworkshopCdkworkshopTopic7642CC2FCF70B637:
    Type: AWS::SNS::Subscription
    Properties:
      Protocol: sqs
      TopicArn:
        Ref: CdkworkshopTopic58CFDD3D
      Endpoint:
        Fn::GetAtt:
          - CdkworkshopQueue18864164
          - Arn
    Metadata:
      aws:cdk:path: cdkworkshop/CdkworkshopQueue/cdkworkshopCdkworkshopTopic7642CC2F/Resource
  CdkworkshopTopic58CFDD3D:
    Type: AWS::SNS::Topic
    Metadata:
      aws:cdk:path: cdkworkshop/CdkworkshopTopic/Resource
  CDKMetadata:
    Type: AWS::CDK::Metadata
    Properties:
      Modules: aws-cdk=1.18.0,jsii-runtime=Python/3.7.3
```

Como puedes ver, esta plantilla incluye un montón de recursos:

- **AWS::SQS::Queue** - nuestra cola
- **AWS::SNS::Topic** - nuestro tema
- **AWS::SNS::Subscription** - la suscripción entre la cola y el tema
- **AWS::SQS::QueuePolicy** - la política de IAM que permite a este tema enviar mensajes a la cola

{{% notice info %}} El recurso **AWS: :CDK: :Metadata** se añade automáticamente
mediante el kit de herramientas a cada pila. El equipo de AWS CDK lo utiliza para realizar análisis y
para permitirnos identificar las versiones con problemas de seguridad. Consulte [Informe de versiones](https://docs.aws.amazon.com/cdk/latest/guide/tools.html) en consulte la Guía del usuario de AWS CDK para obtener más información. Omitiremos el recurso de metadatos en
vistas diferenciales para el resto de este taller {{% /notice %}}
