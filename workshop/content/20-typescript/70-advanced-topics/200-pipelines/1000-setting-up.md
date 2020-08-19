+++
title = "Getting Started with Pipelines"
weight = 110
+++

> Note: This segment of the workshop assumes you have completed the previous sections of the workshop. If you have not, and just want to follow this segment, or you are returning to try this workshop, you can use the code [here]() that represents the last state of the project after adding the tests.

## Create Pipeline Stack
The first step is to create the stack which will contain our pipeline.
Since this is separate from our actual "production" application, we want this to be entirely self-contained.

Create a new file under `lib` called `lib/pipeline-stack.ts`. Add the following to that file.

{{<highlight ts>}}
import * as cdk from '@aws-cdk/core';

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Pipeline code goes here
    }
}
{{</highlight>}}

Look familiar? At this point, the pipeline is treated like any other CDK stack.

## Update CDK Deploy Entrypoint
Next, since the purpose of our pipeline is to deploy our application stack, we no longer want the main cdk application to deploy our original app. Instead, we can change the entrypoint to deploy our pipeline, which will in-turn deploy the application.

To do this, edit the code in `bin/cdk-workshop.ts` as follows:

{{<highlight ts "hl_lines=2 5">}}
import * as cdk from '@aws-cdk/core';
import { WorkshopPipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
new WorkshopPipelineStack(app, 'CdkWorkshopPipelineStack');
{{</highlight>}}

## Enable "New-Style" Synthesis
The construct `@aws-cdk/pipelines` uses some new core cdk framework features called "newStyleStackSynthesis". In order to properly deploy our pipeline, we must enable this feature in our CDK Config.

Edit the file `cdk.json` as follows:

{{<highlight json "hl_lines=3-5">}}
{
    "app": "node bin/cdk-workshop.js",
    "context": {
        "@aws-cdk/core:newStyleStackSynthesis": true
    }
}
{{</highlight>}}

This instructs the cdk to use those new features anytime it executes a stack synthesis (`cdk synth`).

## Special Bootstrap
Finally, there is one last step before we are prepared. In order to have the proper permissions in your account to deploy the pipeline we must rerun `cdk bootstrap` with the addition of parameter `--cloudformation-execution-policies`. This will explicitly give the CDK full control over your account as well as switching over to the new bootstrapping resources enabled in the previous step.

```
npx cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

And now we're ready!

# Lets build a pipeline!