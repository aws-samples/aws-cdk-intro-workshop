#!/usr/bin/env python3
import aws_cdk as cdk

from cdk_workshop.cdk_workshop_stack import CdkWorkshopStack

app = cdk.App()
CdkWorkshopStack(app, "cdk-workshop")

app.synth()
