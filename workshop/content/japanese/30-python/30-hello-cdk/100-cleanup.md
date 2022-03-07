+++
title = "Cleanup sample"
weight = 100
+++

## Delete the sample code from your stack

The project created by `cdk init sample-app` includes an SQS queue and queue policy, an SNS
topic and subscription. We're not going to use them in our
project, so remove them from the `CdkWorkshopStack` constructor.

Open `cdk_workshop/cdk_workshop_stack.py` and clean it up. Eventually it should look like
this:

```python
from constructs import Construct
from aws_cdk import (
    Stack,
)


class CdkWorkshopStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Nothing here!
```

## cdk diff

Now that we modified our stack's contents, we can ask the toolkit to show us the difference between our CDK app and
what's currently deployed. This is a safe way to check what will happen once we run `cdk deploy` and is always good practice:

```
cdk diff
```

Output should look like the following:

```
Stack cdk-workshop
IAM Statement Changes
┌───┬─────────────────────────────────┬────────┬─────────────────┬───────────────────────────┬─────────────────────────────────────────────────────────────────┐
│   │ Resource                        │ Effect │ Action          │ Principal                 │ Condition                                                       │
├───┼─────────────────────────────────┼────────┼─────────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ - │ ${CdkworkshopQueue18864164.Arn} │ Allow  │ sqs:SendMessage │ Service:sns.amazonaws.com │ "ArnEquals": {                                                  │
│   │                                 │        │                 │                           │   "aws:SourceArn": "${CdkworkshopTopic58CFDD3D}"                │
│   │                                 │        │                 │                           │ }                                                               │
└───┴─────────────────────────────────┴────────┴─────────────────┴───────────────────────────┴─────────────────────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Resources
[-] AWS::SQS::Queue CdkworkshopQueue18864164 destroy
[-] AWS::SQS::QueuePolicy CdkworkshopQueuePolicy78D5BF45 destroy
[-] AWS::SNS::Subscription CdkworkshopQueuecdkworkshopCdkworkshopTopic7642CC2FCF70B637 destroy
[-] AWS::SNS::Topic CdkworkshopTopic58CFDD3D destroy
```

As expected, all of our resources are going to be brutally destroyed.

## cdk deploy

Run `cdk deploy` and __proceed to the next section__ (no need to wait):

```
cdk deploy
```

You should see the resources being deleted.
