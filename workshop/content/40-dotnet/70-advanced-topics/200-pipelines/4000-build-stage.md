+++
title = "Add Application to Pipeline"
weight = 140
+++

## Create Stage
At this point, you have a fully operating CDK pipeline that will automatically update itself on every commit, *BUT* at the moment, that is all it does. We need to add a stage to the pipeline that will deploy our application.

Create a new file in `lib` called `pipeline-stage.ts` with the code below:

{{<highlight ts>}}
import { CdkWorkshopStack } from './cdk-workshop-stack';
import { Stage, Construct, StageProps } from '@aws-cdk/core';

export class WorkshopPipelineStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        new CdkWorkshopStack(this, 'WebService');
    }
}
{{</highlight>}}

All this does is declare a new `Stage` (component of a pipeline), and in that stage instantiate our application stack.

Now, at this point your code editor may be telling you that you are doing something wrong. This is because the application stack as it stands now is not configured to be deployed by a pipeline.
Open `lib/cdk-workshop-stack.ts` and make the following changes:

{{<highlight ts "hl_lines=8">}}
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.Construct, is: string, props?: cdk.StackProps) {
    super(scope, is, props);

    // The rest of your code...
{{</highlight>}}

This stack's `scope` parameter was defined as being a `cdk.App`, which means that in the construct tree, it must be a child of the app. Since the stack is being deployed by the pipeline, it is no longer a child of the app, so its type must be changed to `cdk.Construct`.

## Add stage to pipeline
Now we must add the stage to the pipeline by adding the following code to `lib/pipeline-stack.ts`:

{{<highlight ts "hl_lines=5 26 45-46">}}
import * as cdk from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as codecommit from '@aws-cdk/aws-codecommit';
import { WorkshopPipelineStage } from './pipeline-stage';
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

        const deploy = new WorkshopPipelineStage(this, 'Deploy');
        pipeline.addApplicationStage(deploy);
    }
}
{{</highlight>}}

This imports and creates an instance of the `WorkshopPipelineStage`. Later, you might instantiate this stage multiple times (e.g. you want a Production deployment and a separate devlopment/test deployment).

Then we add that stage to our pipeline (`pipepeline.addApplicationStage(deploy);`). An `ApplicationStage` in a CDK pipeline represents any CDK deployment action.

## Commit/Deploy
Now that we have added the code to deploy our application, all that's left is to commit and push those changes to the repo.

```
git commit -am "Add deploy stage to pipeline" && git push
```

Once that is done, we can go back to the [CodePipeline console](https://us-west-2.console.aws.amazon.com/codesuite/codepipeline/pipelines) and take a look as the pipeline runs (this may take a while).

<!--
![](./pipeline-fail.png)

Uh oh! The pipeline synth failed. Lets take a look and see why.

![](./pipeline-fail-log.png)

It looks like the build step is failing to find our Lambda function.

## Fix Lambda Path
We are currently locating our Lambda code based on the directory that `cdk synth` is being executed in. Since CodeBuild uses a different folder structure than you might for development, it can't find the path to our Lambda code. We can fix that with a small change in `lib/cdk-workshop-stack.ts`:

{{<highlight ts "hl_lines=6 14">}}
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';
import * as path from 'path';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.Construct, is: string, props?: cdk.StackProps) {
    super(scope, is, props);

    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.asset(path.resolve(__dirname, '../lambda')),
      handler: 'hello.handler',

    });
{{</highlight>}}

Here we are explictly navigating up a level from the current directory to find the Lambda code.

If we commit the change (`git commit -am "fix lambda path" && git push`) and take a look at our pipeline again, we can see that our pipeline now builds without error!

-->

![](./pipeline-succeed.png)

Success!
