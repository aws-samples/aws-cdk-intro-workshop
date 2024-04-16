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

We will use `cdk init` to create a new Go CDK project:

```
cdk init sample-app --language go
```

Output should look like this (you can safely ignore warnings about
initialization of a git repository, this probably means you don't have git
installed, which is fine for this workshop):

```
Applying project template sample-app for go
# Welcome to your CDK Go project!

This is a blank project for Go development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
 * `go test`         run unit tests

Initializing a new git repository...
✅ All done!
```

As you can see, it shows us a bunch of useful commands to get us started.

## See Also

- [AWS CDK Command Line Toolkit (cdk) in the AWS CDK User Guide](https://docs.aws.amazon.com/CDK/latest/userguide/tools.html)

{{< nextprevlinks >}}