+++
title = "cdk synth"
weight = 400
+++

## CDK アプリケーションからテンプレートを合成する

AWS CDK アプリケーションは、事実上、コードを使用したインフラストラクチャの __定義__ にすぎません。CDK アプリケーションが実行されると、アプリケーションで定義されたスタックごとに AWS CloudFormation テンプレートが生成（ CDK 用語では「 __合成__ 」）されます。

CDK アプリを合成するには、`cdk synth` コマンドを使用します。サンプルアプリから合成されたテンプレートを確認してみましょう。


{{% notice info %}} 
**CDK CLI** は `cdk.json` ファイルが配置されているプロジェクトのルートディレクトリで実行する必要があります。ディレクトリを移動している場合はプロジェクトのルートディレクトリに戻ってから CDK コマンドを実行してください。
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

ご覧のとおり、このテンプレートにはたくさんのリソースが含まれています。

- **AWS::SQS::Queue** - SQS キュー
- **AWS::SNS::Topic** - SNS トピック
- **AWS::SNS::Subscription** - キューとトピックの間のサブスクリプション
- **AWS::SQS::QueuePolicy** - トピックがキューにメッセージを送信することを許可する IAM ポリシー

{{% notice info %}} 
**AWS::CDK::Metadata** リソースは、ツールキットによってすべてのスタックに自動的に追加されます。セキュリティ上の問題があるバージョンを特定できるようAWS CDK チームが分析に使用します。詳細については、AWS CDK ユーザーガイドの [バージョンレポート](https://docs.aws.amazon.com/cdk/latest/guide/tools.html) を参照してください。以降、このワークショップではメタデータリソースを省略します。
{{% /notice %}}