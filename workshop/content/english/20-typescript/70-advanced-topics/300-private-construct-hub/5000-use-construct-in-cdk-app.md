+++
title = "Use construct in CDK application"
weight = 400
+++

## Remove the hitcounter construct from the original sample application

{{<highlight bash>}}
rm hitcounter.ts
rm lambda/hitcounter.js
{{</highlight>}}

## Configure npm to use CodeArtifact as package repository

To enable npm to pull packages from CodeArtifact, follow the instructions described [here](https://docs.aws.amazon.com/codeartifact/latest/ug/npm-auth.html).

## Npm install cdkworkshop-lib dependency

To use the published CDK Construct library (called `cdkworkshop-lib`) that contains the hitcounter CDK Construct, use `npm install` to add it to the CDK application's dependencies:

{{<highlight bash>}}
npm install cdkworkshop-lib
{{</highlight>}}

## Adapt the import to use the CDK Construct library

To replace the local version of the hitcounter CDK COnstruct with the one from the cdkworkshop-lib CDK Construct Library, replace `import { HitCounter } from './hitcounter';` with `import { HitCounter } from 'cdkworkshop-lib';`, which results in the following import block in `cdk-workshop-stack.ts`:

{{<highlight ts>}}
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { HitCounter } from 'cdkworkshop-lib';
import { TableViewer } from 'cdk-dynamo-table-viewer';
{{</highlight>}}

## Review benefits

That's it! Your CDK app is now using the hitcounter Construct from the cdkworkshop-lib CDK Construct library. Multiple CDK apps can use this construct without copy/pasting its code so that code duplication is avoided. You can now start adding additional CDK Constructs to cdkworkshop-lib to build a construct library that help accelerate your teams and establish best practices!
