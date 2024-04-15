+++
title = "CDK Pipelines"
weight = 200
bookCollapseSection = true
+++

# CDK Pipelines

In this chapter we will create a Continuous Deployment (CD) pipeline for the app developed in previous chapters.

CD is an important component in most web projects, but can be challenging to set up with all the moving parts required. The [CDK Pipelines](https://docs.aws.amazon.com/cdk/latest/guide/cdk_pipeline.html) construct makes that process easy and streamlined from within your existing CDK infrastructure design.

These pipelines consist of "stages" that represent the phases of your deployment process from how the source code is managed, to how the fully built artifacts are deployed.

![](./pipeline-stages.png)

{{< nextprevlinks >}}