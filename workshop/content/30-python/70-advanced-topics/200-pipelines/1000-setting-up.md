+++
title = "Getting Started with Pipelines"
weight = 110
+++

> Note: This segment of the workshop assumes you have completed the previous sections of the workshop. If you have not, and just want to follow this segment, or you are returning to try this workshop, you can use the code [here](https://github.com/aws-samples/aws-cdk-intro-workshop/tree/master/code/python/main-workshop) that represents the last state of the project after adding the tests.

## Create Pipeline Stack
The first step is to create the stack that will contain our pipeline.
Since this is separate from our actual "production" application, we want this to be entirely self-contained.

Create a new file under `cdk_workshop` called `pipeline_stack.py`. Add the following to that file.

{{<highlight python>}}
from constructs import Construct
from aws_cdk import (
    Stack
)
#from pipeline_stage import WorkshopPipelineStage
class WorkshopPipelineStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Pipeline code will go here
{{</highlight>}}

Look familiar? At this point, the pipeline is like any other CDK stack.

## Update CDK Deploy Entrypoint
Next, since the purpose of our pipeline is to deploy our application stack, we no longer want the main CDK application to deploy our original app. Instead, we can change the entry point to deploy our pipeline, which will in turn deploy the application.

To do this, edit the code in `app.py` as follows:

{{<highlight python "hl_lines=4 7">}}
#!/usr/bin/env python3

import aws_cdk as cdk
from cdk_workshop.pipeline_stack import WorkshopPipelineStack

app = cdk.App()
WorkshopPipelineStack(app, "WorkshopPipelineStack")

app.synth()
{{</highlight>}}

This instructs the CDK to use those new features any time it synthesizes a stack (`cdk synth`).


And now we're ready!

# Lets build a pipeline!
