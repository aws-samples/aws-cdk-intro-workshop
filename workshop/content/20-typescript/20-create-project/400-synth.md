+++
title = "cdk synth"
weight = 400
+++

## Synthesize a template from your app

AWS CDK apps are effectively only a __definition__ of your infrastructure using
code. When CDK apps are executed, they produce (or "__synthesize__", in CDK
parlance) an AWS CloudFormation template for each stack defined in your
application.

To synthesize a CDK app, use the `cdk synth` command. Let's check out the
template synthesized from the sample app:

{{% notice info %}} The **CDK CLI** requires you to be in the same directory 
as your `cdk.json` file. If you have changed directories in your terminal, 
please navigate back now.{{% /notice %}}

```
cdk synth
```

Will output the following CloudFormation template:

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

As you can see, this template includes four resources:

- **AWS::SQS::Queue** - our queue
- **AWS::SNS::Topic** - our topic
- **AWS::SNS::Subscription** - the subscription between the queue and the topic
- **AWS::SQS::QueuePolicy** - the IAM policy which allows this topic to send messages to the queue

{{% notice info %}} The **AWS::CDK::Metadata** resource is automatically added
by the toolkit to every stack. It is used by the AWS CDK team for analytics and
to allow us to identify versions with security issues. See [Version Reporting](https://docs.aws.amazon.com/cdk/latest/guide/tools.html) in
the AWS CDK User Guide for more details. We will omit the metadata resource in
diff views for the rest of this workshop {{% /notice %}}

