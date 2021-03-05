+++
title = "Add a New Stage to the Pipeline"
weight = 4000
+++

## Updating the pipeline


Now let us add a new stage to the pipeline, where the stage will deploy the queue processor application stack we’ve just defined. Open `cdkworkshop/pipeline_stack.py` file and make the adjustments below, removing the `WorkshopPipelineStage` and adding the Queue Processor application stage. 

```python
from aws_cdk import (
    core,
    aws_codecommit as codecommit,
    aws_codepipeline as codepipeline,
    aws_codepipeline_actions as codepipeline_actions,
    pipelines as pipelines
)

from pipeline_stage import WorkshopPipelineStage
from queue_processor_stage import QueueProcessorStage


class WorkshopPipelineStack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
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
    
        queue_processor_stage = QueueProcessorStage(self, 'QueueProcessorStage')
        pipeline.add_application_stage(queue_processor_stage)
```

Let us have a look at what we are doing here:

1. We’ve defined an application for the queue processor stack, which extends the CDK Stage Interface. While this application currently consists of one stack only, you could group together more than one stacks that are part of the same application. If the stacks have resource dependencies, then the Pipeline construct ensures that the stacks within the same stage are deployed in the correct order.
2. We have defined a new stage in the pipeline referencing this application. In case of multiple environments (or) multiple accounts, you simply repeat this code snippet replacing the account and region values as necessary.
3. Since we are using the native CDK pipeline construct you don’t need docker installed on your Cloud9 because CDK handles the docker build for you and uploads the image it built into ECR.


We need to update our requirements.txt file to add `aws-cdk.aws_ecs_patterns` and `aws-cdk.aws_ecs` and ensure that the Code Build job will have the correct packages.

```
aws-cdk.core
aws-cdk.aws_lambda
aws-cdk.aws-apigateway
aws-cdk.pipelines
aws-cdk.aws_dynamodb
aws-cdk.aws_codecommit
aws-cdk.aws_codebuild
aws-cdk.aws_codepipeline
aws-cdk.aws_codepipeline_actions
aws-cdk.aws_ecs_patterns
aws-cdk.aws_ecs
cdk_dynamo_table_viewer
-e .
```

Now that we have the stack setup, let’s start deploying the stack 