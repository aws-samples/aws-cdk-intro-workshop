+++
title = "cdk deploy"
weight = 500
+++

Okay, we've got a CloudFormation template. What's next? __Let's deploy it into our account!__

## Bootstrapping an environment

The first time you deploy an AWS CDK app into an environment (account/region),
you'll need to install a "bootstrap stack". This stack includes resources that
are needed for the toolkit's operation. For example, the stack includes an S3
bucket that is used to store templates and assets during the deployment process.

You can use the `cdk bootstrap` command to install the bootstrap stack into an
environment:

```
cdk bootstrap
```

Then:

```
 ⏳  Bootstrapping environment 999999999999/us-east-1...
...
```

Hopefully this command finished successfully and we can move on to deploy our app.

## Let's deploy

Use `cdk deploy` to deploy a CDK app:

```
cdk deploy hello-cdk-1
```

You should see a warning like the following:

```
This deployment will make potentially sensitive changes according to your current security approval level (--require-approval broadening).
Please confirm you intend to make the following modifications:

IAM Statement Changes
┌───┬────────────────────┬────────┬────────────────────┬────────────────────┬───────────────────────┐
│   │ Resource           │ Effect │ Action             │ Principal          │ Condition             │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ + │ ${MyFirstQueue.Arn │ Allow  │ sqs:SendMessage    │ Service:sns.amazon │ "ArnEquals": {        │
│   │ }                  │        │                    │ aws.com            │   "aws:SourceArn": "$ │
│   │                    │        │                    │                    │ {MyFirstTopic}"       │
│   │                    │        │                    │                    │ }                     │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ + │ ${MyHelloConstruct │ Allow  │ s3:GetBucket*      │ AWS:${MyUser}      │                       │
│   │ /Bucket-0.Arn}     │        │ s3:GetObject*      │                    │                       │
│   │ ${MyHelloConstruct │        │ s3:List*           │                    │                       │
│   │ /Bucket-0.Arn}/*   │        │                    │                    │                       │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ + │ ${MyHelloConstruct │ Allow  │ s3:GetBucket*      │ AWS:${MyUser}      │                       │
│   │ /Bucket-1.Arn}     │        │ s3:GetObject*      │                    │                       │
│   │ ${MyHelloConstruct │        │ s3:List*           │                    │                       │
│   │ /Bucket-1.Arn}/*   │        │                    │                    │                       │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ + │ ${MyHelloConstruct │ Allow  │ s3:GetBucket*      │ AWS:${MyUser}      │                       │
│   │ /Bucket-2.Arn}     │        │ s3:GetObject*      │                    │                       │
│   │ ${MyHelloConstruct │        │ s3:List*           │                    │                       │
│   │ /Bucket-2.Arn}/*   │        │                    │                    │                       │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ + │ ${MyHelloConstruct │ Allow  │ s3:GetBucket*      │ AWS:${MyUser}      │                       │
│   │ /Bucket-3.Arn}     │        │ s3:GetObject*      │                    │                       │
│   │ ${MyHelloConstruct │        │ s3:List*           │                    │                       │
│   │ /Bucket-3.Arn}/*   │        │                    │                    │                       │
└───┴────────────────────┴────────┴────────────────────┴────────────────────┴───────────────────────┘
(NOTE: There may be security-related changes not in this list. See http://bit.ly/cdk-2EhF7Np)

Do you wish to deploy these changes (y/n)? 
```

This is warning you that deploying the app entails some risk.  Since we need to
allow the topic to send messages to the queue and we are also creating an IAM
User and granting access to the new Buckets, enter **y** to deploy the stack
and create the resources.

Output should look like the following, where ACCOUNT-ID is your account ID, REGION is the region in which you created the app,
and STACK-ID is the unique identifier for your stack:

```
  0/12 | 6:30:36 AM | CREATE_IN_PROGRESS   | AWS::CloudFormation::Stack | hello-cdk-1 User Initiated
  0/12 | 6:30:40 AM | CREATE_IN_PROGRESS   | AWS::S3::Bucket        | MyHelloConstruct/Bucket-3 (MyHelloConstructBucket398A5DE67) 
  0/12 | 6:30:40 AM | CREATE_IN_PROGRESS   | AWS::S3::Bucket        | MyHelloConstruct/Bucket-0 (MyHelloConstructBucket0DAEC57E1) 
  0/12 | 6:30:40 AM | CREATE_IN_PROGRESS   | AWS::SQS::Queue        | MyFirstQueue (MyFirstQueueFF09316A) 
  0/12 | 6:30:40 AM | CREATE_IN_PROGRESS   | AWS::S3::Bucket        | MyHelloConstruct/Bucket-1 (MyHelloConstructBucket18D9883BE) 
  0/12 | 6:30:40 AM | CREATE_IN_PROGRESS   | AWS::IAM::User         | MyUser (MyUserDC45028B) 
  0/12 | 6:30:40 AM | CREATE_IN_PROGRESS   | AWS::S3::Bucket        | MyHelloConstruct/Bucket-2 (MyHelloConstructBucket2C1DA3656) 
  0/12 | 6:30:40 AM | CREATE_IN_PROGRESS   | AWS::SNS::Topic        | MyFirstTopic (MyFirstTopic0ED1F8A4) 
  0/12 | 6:30:40 AM | CREATE_IN_PROGRESS   | AWS::CDK::Metadata     | CDKMetadata 
  0/12 | 6:30:40 AM | CREATE_IN_PROGRESS   | AWS::IAM::User         | MyUser (MyUserDC45028B) Resource creation Initiated
  0/12 | 6:30:40 AM | CREATE_IN_PROGRESS   | AWS::SQS::Queue        | MyFirstQueue (MyFirstQueueFF09316A) Resource creation Initiated
  0/12 | 6:30:41 AM | CREATE_IN_PROGRESS   | AWS::SNS::Topic        | MyFirstTopic (MyFirstTopic0ED1F8A4) Resource creation Initiated
  0/12 | 6:30:41 AM | CREATE_IN_PROGRESS   | AWS::S3::Bucket        | MyHelloConstruct/Bucket-3 (MyHelloConstructBucket398A5DE67) Resource creation Initiated
  1/12 | 6:30:41 AM | CREATE_COMPLETE      | AWS::SQS::Queue        | MyFirstQueue (MyFirstQueueFF09316A) 
  1/12 | 6:30:41 AM | CREATE_IN_PROGRESS   | AWS::S3::Bucket        | MyHelloConstruct/Bucket-1 (MyHelloConstructBucket18D9883BE) Resource creation Initiated
  1/12 | 6:30:41 AM | CREATE_IN_PROGRESS   | AWS::S3::Bucket        | MyHelloConstruct/Bucket-2 (MyHelloConstructBucket2C1DA3656) Resource creation Initiated
  1/12 | 6:30:41 AM | CREATE_IN_PROGRESS   | AWS::S3::Bucket        | MyHelloConstruct/Bucket-0 (MyHelloConstructBucket0DAEC57E1) Resource creation Initiated
  1/12 | 6:30:43 AM | CREATE_IN_PROGRESS   | AWS::CDK::Metadata     | CDKMetadata Resource creation Initiated
  2/12 | 6:30:43 AM | CREATE_COMPLETE      | AWS::CDK::Metadata     | CDKMetadata 
  3/12 | 6:30:51 AM | CREATE_COMPLETE      | AWS::SNS::Topic        | MyFirstTopic (MyFirstTopic0ED1F8A4) 
  3/12 | 6:30:53 AM | CREATE_IN_PROGRESS   | AWS::SQS::QueuePolicy  | MyFirstQueue/Policy (MyFirstQueuePolicy596EEC78) 
  3/12 | 6:30:53 AM | CREATE_IN_PROGRESS   | AWS::SNS::Subscription | MyFirstQueue/hellocdk1MyFirstTopicB252874C (MyFirstQueuehellocdk1MyFirstTopicB252874C505090E8) 
  3/12 | 6:30:54 AM | CREATE_IN_PROGRESS   | AWS::SQS::QueuePolicy  | MyFirstQueue/Policy (MyFirstQueuePolicy596EEC78) Resource creation Initiated
  4/12 | 6:30:54 AM | CREATE_COMPLETE      | AWS::SQS::QueuePolicy  | MyFirstQueue/Policy (MyFirstQueuePolicy596EEC78) 
  4/12 | 6:30:54 AM | CREATE_IN_PROGRESS   | AWS::SNS::Subscription | MyFirstQueue/hellocdk1MyFirstTopicB252874C (MyFirstQueuehellocdk1MyFirstTopicB252874C505090E8) Resource creation Initiated
  5/12 | 6:30:54 AM | CREATE_COMPLETE      | AWS::SNS::Subscription | MyFirstQueue/hellocdk1MyFirstTopicB252874C (MyFirstQueuehellocdk1MyFirstTopicB252874C505090E8) 
  6/12 | 6:31:01 AM | CREATE_COMPLETE      | AWS::S3::Bucket        | MyHelloConstruct/Bucket-3 (MyHelloConstructBucket398A5DE67) 
  7/12 | 6:31:01 AM | CREATE_COMPLETE      | AWS::S3::Bucket        | MyHelloConstruct/Bucket-1 (MyHelloConstructBucket18D9883BE) 
  8/12 | 6:31:01 AM | CREATE_COMPLETE      | AWS::S3::Bucket        | MyHelloConstruct/Bucket-2 (MyHelloConstructBucket2C1DA3656) 
  9/12 | 6:31:01 AM | CREATE_COMPLETE      | AWS::S3::Bucket        | MyHelloConstruct/Bucket-0 (MyHelloConstructBucket0DAEC57E1) 
 10/12 | 6:31:16 AM | CREATE_COMPLETE      | AWS::IAM::User         | MyUser (MyUserDC45028B) 
 10/12 | 6:31:18 AM | CREATE_IN_PROGRESS   | AWS::IAM::Policy       | MyUser/DefaultPolicy (MyUserDefaultPolicy7B897426) 
 10/12 | 6:31:19 AM | CREATE_IN_PROGRESS   | AWS::IAM::Policy       | MyUser/DefaultPolicy (MyUserDefaultPolicy7B897426) Resource creation Initiated
 11/12 | 6:31:26 AM | CREATE_COMPLETE      | AWS::IAM::Policy       | MyUser/DefaultPolicy (MyUserDefaultPolicy7B897426) 
 12/12 | 6:31:28 AM | CREATE_COMPLETE      | AWS::CloudFormation::Stack | hello-cdk-1 

 ✅  hello-cdk-1

Stack ARN:
arn:aws:cloudformation:us-east-2:198874812771:stack/hello-cdk-1/e2ee3220-a316-11e9-899b-02278d0d93fc
```

## The CloudFormation Console

CDK apps are deployed through AWS CloudFormation. Each CDK stack maps 1:1 with
CloudFormation stack.

This means that you can use the AWS CloudFormation console in order to manage
your stacks.

Let's take a look at the [AWS CloudFormation
console](https://console.aws.amazon.com/cloudformation/home).

You will likely see something like this (if you don't, make sure you are in the correct region):

![](./cfn1.png)

If you select `hello-cdk-1` and open the __Resources__ tab, you will see the
physical identities of our resources:

![](./cfn2.png)

# I am ready for some actual coding!
