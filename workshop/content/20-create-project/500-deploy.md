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

```s
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

```s
cdk deploy
```

Output should look like this:

```
[0/6] CREATE_IN_PROGRESS  [AWS::CloudFormation::Stack] CdkWorkshopStack User Initiated
[0/6] CREATE_IN_PROGRESS  [AWS::SNS::Topic] CdkWorkshopTopicD368A42F
[0/6] CREATE_IN_PROGRESS  [AWS::SQS::Queue] CdkWorkshopQueue50D9D426
[0/6] CREATE_IN_PROGRESS  [AWS::CDK::Metadata] CDKMetadata
[0/6] CREATE_IN_PROGRESS  [AWS::SNS::Topic] CdkWorkshopTopicD368A42F Resource creation Initiated
[0/6] CREATE_IN_PROGRESS  [AWS::SQS::Queue] CdkWorkshopQueue50D9D426 Resource creation Initiated
[1/6] CREATE_COMPLETE     [AWS::SQS::Queue] CdkWorkshopQueue50D9D426
[1/6] CREATE_IN_PROGRESS  [AWS::CDK::Metadata] CDKMetadata Resource creation Initiated
[2/6] CREATE_COMPLETE     [AWS::CDK::Metadata] CDKMetadata
[3/6] CREATE_COMPLETE     [AWS::SNS::Topic] CdkWorkshopTopicD368A42F
[3/6] CREATE_IN_PROGRESS  [AWS::SNS::Subscription] CdkWorkshopTopicCdkWorkshopQueueSubscription88D211C7
[3/6] CREATE_IN_PROGRESS  [AWS::SQS::QueuePolicy] CdkWorkshopQueuePolicyAF2494A5
[3/6] CREATE_IN_PROGRESS  [AWS::SQS::QueuePolicy] CdkWorkshopQueuePolicyAF2494A5 Resource creation Initiated
[4/6] CREATE_COMPLETE     [AWS::SQS::QueuePolicy] CdkWorkshopQueuePolicyAF2494A5
[4/6] CREATE_IN_PROGRESS  [AWS::SNS::Subscription] CdkWorkshopTopicCdkWorkshopQueueSubscription88D211C7 Resource creation Initiated
[5/6] CREATE_COMPLETE     [AWS::SNS::Subscription] CdkWorkshopTopicCdkWorkshopQueueSubscription88D211C7
[6/6] CREATE_COMPLETE     [AWS::CloudFormation::Stack] CdkWorkshopStack
 ✅  Deployment of stack CdkWorkshopStack completed successfully
```

## The CloudFormation Console

CDK apps are deployed through AWS CloudFormation. Each CDK stack maps 1:1 with
CloudFormation stack.

This means that you can use the AWS CloudFormation console in order to manage
your stacks.

Let's take a look at the [AWS CloudFormation
console](https://console.aws.amazon.com/cloudformation/home).

You will likely see something like this:

![](./cfn1.png)

If you select `CdkWorkshopStack` and open the __Resources__ tab, you will see the
physical identities of our resources:

![](./cfn2.png)

# I am ready for some actual coding!
