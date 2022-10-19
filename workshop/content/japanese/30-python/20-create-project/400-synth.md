+++
title = "cdk synth"
weight = 400
+++

## CDK アプリケーションからテンプレートを合成する

AWS CDK アプリケーションは、事実上、コードを使用したインフラストラクチャの __定義__ にすぎません。CDK アプリケーションが実行されると、アプリケーションで定義されたスタックごとに AWS CloudFormation テンプレートが生成（ CDK 用語では「 __合成__ 」）されます。

CDK アプリを合成するには、`cdk synth` コマンドを使用します。サンプルアプリから合成されたテンプレートを確認してみましょう。

{{% notice info %}} **CDK CLI** は、`cdk.json` ファイルと同じディレクトリで実行してください。ターミナルでディレクトリを変更した場合は、同じディレクトリに戻ってください。{{% /notice %}}

```
$ cdk ls
cdk_workshop
$ cd cdk_workshop
```

`cdk synth` コマンドを使用して合成します。

```
$ cdk synth
```

すると、次の CloudFormation テンプレートが出力されます。

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

ご覧のとおり、このテンプレートにはたくさんのリソースが含まれています。

- **AWS::SQS::Queue** - SQS キュー
- **AWS::SNS::Topic** - SNS トピック
- **AWS::SNS::Subscription** - キューとトピックの間のサブスクリプション
- **AWS::SQS::QueuePolicy** - トピックがキューにメッセージを送信することを許可する IAM ポリシー

{{% notice info %}}

**AWS::CDK::Metadata** リソースは、ツールキットによってすべてのスタックに自動的に追加されます。セキュリティ上の問題があるバージョンを特定できるようAWS CDK チームが分析に使用します。詳細については、AWS CDK ユーザーガイドの [バージョンレポート](https://docs.aws.amazon.com/cdk/latest/guide/tools.html) を参照してください。以降、このワークショップではメタデータリソースを省略します。

{{% /notice %}}
