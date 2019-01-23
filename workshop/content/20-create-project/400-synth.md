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

```console
cdk synth
```

Will output the following CloudFormation template:

```yaml
Resources:
    CdkWorkshopQueue50D9D426:
        Type: 'AWS::SQS::Queue'
        Properties:
            VisibilityTimeout: 300
    CdkWorkshopQueuePolicyAF2494A5:
        Type: 'AWS::SQS::QueuePolicy'
        Properties:
            PolicyDocument:
                Statement:
                    -
                        Action: 'sqs:SendMessage'
                        Condition:
                            ArnEquals:
                                'aws:SourceArn':
                                    Ref: CdkWorkshopTopicD368A42F
                        Effect: Allow
                        Principal:
                            Service: sns.amazonaws.com
                        Resource:
                            'Fn::GetAtt':
                                - CdkWorkshopQueue50D9D426
                                - Arn
                Version: '2012-10-17'
            Queues:
                -
                    Ref: CdkWorkshopQueue50D9D426
    CdkWorkshopTopicD368A42F:
        Type: 'AWS::SNS::Topic'
    CdkWorkshopTopicCdkWorkshopQueueSubscription88D211C7:
        Type: 'AWS::SNS::Subscription'
        Properties:
            Endpoint:
                'Fn::GetAtt':
                    - CdkWorkshopQueue50D9D426
                    - Arn
            Protocol: sqs
            TopicArn:
                Ref: CdkWorkshopTopicD368A42F
    CDKMetadata:
        Type: 'AWS::CDK::Metadata'
        Properties:
            Modules: >-
                @aws-cdk/aws-cloudwatch=0.13.0,@aws-cdk/aws-iam=0.13.0,@aws-cdk/aws-kms=0.13.0,@aws-cdk/aws-s3-notifications=0.13.0,@aws-cdk/aws-sns=0.13.0,@aws-cdk/aws-sqs=0.13.0,@aws-cdk/cdk=0.13.0,@aws-cdk/cx-api=0.13.0,cdk-workshop=0.1.0
```

As you can see, this template includes four resources:

- **AWS::SQS::Queue** - our queue
- **AWS::SNS::Topic** - our topic
- **AWS::SNS::Subscription** - the subscription between the queue and the topic
- **AWS::SQS::QueuePolicy** - the IAM policy which allows this topic to send messages to the queue

{{% notice info %}} The **AWS::CDK::Metadata** resource is automatically added
by the toolkit to every stack. It is used by the AWS CDK team for analytics and
to allow us to identify versions with security issues. See [Version
Reporting](https://awslabs.github.io/aws-cdk/tools.html#version-reporting) in
the AWS CDK User Guide for more details. We will omit the metadata resource in
diff views for the rest of this workshop {{% /notice %}}

