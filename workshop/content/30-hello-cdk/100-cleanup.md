+++
title = "Cleanup sample"
weight = 100
+++

## Delete the sample code from your stack

The project created by `cdk init` includes an SQS queue, and an SNS topic. We're
not going to use them in our project, so remove them from your the
`CdkWorkshopStack` constructor.

Open `bin/cdk-workshop.ts` and clean it up. Eventually it should look like this:

```ts
import cdk = require('@aws-cdk/cdk');

class CdkWorkshopStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
    super(parent, name, props);

    // nothing here!
  }
}

const app = new cdk.App();
new CdkWorkshopStack(app, 'CdkWorkshopStack');
app.run();
```

## cdk diff

Now, that we modified our stack's contents, we can ask the toolkit to show us
what will happen if we run `cdk deploy` (the difference between our CDK app and
what's currently deployed):

```s
cdk diff
```

Output should look like this:

```
[-] ☢️ Destroying CdkWorkshopQueue50D9D426 (type: AWS::SQS::Queue)
[-] ☢️ Destroying CdkWorkshopQueuePolicyAF2494A5 (type: AWS::SQS::QueuePolicy)
[-] ☢️ Destroying CdkWorkshopTopicD368A42F (type: AWS::SNS::Topic)
[-] ☢️ Destroying CdkWorkshopTopicCdkWorkshopQueueSubscription88D211C7 (type: AWS::SNS::Subscription)
```

As expected, all of our resources are going to be brutally destroyed.

## cdk deploy

Run `cdk deploy` and __proceed to the next section__ (no need to wait):

```s
cdk deploy
```

You should see the resources begin deleted.