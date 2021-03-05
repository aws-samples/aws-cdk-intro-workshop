+++
title = "Add a New Stage to the Pipeline"
weight = 4000
+++

## Updating the pipeline


Now let us add a new stage to the pipeline, where the stage will deploy the queue processor application stack we’ve just defined. Open `CdkWorkshop/src/WorkshopPipelineStack.cs` file and make the adjustments below adding the queue processor application stage and removing the WorkshopPipelineStage built in the previous pipeline section.

```ts
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
            var repo = new Repository(this,"WorkshopRepo", new RepositoryProps{
                RepositoryName = "WorkshopRepo"
            });

            // Defines the artifact representing the sourcecode
            var sourceArtifact = new Artifact_(artifactName: "Code");
            // Defines the artifact representing the cloud assembly 
            // (cloudformation template + all other assets)
            var cloudAssemblyArtifact = new Artifact_(artifactName: "CdkAssembly");

            // The basic pipeline declaration. This sets the initial structure
            // of our pipeline
            var pipeline = new CdkPipeline(this, "Pipeline", new CdkPipelineProps
            {
                PipelineName = "WorkshopPipeline",
                CloudAssemblyArtifact = cloudAssemblyArtifact,

                // Generates the source artifact from the repo we created in the last step
                SourceAction = new CodeCommitSourceAction(new CodeCommitSourceActionProps
                {
                    ActionName = "Source", // Any Git-based source control
                    Repository = repo, // Designates the repo to draw code from
                    Output = sourceArtifact, // Indicates where the artifact is stored
                }),

                // Builds our source code outlined above into a could assembly artifact
                SynthAction = SimpleSynthAction.StandardNpmSynth(new StandardNpmSynthOptions
                {
                    SourceArtifact = sourceArtifact,  // Where to get source code to build
                    CloudAssemblyArtifact = cloudAssemblyArtifact,  // Where to place built source
                    ActionName = "Build",

                    InstallCommand = "npm install -g aws-cdk" // Language-specific installation cmd
                    + "&& wget https://packages.microsoft.com/config/debian/10/packages-microsoft-prod.deb -O packages-microsoft-prod.deb"
                    + "&& dpkg -i packages-microsoft-prod.deb"
                    + "&& apt-get install -y apt-transport-https"
                    + "&& apt-get update"
                    + "&& apt-get install -y dotnet-sdk-3.1",
                    BuildCommand = "dotnet build src/CdkWorkshop.sln" // Language-specific build cmd
                })
            });

            var fargate = new QueueProcessorStage(this, "QueueProcessorStage");
            pipeline.AddApplicationStage(fargate);
        }
    }
}
```

Let us have a look at what we are doing here:

1. We’ve defined an application for the queue processor stack, which extends the CDK Stage Interface. While this application currently consists of one stack only, you could group together more than one stacks that are part of the same application. If the stacks have resource dependencies, then the Pipeline construct ensures that the stacks within the same stage are deployed in the correct order.
2. We have defined a new stage in the pipeline referencing this application. In case of multiple environments (or) multiple accounts, you simply repeat this code snippet replacing the account and region values as necessary.
3. Since we are using the native CDK pipeline construct you don’t need docker installed on your Cloud9 because CDK handles the docker build for you and uploads the image it built into ECR.

Now that we have the stack setup, let’s start deploying the stack 