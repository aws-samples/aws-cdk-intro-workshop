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
    UpdateReplacePolicy: Delete
    DeletionPolicy: Delete
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
    Metadata:
      aws:cdk:path: CdkWorkshopStack/CdkWorkshopTopic/Resource
  CDKMetadata:
    Type: AWS::CDK::Metadata
    Properties:
      Analytics: v2:deflate64:H4sIAAAAAAAA/1WNQQ7CIBBFz9I9pVaNxnUvYFv3hgKasS1UBtIYwt0tkJi4mf//y0tmTw9nuivYiiUXYznBQH1vGR/Jhu4e30h966STpHmoXNK96gn45wfzDATV5vduQG5gsaBVNP72TS/AI00lhFg7idoZnn40WgmIZiBPXdP6UglmVlAVm8XpWLwQoDROWZgl7XJ+AUvgOkvEAAAA
    Metadata:
      aws:cdk:path: CdkWorkshopStack/CDKMetadata/Default
    Condition: CDKMetadataAvailable
Conditions:
  CDKMetadataAvailable:
    Fn::Or:
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - af-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ca-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-northwest-1
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-2
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-3
          - Fn::Equals:
              - Ref: AWS::Region
              - me-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - sa-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-2
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-2
Parameters:
  BootstrapVersion:
    Type: AWS::SSM::Parameter::Value<String>
    Default: /cdk-bootstrap/hnb659fds/version
    Description: Version of the CDK Bootstrap resources in this environment, automatically retrieved from SSM Parameter Store. [cdk:skip]
Rules:
  CheckBootstrapVersion:
    Assertions:
      - Assert:
          Fn::Not:
            - Fn::Contains:
                - - "1"
                  - "2"
                  - "3"
                  - "4"
                  - "5"
                - Ref: BootstrapVersion
        AssertDescription: CDK bootstrap stack version 6 required. Please run 'cdk bootstrap' with a recent version of the CDK CLI.
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



