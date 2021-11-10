#!/usr/bin/env python3

from aws_cdk import core as cdk

from cdk_workshop.pipeline_stack import WorkshopPipelineStack


app = cdk.App()
WorkshopPipelineStack(app, "WorkshopPipelineStack")

app.synth()
