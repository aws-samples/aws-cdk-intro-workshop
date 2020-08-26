+++
title = "Create New Pipeline"
weight = 130
+++

## Define an Empty Pipeline
Now we are ready to define the basics of the pipeline.

We will be using several new packages here, so first `npm install @aws-cdk/aws-codepipeline @aws-cdk/aws-codepipeline-actions @aws-cdk/pipelines`.

Return to the file `lib/pipeline-stack.ts` and edit as follows:

{{<highlight ts "hl_lines=3-5 12 16-42">}}
import * as cdk from '@aws-cdk/core';
import * as codecommit from '@aws-cdk/aws-codecommit';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { SimpleSynthAction, CdkPipeline } from "@aws-cdk/pipelines";

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
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
        new CdkPipeline(this, 'Pipeline', {
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
        })
    }
}
{{</highlight>}}

### Component Breakdown
The above code does several things:
- `sourceArtifact`/`cloudAssemblyArtifact`: These will store our source code and [cloud assembly](https://docs.aws.amazon.com/cdk/latest/guide/apps.html#apps_cloud_assembly) respectively
- `new CdkPipeline(...)`: This initializes the pipeline with the required values. This will serve as the base component moving forward. Every pipeline requires at bare minimum:
    - `CodeCommitSourceAction(...)`: The `sourceAction` of the pipeline will check the designated repository for source code and generate an artifact.
    - `SimpleSynthAction.standardNpmSynth`: The `synthAction` of the pipeline will take the source artifact generated in by the `sourceAction` and build the application based on the `buildCommand`. This is always followed by `npx cdk synth`

## Deploy Pipeline and See Result
All thats left to get our pipeline up and running is to commit our changes and run one last cdk deploy. 

```
git commit -am "MESSAGE" && git push
npx cdk deploy
```

CdkPipelines auto-update for each commit in a source repoh, so this is is the *last time* we will need to execute this command!

Once deployment is finished, you can go to the [CodePipeline console](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) and you will see a new pipeline! If you navigate to it, it should look like this:

![](./pipeline-init.png)
