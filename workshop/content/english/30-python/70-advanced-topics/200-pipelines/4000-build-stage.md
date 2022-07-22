+++
title = "Add Application to Pipeline"
weight = 140
+++

## Create Stage
At this point, you have a fully operating CDK pipeline that will automatically update itself on every commit, *BUT* at the moment, that is all it does. We need to add a stage to the pipeline that will deploy our application.

Create a new file in `cdk_workshop` called `pipeline_stage.py` with the code below:

{{<highlight python>}}
from constructs import Construct
from aws_cdk import (
    Stage
)
from .cdk_workshop_stack import CdkWorkshopStack

class WorkshopPipelineStage(Stage):

    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        service = CdkWorkshopStack(self, 'WebService')

{{</highlight>}}

All this does is declare a new `core.Stage` (component of a pipeline), and in that stage instantiate our application stack.

## Add stage to pipeline
Now we must add the stage to the pipeline by adding the following code to `cdk_workshop/pipeline_stack.py`:

{{<highlight python "hl_lines=7 32-33">}}
from constructs import Construct
from aws_cdk import (
    Stack,
    aws_codecommit as codecommit,
    pipelines as pipelines,
)
from cdk_workshop.pipeline_stage import WorkshopPipelineStage

class WorkshopPipelineStack(Stack):
    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Creates a CodeCommit repository called 'WorkshopRepo'
        repo = codecommit.Repository(
            self, "WorkshopRepo", repository_name="WorkshopRepo"
        )

        pipeline = pipelines.CodePipeline(
            self,
            "Pipeline",
            synth=pipelines.ShellStep(
                "Synth",
                input=pipelines.CodePipelineSource.code_commit(repo, "master"),
                commands=[
                    "npm install -g aws-cdk",  # Installs the cdk cli on Codebuild
                    "pip install -r requirements.txt",  # Instructs Codebuild to install required packages
                    "npx cdk synth",
                ]
            ),
        )

        deploy = WorkshopPipelineStage(self, "Deploy")
        deploy_stage = pipeline.add_stage(deploy)
{{</highlight>}}

This imports and creates an instance of the `WorkshopPipelineStage`. Later, you might instantiate this stage multiple times (e.g. you want a Production deployment and a separate development/test deployment).

Then we add that stage to our pipeline (`pipeline.add_stage(deploy);`). A `Stage` in a CDK pipeline represents a set of one or more CDK Stacks that should be deployed together, to a particular environment.

## Commit/Deploy
Now that we have added the code to deploy our application, all that's left is to commit and push those changes to the repo.

```
git commit -am "Add deploy stage to pipeline" && git push
```

Once that is done, we can go back to the [CodePipeline console](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) and take a look as the pipeline runs (this may take a while).

![](./pipeline-succeed.png)

Success!
