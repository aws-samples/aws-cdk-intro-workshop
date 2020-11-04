+++
title = "Add Application to Pipeline"
weight = 140
+++

## Create Stage
At this point, you have a fully operating CDK pipeline that will automatically update itself on every commit, *BUT* at the moment, that is all it does. We need to add a stage to the pipeline that will deploy our application.

Create a new file in `CdkWorkshop` called `PipelineStage.cs` with the code below:

{{<highlight ts>}}
using Amazon.CDK;
using Amazon.CDK.Pipelines;

namespace CdkWorkshop
{
    public class WorkshopPipelineStage : Stage
    {
        public WorkshopPipelineStage(Construct scope, string id, StageProps props = null)
            : base(scope, id, props)
        {
            var service = new CdkWorkshopStack(this, "WebService");
        }
    }
}
{{</highlight>}}

All this does is declare a new `Stage` (component of a pipeline), and in that stage instantiate our application stack.

## Add stage to pipeline
Now we must add the stage to the pipeline by adding the following code to `CdkWorkshop/PipelineStack.cs`:

{{<highlight ts "hl_lines=28 56-57">}}
using Amazon.CDK;
using Amazon.CDK.AWS.CodeCommit;
using Amazon.CDK.AWS.CodePipeline;
using Amazon.CDK.AWS.CodePipeline.Actions;
using Amazon.CDK.Pipelines;
using System.Collections.Generic;

namespace CdkWorkshop
{
    public class WorkshopPipelineStack : Stack
    {
        public WorkshopPipelineStack(Construct parent, string id, IStackProps props = null) : base(parent, id, props)
        {
            // Creates a CodeCommit repository called 'WorkshopRepo'
            var repo = new Repository(this, "WorkshopRepo", new RepositoryProps
            {
                RepositoryName = "WorkshopRepo"
            });

            // Defines the artifact representing the sourcecode
            var sourceArtifact = new Artifact_();
            // Defines the artifact representing the cloud assembly 
            // (cloudformation template + all other assets)
            var cloudAssemblyArtifact = new Artifact_();

            // The basic pipeline declaration. This sets the initial structure
            // of our pipeline
            var pipeline = new CdkPipeline(this, "Pipeline", new CdkPipelineProps
            {
                PipelineName = "WorkshopPipeline",
                CloudAssemblyArtifact = cloudAssemblyArtifact,

                // Generates the source artifact from the repo we created in the last step
                SourceAction = new CodeCommitSourceAction(new CodeCommitSourceActionProps
                {
                    ActionName = "CodeCommit", // Any Git-based source control
                    Output = sourceArtifact, // Indicates where the artifact is stored
                    Repository = repo // Designates the repo to draw code from
                }),

                // Builds our source code outlined above into a could assembly artifact
                SynthAction = SimpleSynthAction.StandardNpmSynth(new StandardNpmSynthOptions
                {
                    SourceArtifact = sourceArtifact,  // Where to get source code to build
                    CloudAssemblyArtifact = cloudAssemblyArtifact,  // Where to place built source

                    InstallCommands = new [] 
                    {
                        "npm install -g aws-cdk", 
                        "sudo apt-get install -y dotnet-sdk-3.1"
                    },
                    BuildCommands = new [] { "dotnet build" } // Language-specific build cmd
                })
            });

            var deploy = new WorkshopPipelineStage(this, "Deploy");
            var deployStage = pipeline.AddApplicationStage(deploy);
        }
    }
}
{{</highlight>}}

This imports and creates an instance of the `WorkshopPipelineStage`. Later, you might instantiate this stage multiple times (e.g. you want a Production deployment and a separate devlopment/test deployment).

Then we add that stage to our pipeline (`pipepeline.AddApplicationStage(deploy);`). An `ApplicationStage` in a CDK pipeline represents any CDK deployment action.

## Commit/Deploy
Now that we have added the code to deploy our application, all that's left is to commit and push those changes to the repo.

```
git commit -am "Add deploy stage to pipeline" && git push
```

Once that is done, we can go back to the [CodePipeline console](https://us-west-2.console.aws.amazon.com/codesuite/codepipeline/pipelines) and take a look as the pipeline runs (this may take a while).

![](./pipeline-succeed.png)

Success!
