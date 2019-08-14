+++
title = "Cleanup sample"
weight = 100
+++

## Delete the sample code from your stack

The project created by `cdk init sample-app` includes an SQS queue, and an SNS topic. We're
not going to use them in our project, so remove them from your the
`CdkWorkshopStack` constructor.

Open `lib/cdk-workshop-stack.ts` and clean it up. Eventually it should look like this:

```ts
import cdk = require('@aws-cdk/core');

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // nothing here!
  }
}
```

## cdk diff

Now, that we modified our stack's contents, we can ask the toolkit to show us
what will happen if we run `cdk deploy` (the difference between our CDK app and
what's currently deployed):

```
cdk diff
```

Output should look like the following:

```
IAM Statement Changes
┌───┬─────────────────────────────────┬────────┬─────────────────┬───────────────────────────┬──────────────────────────────────────────────────┐
│   │ Resource                        │ Effect │ Action          │ Principal                 │ Condition                                        │
├───┼─────────────────────────────────┼────────┼─────────────────┼───────────────────────────┼──────────────────────────────────────────────────┤
│ - │ ${CdkWorkshopQueue50D9D426.Arn} │ Allow  │ sqs:SendMessage │ Service:sns.amazonaws.com │ "ArnEquals": {                                   │
│   │                                 │        │                 │                           │   "aws:SourceArn": "${CdkWorkshopTopicD368A42F}" │
│   │                                 │        │                 │                           │ }                                                │
└───┴─────────────────────────────────┴────────┴─────────────────┴───────────────────────────┴──────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See http://bit.ly/cdk-2EhF7Np)

Resources
[-] AWS::SQS::Queue CdkWorkshopQueue50D9D426 destroy
[-] AWS::SQS::QueuePolicy CdkWorkshopQueuePolicyAF2494A5 destroy
[-] AWS::SNS::Topic CdkWorkshopTopicD368A42F destroy
[-] AWS::SNS::Subscription CdkWorkshopTopicCdkWorkshopQueueSubscription88D211C7 destroy
```

As expected, all of our resources are going to be brutally destroyed.

## cdk deploy

Run `cdk deploy` and __proceed to the next section__ (no need to wait):

```
cdk deploy
```

You should see the resources being deleted.
