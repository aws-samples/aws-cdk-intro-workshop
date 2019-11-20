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

We will use `cdk init` to create a new TypeScript CDK project:

```
cdk init sample-app --language csharp
```

Output should look like this (you can safely ignore warnings about
initialization of a git repository, this probably means you don't have git
installed, which is fine for this workshop):

```
Applying project template app for csharp
Project `HelloCdk/HelloCdk.csproj` added to the solution.
Initializing a new git repository...

# CDK HelloWorld 

Welcome to your CDK .NET project!

You should explore the contents of this template. It demonstrates a CDK app with one instance of
a stack (`CdkWorkshopStack`).

The `cdk.json` file tells the CDK Toolkit how to execute your app. It uses the `dotnet` CLI to do this.

# Useful commands

* `dotnet build src` compile this app
* `cdk ls`           list all stacks in the app
* `cdk synth`        emits the synthesized CloudFormation template
* `cdk deploy`       deploy this stack to your default AWS account/region
* `cdk diff`         compare deployed stack with current state
* `cdk docs`         open CDK documentation

Enjoy!

```

As you can see, it shows us a bunch of useful commands to get us started.

## See Also

- [AWS CDK Command Line Toolkit (cdk) in the AWS CDK User Guide](https://docs.aws.amazon.com/CDK/latest/userguide/tools.html)