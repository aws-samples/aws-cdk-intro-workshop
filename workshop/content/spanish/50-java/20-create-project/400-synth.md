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
cdk synth
```

Generará la siguiente plantilla de CloudFormation:

```yaml
Resources:
  CdkWorkshopQueue50D9D426:
    Type: AWS::SQS::Queue
    Properties:
      VisibilityTimeout: 300
    Metadata:
      aws:cdk:path: CdkWorkshopStack/CdkWorkshopQueue/Resource
  CdkWorkshopQueuePolicyAF2494A5:
    Type: AWS::SQS::QueuePolicy
    Properties:
      PolicyDocument:
        Statement:
          - Action: sqs:SendMessage
            Condition:
              ArnEquals:
                aws:SourceArn:
                  Ref: CdkWorkshopTopicD368A42F
            Effect: Allow
            Principal:
              Service: sns.amazonaws.com
            Resource:
              Fn::GetAtt:
                - CdkWorkshopQueue50D9D426
                - Arn
        Version: "2012-10-17"
      Queues:
        - Ref: CdkWorkshopQueue50D9D426
    Metadata:
      aws:cdk:path: CdkWorkshopStack/CdkWorkshopQueue/Policy/Resource
  CdkWorkshopQueueCdkWorkshopStackCdkWorkshopTopicD7BE96438B5AD106:
    Type: AWS::SNS::Subscription
    Properties:
      Protocol: sqs
      TopicArn:
        Ref: CdkWorkshopTopicD368A42F
      Endpoint:
        Fn::GetAtt:
          - CdkWorkshopQueue50D9D426
          - Arn
    Metadata:
      aws:cdk:path: CdkWorkshopStack/CdkWorkshopQueue/CdkWorkshopStackCdkWorkshopTopicD7BE9643/Resource
  CdkWorkshopTopicD368A42F:
    Type: AWS::SNS::Topic
    Properties:
      DisplayName: My First Topic Yeah
    Metadata:
      aws:cdk:path: CdkWorkshopStack/CdkWorkshopTopic/Resource
  CDKMetadata:
    Type: AWS::CDK::Metadata
    Properties:
      Modules: aws-cdk=1.17.1,@aws-cdk/assets=1.17.1,@aws-cdk/aws-cloudwatch=1.17.1,@aws-cdk/aws-ec2=1.17.1,@aws-cdk/aws-events=1.17.1,@aws-cdk/aws-iam=1.17.1,@aws-cdk/aws-kms=1.17.1,@aws-cdk/aws-lambda=1.17.1,@aws-cdk/aws-logs=1.17.1,@aws-cdk/aws-s3=1.17.1,@aws-cdk/aws-s3-assets=1.17.1,@aws-cdk/aws-sns=1.17.1,@aws-cdk/aws-sns-subscriptions=1.17.1,@aws-cdk/aws-sqs=1.17.1,@aws-cdk/aws-ssm=1.17.1,@aws-cdk/core=1.17.1,@aws-cdk/cx-api=1.17.1,@aws-cdk/region-info=1.17.1,jsii-runtime=Java/1.8.0_202
    Condition: CDKMetadataAvailable
Conditions:
  CDKMetadataAvailable:
...
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
