+++
title = "cdk synth"
weight = 400
+++

## CDK アプリケーションからテンプレートを合成する

AWS CDK アプリケーションは、事実上、コードを使用したインフラストラクチャの __定義__ にすぎません。CDK アプリケーションが実行されると、アプリケーションで定義されたスタックごとに AWS CloudFormation テンプレートが生成（ CDK 用語では「 __合成__ 」）されます。

CDK アプリを合成するには、`cdk synth` コマンドを使用します。サンプルアプリから合成されたテンプレートを確認してみましょう。


{{% notice info %}} 
**CDK CLI** は cdk.json ファイルが配置されているプロジェクトのルートディレクトリで実行する必要があります。ディレクトリを移動している場合はプロジェクトのルートディレクトリに戻ってから CDK コマンドを実行してください。
{{% /notice %}}

```
cdk synth
```

すると、次の CloudFormation テンプレートが出力されます。

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
    Metadata:
      aws:cdk:path: CdkWorkshopStack/CdkWorkshopTopic/Resource
  CDKMetadata:
    Type: AWS::CDK::Metadata
    Properties:
      Modules: aws-cdk=1.21.1,@aws-cdk/aws-cloudwatch=1.21.1,@aws-cdk/aws-iam=1.21.1,@aws-cdk/aws-kms=1.21.1,@aws-cdk/aws-sns=1.21.1,@aws-cdk/aws-sns-subscriptions=1.21.1,@aws-cdk/aws-sqs=1.21.1,@aws-cdk/core=1.21.1,@aws-cdk/cx-api=1.21.1,@aws-cdk/region-info=1.21.1,jsii-runtime=node.js/v13.6.0
    Condition: CDKMetadataAvailable
Conditions:
  CDKMetadataAvailable:
    Fn::Or:
      - Fn::Or:
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
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-central-1
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-north-1
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
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-2
```

ご覧のとおり、このテンプレートにはたくさんのリソースが含まれています。

- **AWS::SQS::Queue** - SQS キュー
- **AWS::SNS::Topic** - SNS トピック
- **AWS::SNS::Subscription** - キューとトピックの間のサブスクリプション
- **AWS::SQS::QueuePolicy** - トピックがキューにメッセージを送信することを許可する IAM ポリシー

{{% notice info %}} 
**AWS::CDK::Metadata** リソースは、ツールキットによってすべてのスタックに自動的に追加されます。セキュリティ上の問題があるバージョンを特定できるようAWS CDK チームが分析に使用します。詳細については、AWS CDK ユーザーガイドの [バージョンレポート](https://docs.aws.amazon.com/cdk/latest/guide/tools.html) を参照してください。以降、このワークショップではメタデータリソースを省略します。
{{% /notice %}}

