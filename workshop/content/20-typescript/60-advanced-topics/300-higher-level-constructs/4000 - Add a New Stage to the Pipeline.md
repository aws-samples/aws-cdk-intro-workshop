+++
title = "Add a New Stage to the Pipeline"
weight = 4000
+++

## Updating the pipeline


Now let us add a new stage to the pipeline, where the stage will deploy the queue processor application stack we’ve just defined. Open `lib/pipeline-stack.ts` file and make the adjustments below, defining the Queue Processor application and adding the application stage.

```typescript
import * as cdk from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as codecommit from '@aws-cdk/aws-codecommit';
import { WorkshopPipelineStage } from './pipeline-stage';
import { QueueProcessorStage } from './queue-processor-stage';
import { SimpleSynthAction, CdkPipeline } from "@aws-cdk/pipelines";


export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // This creates a new CodeCommit repository called 'WorkshopRepo'
        const repo = new codecommit.Repository(this, 'WorkshopRepo', {
            repositoryName: "WorkshopRepo"
        });

        // Defines the artifact representing the sourcecode
        const sourceArtifact = new codepipeline.Artifact(); 
        // Defines the artifact representing the cloud assembly 
        // (cloudformation template + all other assets)
        const cloudAssemblyArtifact = new codepipeline.Artifact();

        // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
        const pipeline = new CdkPipeline(this, 'Pipeline', {
            pipelineName: 'WorkshopPipeline',
            cloudAssemblyArtifact,

            // Generates the source artifact from the repo we created in the last step
            sourceAction: new codepipeline_actions.CodeCommitSourceAction({
                actionName: 'CodeCommit', // Any Git-based source control
                output: sourceArtifact, // Indicates where the artifact is stored
                repository: repo // Designates the repo to draw code from
            }),

            // Builds our source code outlined above into a could assembly artifact
            synthAction: SimpleSynthAction.standardNpmSynth({
                sourceArtifact, // Where to get source code to build
                cloudAssemblyArtifact, // Where to place built source

                buildCommand: 'npm run build' // Language-specific build cmd
            })
        });

        const queueProcessorStage = new QueueProcessorStage(this, 'QueueProcessorStage');
        pipeline.addApplicationStage(queueProcessorStage);
    }
}
```

Let us have a look at what we are doing here:

1. We’ve defined an application for the queue processor stack, which extends the CDK Stage Interface. While this application currently consists of one stack only, you could group together more than one stacks that are part of the same application. If the stacks have resource dependencies, then the Pipeline construct ensures that the stacks within the same stage are deployed in the correct order.
2. We have defined a new stage in the pipeline referencing this application. In case of multiple environments (or) multiple accounts, you simply repeat this code snippet replacing the account and region values as necessary.
3. Since we are using the native CDK pipeline construct you don’t need docker installed on your Cloud9 because CDK handles the docker build for you and uploads the image it built into ECR.

Now that we have the stack setup, let’s start deploying the stack 