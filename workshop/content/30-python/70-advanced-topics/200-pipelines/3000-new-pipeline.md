+++
title = "Create New Pipeline"
weight = 130
+++

## Define an Empty Pipeline
Now we are ready to define the basics of the pipeline.


Return to the file `pipeline_stack.py` and edit as follows:

{{<highlight python "hl_lines=5-7 15 20-48">}}
from constructs import Construct
from aws_cdk import (
    Stack,
    aws_codecommit as codecommit,
    aws_codepipeline as codepipeline,
    aws_codepipeline_actions as codepipeline_actions,
    pipelines as pipelines
)

class WorkshopPipelineStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Creates a CodeCommit repository called 'WorkshopRepo'
        repo = codecommit.Repository(
            self, 'WorkshopRepo',
            repository_name= "WorkshopRepo"
        )

        # Defines the artifact representing the sourcecode
        source_artifact = codepipeline.Artifact()
        # Defines the artifact representing the cloud assembly
        # (cloudformation template + all other assets)
        cloud_assembly_artifact = codepipeline.Artifact()

        pipeline = pipelines.CdkPipeline(
            self, 'Pipeline',
            cloud_assembly_artifact=cloud_assembly_artifact,

            # Generates the source artifact from the repo we created in the last step
            source_action=codepipeline_actions.CodeCommitSourceAction(
                action_name='CodeCommit', # Any Git-based source control
                output=source_artifact, # Indicates where the artifact is stored
                repository=repo # Designates the repo to draw code from
            ),

            # Builds our source code outlined above into a could assembly artifact
            synth_action=pipelines.SimpleSynthAction(
                install_commands=[
                    'npm install -g aws-cdk', # Installs the cdk cli on Codebuild
                    'pip install -r requirements.txt' # Instructs codebuild to install required packages
                ],
                synth_command='npx cdk synth',
                source_artifact=source_artifact, # Where to get source code to build
                cloud_assembly_artifact=cloud_assembly_artifact, # Where to place built source
            )
        )
{{</highlight>}}

### Component Breakdown
The above code does several things:

* `source_artifact`/`cloud_assembly_artifact`: These will store our source code and [cloud assembly](https://docs.aws.amazon.com/cdk/latest/guide/apps.html#apps_cloud_assembly) respectively
* `pipelines.CdkPipeline(...)`: This initializes the pipeline with the required values. This will serve as the base component moving forward. Every pipeline requires at bare minimum:
    * `code_pipeline_actions.CodeCommitSourceAction(...)`: The `source_action` of the pipeline will check the designated repository for source code and generate an artifact.
    * `pipelines.SimpleSynthAction(...)`: The `synth_action` of the pipeline will take the source artifact generated in by the `source_action` and build the application based on the `synth_command` in a CodeBuild container setup using the `install_commands`.

## Deploy Pipeline and See Result
All that's left to get our pipeline up and running is to commit our changes and run one last cdk deploy. 

```
git commit -am "MESSAGE" && git push
npx cdk deploy
```

CdkPipelines auto-update for each commit in a source repo, so this is the *last time* we will need to execute this command!

Once deployment is finished, you can go to the [CodePipeline console](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) and you will see a new pipeline! If you navigate to it, it should look like this:

![](./pipeline-init.png)
