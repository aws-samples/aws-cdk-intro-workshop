+++
title = "Initial Setup"
weight = 100
+++

## Initial Setup

{{% notice warning %}}
Before you begin, make sure you have gone through the steps in the [Prerequisites](/15-prerequisites.html) section.

You must also have <a href="https://docs.docker.com/get-docker/" target="_blank">Docker</a> running and <a href="https://yarnpkg.com/getting-started/install" target="_blank">Yarn</a> installed in your development environment to complete this walkthrough.
{{% /notice %}}

## Create the Parent Directory and Project Directory

### Parent Directory 
We'll create a parent directory to hold all of the code for this workshop:

{{<highlight bash>}}
mkdir construct-hub-workshop && cd construct-hub-workshop
{{</highlight>}}

### Project Directory
Next we'll create a project directory for the actual Construct Hub construct we'll be deploying to our aws account:

{{<highlight bash>}}
mkdir internal-construct-hub && cd internal-construct-hub
{{</highlight>}}

## Create a New TypeScript CDK Project

We will use `cdk init` to create a new TypeScript CDK project:

{{<highlight bash>}}
cdk init app --language typescript
{{</highlight>}}
