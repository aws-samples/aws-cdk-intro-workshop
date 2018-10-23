+++
title = "cdk init"
weight = 100
+++

## Create project directory

Create an empty directory on your system:

```s
mkdir cdk-workshop && cd cdk-workshop
```

## cdk init

We will use `cdk init` to create a new TypeScript CDK project:

```s
cdk init --language typescript
```

Output should look like this (you can safely ignore warnings about
initialization of a git repository, this probably means you don't have git
installed, which is fine for this workshop):

```
Applying project template app for typescript
Initializing a new git repository...
Executing npm install...
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN dry-run-1@0.1.0 No repository field.
npm WARN dry-run-1@0.1.0 No license field.

# Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
```

As you can see, it shows us a bunch of useful commands to get us started.


