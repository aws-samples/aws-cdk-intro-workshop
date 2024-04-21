+++
title = "Create New Pipeline"
weight = 3000
+++

## Define an Empty Pipeline
Now we are ready to define the basics of the pipeline.

Return to the file `CdkWorkshop/PipelineStack.cs` and edit as follows:

{{<highlight ts "hl_lines=3-5 15 20-35">}}
using Amazon.CDK;
using Amazon.CDK.AWS.CodeCommit;
using Amazon.CDK.AWS.CodePipeline;
using Amazon.CDK.AWS.CodePipeline.Actions;
using Amazon.CDK.Pipelines;
using Constructs;

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

            // The basic pipeline declaration. This sets the initial structure
            // of our pipeline
            var pipeline = new CodePipeline(this, "Pipeline", new CodePipelineProps
            {
                PipelineName = "WorkshopPipeline",

                // Builds our source code outlined above into a could assembly artifact
                Synth = new ShellStep("Synth", new ShellStepProps{
                    Input = CodePipelineSource.CodeCommit(repo, "main"),  // Where to get source code to build
                    Commands = new string[] {
                        "npm install -g aws-cdk",
                        "sudo apt-get install -y dotnet-sdk-3.1", // Language-specific install cmd
                        "dotnet build"  // Language-specific build cmd
                    }
                }),
            });
        }
    }
}

{{</highlight>}}

### Component Breakdown
The above code does several things:

* `new CodePipeline(...)`: This initializes the pipeline with the required values. This will serve as the base component moving forward. Every pipeline requires at bare minimum:
    * `Synth(...)`: The `synthAction` of the pipeline describes the commands necessary to install dependencies, build, and synth the CDK application from source. This should always end in a *synth* command, for NPM-based projects this is always `cdk synth`.
        * The `input` of the synth step specifies the repository where the CDK source code is stored.


## Deploy Pipeline and See Result
All thats left to get our pipeline up and running is to commit our changes and run one last cdk deploy.

```
git commit -am "MESSAGE" && git push
cdk deploy
```

CdkPipelines auto-update for each commit in a source repo, so this is is the *last time* we will need to execute this command!

Once deployment is finished, you can go to the [CodePipeline console](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) and you will see a new pipeline! If you navigate to it, it should look like this:

![](./pipeline-init.png)

{{< nextprevlinks >}}