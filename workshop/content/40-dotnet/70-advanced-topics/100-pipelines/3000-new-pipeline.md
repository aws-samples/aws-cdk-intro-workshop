+++
title = "Create New Pipeline"
weight = 130
+++

## Define an Empty Pipeline
Now we are ready to define the basics of the pipeline.

We will be using several new packages here, so first run:
```
dotnet add package Amazon.CDK.AWS.CodePipeline Amazon.CDK.AWS.CodePipeline.Actions Amazon.CDK.Pipelines
```

Return to the file `CdkWorkshop/PipelineStack.cs` and edit as follows:

{{<highlight ts "hl_lines=3-5 14 19-53">}}
using Amazon.CDK;
using Amazon.CDK.AWS.CodeCommit;
using Amazon.CDK.AWS.CodePipeline;
using Amazon.CDK.AWS.CodePipeline.Actions;
using Amazon.CDK.Pipelines;

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
        }
    }
}

{{</highlight>}}

### Component Breakdown
The above code does several things:

* `sourceArtifact`/`cloudAssemblyArtifact`: These will store our source code and [cloud assembly](https://docs.aws.amazon.com/cdk/latest/guide/apps.html#apps_cloud_assembly) respectively
* `new CdkPipeline(...)`: This initializes the pipeline with the required values. This will serve as the base component moving forward. Every pipeline requires at bare minimum:
    * `CodeCommitSourceAction(...)`: The `sourceAction` of the pipeline will check the designated repository for source code and generate an artifact.
    * `SimpleSynthAction.StandardNpmSynth`: The `SynthAction` of the pipeline will take the source artifact generated in by the `SourceAction` and build the application based on the `BuildCommand`. This is always followed by `npx cdk synth`

## Deploy Pipeline and See Result
All thats left to get our pipeline up and running is to commit our changes and run one last cdk deploy. 

```
git commit -am "MESSAGE" && git push
npx cdk deploy
```

CdkPipelines auto-update for each commit in a source repo, so this is is the *last time* we will need to execute this command!

Once deployment is finished, you can go to the [CodePipeline console](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) and you will see a new pipeline! If you navigate to it, it should look like this:

![](./pipeline-init.png)
