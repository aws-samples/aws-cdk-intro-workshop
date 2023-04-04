+++
title = "Initial Setup"
weight = 100
+++

## Initial Setup

{{% notice warning %}}
The steps outlined below make use of the [something about the other workshop modules]
  {{% /notice %}}

{{% notice warning %}}
Before you begin, make sure you have gone through the steps in the [Prerequisites](/15-prerequisites.html) section.

You must also have Docker running and Yarn installed in your dev environment to complete this walkthrough.
{{% /notice %}}

## Create parent directory and project directory


Parent Directory 
```
mkdir cdk-workshop && cd cdk-workshop
```

Project Directory
```
mkdir internal-construct-hub && cd internal-construct-hub
```

## cdk init

We will use `cdk init` to create a new TypeScript CDK project:

```
cdk init app --language typescript
```
