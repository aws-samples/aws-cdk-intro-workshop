#!/usr/bin/env python3

from aws_cdk import core

from cdk_workshop.cdk_workshop_stack import CdkWorkshopStack


app = core.App()
CdkWorkshopStack(app, "cdk-workshop")

app.synth()
