#!/usr/bin/env python3

from aws_cdk import core as cdk
from cdk_workshop.cdk_workshop_stack import CdkWorkshopStack

app = cdk.App()
CdkWorkshopStack(app, "cdk-workshop")

app.synth()
