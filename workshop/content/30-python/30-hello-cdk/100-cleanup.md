+++
title = "Cleanup sample"
weight = 100
+++

## Delete the sample code from your stack

The project created by `cdk init sample-app` includes an SQS queue, an SNS
topic, some S3 buckets, and an IAM user. We're not going to use them in our
project, so remove them from the `MyStack` constructor.

Open `hello/hello_stack.py` and clean it up. Eventually it should look like
this:

```python
from aws_cdk import (
    core,
)


class MyStack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Nothing here!
```

While you are at it, you can also safely delete the `hello/hello_construct.py`
file as we won't be needing that anymore, either.  Ensure the `from hello_construct import HelloConstruct`
is also removed from `hello/hello_stack.py` after deleteing the file.

## cdk diff

Now, that we modified our stack's contents, we can ask the toolkit to show us
what will happen if we run `cdk deploy` (the difference between our CDK app and
what's currently deployed):

```
cdk diff hello-cdk-1
```

Output should look like the following:

```
Stack hello-cdk-1
IAM Statement Changes
┌───┬────────────────────┬────────┬────────────────────┬────────────────────┬───────────────────────┐
│   │ Resource           │ Effect │ Action             │ Principal          │ Condition             │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ - │ ${MyFirstQueueFF09 │ Allow  │ sqs:SendMessage    │ Service:sns.amazon │ "ArnEquals": {        │
│   │ 316A.Arn}          │        │                    │ aws.com            │   "aws:SourceArn": "$ │
│   │                    │        │                    │                    │ {MyFirstTopic0ED1F8A4 │
│   │                    │        │                    │                    │ }"                    │
│   │                    │        │                    │                    │ }                     │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ - │ ${MyHelloConstruct │ Allow  │ s3:GetBucket*      │ AWS:${MyUserDC4502 │                       │
│   │ Bucket0DAEC57E1.Ar │        │ s3:GetObject*      │ 8B}                │                       │
│   │ n}                 │        │ s3:List*           │                    │                       │
│   │ ${MyHelloConstruct │        │                    │                    │                       │
│   │ Bucket0DAEC57E1.Ar │        │                    │                    │                       │
│   │ n}/*               │        │                    │                    │                       │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ - │ ${MyHelloConstruct │ Allow  │ s3:GetBucket*      │ AWS:${MyUserDC4502 │                       │
│   │ Bucket18D9883BE.Ar │        │ s3:GetObject*      │ 8B}                │                       │
│   │ n}                 │        │ s3:List*           │                    │                       │
│   │ ${MyHelloConstruct │        │                    │                    │                       │
│   │ Bucket18D9883BE.Ar │        │                    │                    │                       │
│   │ n}/*               │        │                    │                    │                       │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ - │ ${MyHelloConstruct │ Allow  │ s3:GetBucket*      │ AWS:${MyUserDC4502 │                       │
│   │ Bucket2C1DA3656.Ar │        │ s3:GetObject*      │ 8B}                │                       │
│   │ n}                 │        │ s3:List*           │                    │                       │
│   │ ${MyHelloConstruct │        │                    │                    │                       │
│   │ Bucket2C1DA3656.Ar │        │                    │                    │                       │
│   │ n}/*               │        │                    │                    │                       │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ - │ ${MyHelloConstruct │ Allow  │ s3:GetBucket*      │ AWS:${MyUserDC4502 │                       │
│   │ Bucket398A5DE67.Ar │        │ s3:GetObject*      │ 8B}                │                       │
│   │ n}                 │        │ s3:List*           │                    │                       │
│   │ ${MyHelloConstruct │        │                    │                    │                       │
│   │ Bucket398A5DE67.Ar │        │                    │                    │                       │
│   │ n}/*               │        │                    │                    │                       │
└───┴────────────────────┴────────┴────────────────────┴────────────────────┴───────────────────────┘
(NOTE: There may be security-related changes not in this list. See http://bit.ly/cdk-2EhF7Np)

Resources
[-] AWS::SQS::Queue MyFirstQueueFF09316A destroy
[-] AWS::SQS::QueuePolicy MyFirstQueuePolicy596EEC78 destroy
[-] AWS::SNS::Subscription MyFirstQueuehellocdk1MyFirstTopicB252874C505090E8 destroy
[-] AWS::SNS::Topic MyFirstTopic0ED1F8A4 destroy
[-] AWS::S3::Bucket MyHelloConstructBucket0DAEC57E1 orphan
[-] AWS::S3::Bucket MyHelloConstructBucket18D9883BE orphan
[-] AWS::S3::Bucket MyHelloConstructBucket2C1DA3656 orphan
[-] AWS::S3::Bucket MyHelloConstructBucket398A5DE67 orphan
[-] AWS::IAM::User MyUserDC45028B destroy
[-] AWS::IAM::Policy MyUserDefaultPolicy7B897426 destroy
```

As expected, all of our resources are going to be brutally destroyed.

## cdk deploy

Run `cdk deploy` and __proceed to the next section__ (no need to wait):

```
cdk deploy hello-cdk-1
```

You should see the resources being deleted.
