+++
title = "Project structure"
weight = 300
+++

## Open your IDE

Now's a good time to open the project in your favorite IDE and explore.

> If you use VSCode, you can just type `code .` within the project directory.

## Explore your project directory

You'll see something like this:

![](./structure.png)

* .env - The python virtual envirnment information discussed in the previous section.
* cdkworkshop — A Python module directory.
  * cdkworkshop.egg-info - Folder that contains build information relevant for the packaging on the project
  * cdkworkshop_stack.py—A custom CDK stack construct for use in your CDK application.
* tests — Contains all tests.
  * unit — Contains unit tests.
    * test_cdkworkshop.py—A trivial test of the custom CDK stack created in the hello package. This is mainly to demonstrate how tests can be hooked up to the project.
* app.py — The “main” for this sample application.
* cdk.json — A configuration file for CDK that defines what executable CDK should run to generate the CDK construct tree.
* README.md — The introductory README for this project.
* requirements.txt—This file is used by pip to install all of the dependencies for your application. In this case, it contains only -e . This tells pip to install the requirements specified in setup.py. It also tells pip to run python setup.py develop to install the code in the hello module so that it can be edited in place.
* setup.py — Defines how this Python package would be constructed and what the dependencies are.

## Your app's entry point

Let's have a quick look at `app.py`:

```python
#!/usr/bin/env python3

from aws_cdk import core

from cdkworkshop.cdkworkshop_stack import CdkWorkshopStack


app = core.App()
CdkWorkshopStack(app, "cdkworkshop", env={'region': 'us-west-2'})

app.synth()
```

This code loads and instantiates an instance of the `CdkWorkshopStack` class from 
`cdkworshop/cdk_orkshop_stack.py` file. We won't need to look at this file anymore.

## The main stack

Open up `cdkworshop/cdkworkshop_stack.py`. This is where the meat of our application
is:

```python
from aws_cdk import (
    aws_iam as iam,
    aws_sqs as sqs,
    aws_sns as sns,
    aws_sns_subscriptions as subs,
    core
)

class CdkWorkshopStack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        queue = sqs.Queue(
            self, "CdkWorkshopQueue",
            visibility_timeout=core.Duration.seconds(300),
        )

        topic = sns.Topic(
            self, "CdkWorkshopTopic"
        )

        topic.add_subscription(subs.SqsSubscription(queue))
```

As you can see, our app was created with two instances of our sample CDK stack
(`CdkWorkshopStack`).

The stacks includes:

- SQS Queue (`sqs.Queue`)
- SNS Topic (`sns.Topic`)
- Subscribes the queue to receive any messages published to the topic (`topic.add_subscription`)
- HelloConstruct which is a custom construct defined in our app.  It creates a
  variable number of S3 buckets in our stack.
