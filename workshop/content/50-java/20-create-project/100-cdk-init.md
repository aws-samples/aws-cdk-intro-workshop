+++
title = "cdk init"
weight = 100
+++

## Create project directory

Create an empty directory on your system:

```
mkdir cdk-workshop && cd cdk-workshop
```

## cdk init

We will use `cdk init` to create a new Java CDK project:

```
cdk init sample-app --language java
```

Output should look like this (you can safely ignore warnings about
initialization of a git repository, this probably means you don't have git
installed, which is fine for this workshop):

```
Applying project template sample-app for java
Initializing a new git repository...
Executing mvn package...

Welcome to your CDK Java project!

It is a Maven-based project, so you can open this directory with any Maven-compatible Java IDE,
and you should be able to build and run tests from your IDE.

You should explore the contents of this template. It demonstrates a CDK app with an instance
of a stack (`CdkWorkshopStack`).

The `cdk.json` file tells the CDK Toolkit how to execute your app. This example relies on maven
to do that.

# Useful commands

 * `mvn package`     compile and run tests
 * `cdk ls`          list all stacks in the app
 * `cdk synth`       emits the synthesized CloudFormation template
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk docs`        open CDK documentation

Enjoy!
```

As you can see, it shows us a bunch of useful commands to get us started.

## See Also

- [AWS CDK Command Line Toolkit (cdk) in the AWS CDK User Guide](https://docs.aws.amazon.com/CDK/latest/userguide/tools.html)