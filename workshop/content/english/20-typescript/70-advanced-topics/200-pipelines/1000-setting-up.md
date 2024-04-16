+++
title = "Getting Started with Pipelines"
weight = 110
+++

> Note: This segment of the workshop assumes you have completed the previous sections of the workshop. If you have not, and just want to follow this segment, or you are returning to try this workshop, you can use the code [here](https://github.com/aws-samples/aws-cdk-intro-workshop/tree/master/code/typescript/tests-workshop) that represents the last state of the project after adding the tests.

## Create Pipeline Stack
The first step is to create the stack that will contain our pipeline.
Since this is separate from our actual "production" application, we want this to be entirely self-contained.

Create a new file under `lib` called `lib/pipeline-stack.ts`. Add the following to that file.

{{<highlight ts>}}
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Pipeline code goes here
    }
}
{{</highlight>}}

Look familiar? At this point, the pipeline is like any other CDK stack.

## Update CDK Deploy Entrypoint
Next, since the purpose of our pipeline is to deploy our application stack, we no longer want the main CDK application to deploy our original app. Instead, we can change the entry point to deploy our pipeline, which will in turn deploy the application.

To do this, edit the code in `bin/cdk-workshop.ts` as follows:

{{<highlight ts "hl_lines=2 5">}}
import * as cdk from 'aws-cdk-lib';
import { WorkshopPipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
new WorkshopPipelineStack(app, 'CdkWorkshopPipelineStack');
{{</highlight>}}


And now we're ready!

# Lets build a pipeline!

{{< nextprevlinks >}}