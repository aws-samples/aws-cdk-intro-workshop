#!/usr/bin/env python3

from aws_cdk import core

from cdk_workshop.pipeline_stack import WorkshopPipelineStack


app = core.App()
WorkshopPipelineStack(app, "WorkshopPipelineStack")

app.synth()
