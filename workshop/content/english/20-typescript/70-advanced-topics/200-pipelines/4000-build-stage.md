+++
title = "Add Application to Pipeline"
weight = 140
+++

## Create Stage
At this point, you have a fully operating CDK pipeline that will automatically update itself on every commit, *BUT* at the moment, that is all it does. We need to add a stage to the pipeline that will deploy our application.

Create a new file in `lib` called `pipeline-stage.ts` with the code below:

{{<highlight ts>}}
import { CdkWorkshopStack } from './cdk-workshop-stack';
import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

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

{{<highlight ts "hl_lines=9">}}
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The rest of your code...
{{</highlight>}}

This stack's `scope` parameter was defined as being a `cdk.App`, which means that in the construct tree, it must be a child of the app. Since the stack is being deployed by the pipeline, it is no longer a child of the app, so its type must be changed to `Construct`.

## Add stage to pipeline
Now we must add the stage to the pipeline by adding the following code to `lib/pipeline-stack.ts`:

{{<highlight ts "hl_lines=4 18 34-35">}}
import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';
import {WorkshopPipelineStage} from './pipeline-stage';
import {CodeBuildStep, CodePipeline, CodePipelineSource} from "aws-cdk-lib/pipelines";

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // This creates a new CodeCommit repository called 'WorkshopRepo'
        const repo = new codecommit.Repository(this, 'WorkshopRepo', {
            repositoryName: "WorkshopRepo"
        });

       // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
       const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'WorkshopPipeline',
            synth: new CodeBuildStep('SynthStep', {
                    input: CodePipelineSource.codeCommit(repo, 'master'),
                    installCommands: [
                        'npm install -g aws-cdk'
                    ],
                    commands: [
                        'npm ci',
                        'npm run build',
                        'npx cdk synth'
                    ]
                }
            )
        });

        const deploy = new WorkshopPipelineStage(this, 'Deploy');
        const deployStage = pipeline.addStage(deploy);
    }
}
{{</highlight>}}

This imports and creates an instance of the `WorkshopPipelineStage`. Later, you might instantiate this stage multiple times (e.g. you want a Production deployment and a separate devlopment/test deployment).

Then we add that stage to our pipeline (`pipeline.addStage(deploy);`). A Stage in a CDK Pipeline represents a set of one or more CDK Stacks that should be deployed together, to a particular environment.

## Commit/Deploy
Now that we have added the code to deploy our application, all that's left is to commit and push those changes to the repo.

```
git commit -am "Add deploy stage to pipeline" && git push
```

Once that is done, we can go back to the [CodePipeline console](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) and take a look as the pipeline runs (this may take a while).

<!--
![](./pipeline-fail.png)

Uh oh! The pipeline synth failed. Lets take a look and see why.

![](./pipeline-fail-log.png)

It looks like the build step is failing to find our Lambda function.

## Fix Lambda Path
We are currently locating our Lambda code based on the directory that `cdk synth` is being executed in. Since CodeBuild uses a different folder structure than you might for development, it can't find the path to our Lambda code. We can fix that with a small change in `lib/cdk-workshop-stack.ts`:

{{<highlight ts "hl_lines=6 14">}}
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';
import * as path from 'path';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(path.resolve(__dirname, '../lambda')),
      handler: 'hello.handler',

    });
{{</highlight>}}

Here we are explicitly navigating up a level from the current directory to find the Lambda code.

If we commit the change (`git commit -am "fix lambda path" && git push`) and take a look at our pipeline again, we can see that our pipeline now builds without error!

-->

![](./pipeline-succeed.png)

Success!
