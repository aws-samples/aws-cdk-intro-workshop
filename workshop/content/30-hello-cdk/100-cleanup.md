+++
title = "Cleanup sample"
weight = 100
+++

Open `bin/cdk-workshop.ts` and delete remove all resources from your stack and
the relevant `import` statements.

You code should look like this.

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
what will happen if we run `cdk deplot` again (the difference between our CDK
app and what's currently deployed):

```s
$ cdk diff
[-] ☢️ Destroying CdkWorkshopQueue50D9D426 (type: AWS::SQS::Queue)
[-] ☢️ Destroying CdkWorkshopQueuePolicyAF2494A5 (type: AWS::SQS::QueuePolicy)
[-] ☢️ Destroying CdkWorkshopTopicD368A42F (type: AWS::SNS::Topic)
[-] ☢️ Destroying CdkWorkshopTopicCdkWorkshopQueueSubscription88D211C7 (type: AWS::SNS::Subscription)
[~] 🛠 Updating CDKMetadata (type: AWS::CDK::Metadata)
 └─ [~] .Modules:
     ├─ [-] Old value: @aws-cdk/aws-cloudwatch=0.12.0,@aws-cdk/aws-iam=0.12.0,@aws-cdk/aws-kms=0.12.0,@aws-cdk/aws-s3-notifications=0.12.0,@aws-cdk/aws-sns=0.12.0,@aws-cdk/aws-sqs=0.12.0,@aws-cdk/cdk=0.12.0,@aws-cdk/cx-api=0.12.0,cdk-workshop=0.1.0
     └─ [+] New value: @aws-cdk/cdk=0.12.0,@aws-cdk/cx-api=0.12.0,cdk-workshop=0.1.0
```

As expected, all of our resources are going to be brutally destroyed.

Run `cdk deploy` and __proceed to the next section__ (no need to wait):

```s
$ cdk deploy
Deleting resources...
```