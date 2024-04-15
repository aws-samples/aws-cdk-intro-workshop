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
      Modules: aws-cdk=1.17.1,@aws-cdk/assets=1.17.1,@aws-cdk/aws-cloudwatch=1.17.1,@aws-cdk/aws-ec2=1.17.1,@aws-cdk/aws-events=1.17.1,@aws-cdk/aws-iam=1.17.1,@aws-cdk/aws-kms=1.17.1,@aws-cdk/aws-lambda=1.17.1,@aws-cdk/aws-logs=1.17.1,@aws-cdk/aws-s3=1.17.1,@aws-cdk/aws-s3-assets=1.17.1,@aws-cdk/aws-sns=1.17.1,@aws-cdk/aws-sns-subscriptions=1.17.1,@aws-cdk/aws-sqs=1.17.1,@aws-cdk/aws-ssm=1.17.1,@aws-cdk/core=1.17.1,@aws-cdk/cx-api=1.17.1,@aws-cdk/region-info=1.17.1,jsii-runtime=DotNet/3.0.0/.NETCoreApp,Version=v3.0/1.0.0.0
    Condition: CDKMetadataAvailable
Conditions:
  CDKMetadataAvailable:
    ...
...
```

As you can see, this template includes four resources:

- **AWS::SQS::Queue** - our queue
- **AWS::SQS::QueuePolicy** - the IAM policy which allows this topic to send messages to the queue
- **AWS::SNS::Subscription** - the subscription between the queue and the topic
- **AWS::SNS::Topic** - our topic

{{% notice info %}} The **AWS::CDK::Metadata** resource is automatically added
by the toolkit to every stack. It is used by the AWS CDK team for analytics and
to allow us to identify versions with security issues. See [Version Reporting](https://docs.aws.amazon.com/cdk/latest/guide/tools.html) in
the AWS CDK User Guide for more details. We will omit the metadata resource in
diff views for the rest of this workshop {{% /notice %}}


{{< nextprevlinks >}}