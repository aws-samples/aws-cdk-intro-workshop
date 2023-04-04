+++
title = "Use construct in CDK application"
weight = 600
+++

## Starting point
This step reuses the main workshop's example CDK app containing the hello lambda and the hitcounter construct.
Here, we'll take on the role of an Internal Construct Hub Consumer. 

## Remove the hitcounter construct from the original sample application

As we are going to use the `hitcounter` construct from the published `cdkworkshop-lib` construct library, remove the `hitcounter` construct from the CDK application.

{{<highlight bash>}}
rm hitcounter.ts
rm lambda/hitcounter.js
{{</highlight>}}

## Configure npm to use CodeArtifact as package repository

To enable npm to pull packages from CodeArtifact, follow the instructions described [here](https://docs.aws.amazon.com/codeartifact/latest/ug/npm-auth.html).

{{<highlight bash>}}
aws codeartifact login --tool npm --domain cdkworkshop-domain  --repository cdkworkshop-repository --region us-east-1
{{</highlight>}}

## Npm install cdkworkshop-lib dependency

To use the published `cdkworkshop-lib` CDK construct library containing the hitcounter CDK construct, use `npm install` to add it to the CDK application's dependencies:

{{<highlight bash>}}
npm install cdkworkshop-lib
{{</highlight>}}

## Adapt import to use the construct library

To replace the local version of the hitcounter construct with the one from the cdkworkshop-lib construct library, replace `import { HitCounter } from './hitcounter';` with `import { HitCounter } from 'cdkworkshop-lib';`, which results in the following import block in `cdk-workshop-stack.ts`:

{{<highlight ts>}}
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { HitCounter } from 'cdkworkshop-lib';
import { TableViewer } from 'cdk-dynamo-table-viewer';
{{</highlight>}}

## Review benefits

That's it! Your CDK app is now using the hitcounter construct from the cdkworkshop-lib CDK Construct library. Multiple CDK apps can use this construct without copy/pasting its code so that code duplication is avoided and standardized best practices can be reused. You can now start adding additional CDK Constructs to cdkworkshop-lib to build a construct library that help accelerate your teams and establish best practices!
