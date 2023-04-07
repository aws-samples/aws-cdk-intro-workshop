+++
title = "Initial Setup"
weight = 100
+++

## Initial Setup

{{% notice warning %}}
Before you begin, make sure you have gone through the steps in the [Prerequisites](/15-prerequisites.html) section.

You must also have [Docker](https://docs.docker.com/get-docker/) running and [Yarn](https://yarnpkg.com/getting-started/install) installed in your dev environment to complete this walkthrough.
{{% /notice %}}

## Create parent directory and project directory

Parent Directory 
We'll create a parent directory to hold all of the code for this workshop
```
mkdir internal-construct-hub-workshop && cd internal-construct-hub-workshop
```

Project Directory
Next we'll create a project directory for the actual Construct Hub construct we'll be deploying to our aws account
```
mkdir internal-construct-hub && cd internal-construct-hub
```

## cdk init

We will use `cdk init` to create a new TypeScript CDK project:

```
cdk init app --language typescript
```
