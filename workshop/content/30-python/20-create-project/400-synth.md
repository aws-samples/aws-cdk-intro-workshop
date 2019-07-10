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

```console
$ cdk ls
hello-cdk-1
hello-cdk-2
$
```

We can then synthesize one of the stacks:

```console
$ cdk synth hello-cdk-1
```

Will output the following CloudFormation template:

```yaml
Resources:
  MyFirstQueueFF09316A:
    Type: AWS::SQS::Queue
    Properties:
      VisibilityTimeout: 300
    Metadata:
      aws:cdk:path: hello-cdk-1/MyFirstQueue/Resource
  MyFirstQueuePolicy596EEC78:
    Type: AWS::SQS::QueuePolicy
    Properties:
      PolicyDocument:
        Statement:
          - Action: sqs:SendMessage
            Condition:
              ArnEquals:
                aws:SourceArn:
                  Ref: MyFirstTopic0ED1F8A4
            Effect: Allow
            Principal:
              Service: sns.amazonaws.com
            Resource:
              Fn::GetAtt:
                - MyFirstQueueFF09316A
                - Arn
        Version: "2012-10-17"
      Queues:
        - Ref: MyFirstQueueFF09316A
    Metadata:
      aws:cdk:path: hello-cdk-1/MyFirstQueue/Policy/Resource
  MyFirstQueuehellocdk1MyFirstTopicB252874C505090E8:
    Type: AWS::SNS::Subscription
    Properties:
      Protocol: sqs
      TopicArn:
        Ref: MyFirstTopic0ED1F8A4
      Endpoint:
        Fn::GetAtt:
          - MyFirstQueueFF09316A
          - Arn
    Metadata:
      aws:cdk:path: hello-cdk-1/MyFirstQueue/hellocdk1MyFirstTopicB252874C/Resource
  MyFirstTopic0ED1F8A4:
    Type: AWS::SNS::Topic
    Properties:
      DisplayName: My First Topic
    Metadata:
      aws:cdk:path: hello-cdk-1/MyFirstTopic/Resource
  MyHelloConstructBucket0DAEC57E1:
    Type: AWS::S3::Bucket
    UpdateReplacePolicy: Retain
    DeletionPolicy: Retain
    Metadata:
      aws:cdk:path: hello-cdk-1/MyHelloConstruct/Bucket-0/Resource
  MyHelloConstructBucket18D9883BE:
    Type: AWS::S3::Bucket
    UpdateReplacePolicy: Retain
    DeletionPolicy: Retain
    Metadata:
      aws:cdk:path: hello-cdk-1/MyHelloConstruct/Bucket-1/Resource
  MyHelloConstructBucket2C1DA3656:
    Type: AWS::S3::Bucket
    UpdateReplacePolicy: Retain
    DeletionPolicy: Retain
    Metadata:
      aws:cdk:path: hello-cdk-1/MyHelloConstruct/Bucket-2/Resource
  MyHelloConstructBucket398A5DE67:
    Type: AWS::S3::Bucket
    UpdateReplacePolicy: Retain
    DeletionPolicy: Retain
    Metadata:
      aws:cdk:path: hello-cdk-1/MyHelloConstruct/Bucket-3/Resource
  MyUserDC45028B:
    Type: AWS::IAM::User
    Metadata:
      aws:cdk:path: hello-cdk-1/MyUser/Resource
  MyUserDefaultPolicy7B897426:
    Type: AWS::IAM::Policy
    Properties:
      PolicyDocument:
        Statement:
          - Action:
              - s3:GetObject*
              - s3:GetBucket*
              - s3:List*
            Effect: Allow
            Resource:
              - Fn::GetAtt:
                  - MyHelloConstructBucket0DAEC57E1
                  - Arn
              - Fn::Join:
                  - ""
                  - - Fn::GetAtt:
                        - MyHelloConstructBucket0DAEC57E1
                        - Arn
                    - /*
          - Action:
              - s3:GetObject*
              - s3:GetBucket*
              - s3:List*
            Effect: Allow
            Resource:
              - Fn::GetAtt:
                  - MyHelloConstructBucket18D9883BE
                  - Arn
              - Fn::Join:
                  - ""
                  - - Fn::GetAtt:
                        - MyHelloConstructBucket18D9883BE
                        - Arn
                    - /*
          - Action:
              - s3:GetObject*
              - s3:GetBucket*
              - s3:List*
            Effect: Allow
            Resource:
              - Fn::GetAtt:
                  - MyHelloConstructBucket2C1DA3656
                  - Arn
              - Fn::Join:
                  - ""
                  - - Fn::GetAtt:
                        - MyHelloConstructBucket2C1DA3656
                        - Arn
                    - /*
          - Action:
              - s3:GetObject*
              - s3:GetBucket*
              - s3:List*
            Effect: Allow
            Resource:
              - Fn::GetAtt:
                  - MyHelloConstructBucket398A5DE67
                  - Arn
              - Fn::Join:
                  - ""
                  - - Fn::GetAtt:
                        - MyHelloConstructBucket398A5DE67
                        - Arn
                    - /*
        Version: "2012-10-17"
      PolicyName: MyUserDefaultPolicy7B897426
      Users:
        - Ref: MyUserDC45028B
    Metadata:
      aws:cdk:path: hello-cdk-1/MyUser/DefaultPolicy/Resource
  CDKMetadata:
    Type: AWS::CDK::Metadata
    Properties:
      Modules: aws-cdk=0.39.0,@aws-cdk/assets=0.39.0,@aws-cdk/aws-cloudwatch=0.39.0,@aws-cdk/aws-ec2=0.39.0,@aws-cdk/aws-events=0.39.0,@aws-cdk/aws-iam=0.39.0,@aws-cdk/aws-kms=0.39.0,@aws-cdk/aws-lambda=0.39.0,@aws-cdk/aws-logs=0.39.0,@aws-cdk/aws-s3=0.39.0,@aws-cdk/aws-s3-assets=0.39.0,@aws-cdk/aws-sns=0.39.0,@aws-cdk/aws-sns-subscriptions=0.39.0,@aws-cdk/aws-sqs=0.39.0,@aws-cdk/aws-ssm=0.39.0,@aws-cdk/core=0.39.0,@aws-cdk/cx-api=0.39.0,@aws-cdk/region-info=0.39.0,jsii-runtime=Python/3.7.0
```

As you can see, this template includes a bunch of resources:

- **AWS::SQS::Queue** - our queue
- **AWS::SNS::Topic** - our topic
- **AWS::SNS::Subscription** - the subscription between the queue and the topic
- **AWS::SQS::QueuePolicy** - the IAM policy which allows this topic to send
messages to the queue
- **AWS::S3::Bucket** - four S3 buckets
- **AWS::IAM::User** - an IAM user
- Various IAM policies to grant the right permissions to all of the resources.

{{% notice info %}} The **AWS::CDK::Metadata** resource is automatically added
by the toolkit to every stack. It is used by the AWS CDK team for analytics and
to allow us to identify versions with security issues. See [Version Reporting](https://docs.aws.amazon.com/cdk/latest/guide/tools.html) in
the AWS CDK User Guide for more details. We will omit the metadata resource in
diff views for the rest of this workshop {{% /notice %}}

