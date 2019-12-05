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
template synthesized from the sample app.  Because our app includes two stacks
we need to tell the ``cdk synth`` command which stack we want to synthesize.
You can get a list of available stacks:

{{% notice info %}} The **CDK CLI** requires you to be in the same directory 
as your `cdk.json` file. If you have changed directories in your terminal, 
please navigate back now.{{% /notice %}}

```
$ cdk ls
cdkworkshop
$
```

We can then synthesize one of the stacks:

```
$ cdk synth
```

This will output the following CloudFormation template:

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

As you can see, this template includes a bunch of resources:

- **AWS::SQS::Queue** - our queue
- **AWS::SNS::Topic** - our topic
- **AWS::SNS::Subscription** - the subscription between the queue and the topic
- **AWS::SQS::QueuePolicy** - the IAM policy which allows this topic to send
messages to the queue

{{% notice info %}} The **AWS::CDK::Metadata** resource is automatically added
by the toolkit to every stack. It is used by the AWS CDK team for analytics and
to allow us to identify versions with security issues. See [Version Reporting](https://docs.aws.amazon.com/cdk/latest/guide/tools.html) in
the AWS CDK User Guide for more details. We will omit the metadata resource in
diff views for the rest of this workshop {{% /notice %}}

