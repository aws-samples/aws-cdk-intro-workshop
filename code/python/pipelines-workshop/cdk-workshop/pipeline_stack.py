from aws_cdk import (
    core,
    aws_codecommit as codecommit,
    aws_codepipeline as codepipeline,
    aws_codepipeline_actions as codepipeline_actions,
    pipelines as pipelines
)
from pipeline_stage import WorkshopPipelineStage

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

        deploy = WorkshopPipelineStage(self, 'Deploy')
        deploy_stage = pipeline.add_application_stage(deploy)
        deploy_stage.add_actions(pipelines.ShellScriptAction(
            action_name='TestViewerEndpoint',
            use_outputs={
                'ENDPOINT_URL': pipeline.stack_output(deploy.hc_viewer_url)
            },
            commands=['curl -Ssf $ENDPOINT_URL']
        ))
        deploy_stage.add_actions(pipelines.ShellScriptAction(
            action_name='TestAPIGatewayEndpoint',
            use_outputs={
                'ENDPOINT_URL': pipeline.stack_output(deploy.hc_endpoint)
            },
            commands=[
                'curl -Ssf $ENDPOINT_URL',
                'curl -Ssf $ENDPOINT_URL/hello',
                'curl -Ssf $ENDPOINT_URL/test'
            ]
        ))
