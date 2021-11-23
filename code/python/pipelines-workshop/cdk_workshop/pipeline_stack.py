from aws_cdk import (
    core,
    aws_codecommit as codecommit,
    aws_codepipeline as codepipeline,
    aws_codepipeline_actions as codepipeline_actions,
    pipelines as pipelines
)
from cdk_workshop.pipeline_stage import WorkshopPipelineStage

class WorkshopPipelineStack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Creates a CodeCommit repository called 'WorkshopRepo'
        repo = codecommit.Repository(
            self, 'WorkshopRepo',
            repository_name= "WorkshopRepo"
        )

        # The basic pipeline declaration. This sets the initial structure of our pipeline
        pipeline = pipelines.CodePipeline(
            self, 'Pipeline',
            synth=pipelines.CodeBuildStep(
                'SynthStep',
                input=pipelines.CodePipelineSource.code_commit(repo, 'master'),
                install_commands=[
                    'npm install -g aws-cdk',  # Installs the cdk cli on Codebuild
                    'pip install -r requirements.txt'  # Instructs Codebuild to install required packages
                ],
                commands=['npx cdk synth'],
            )
        )

        deploy = WorkshopPipelineStage(self, 'Deploy')
        deploy_stage = pipeline.add_stage(deploy)
        deploy_stage.add_post(
            pipelines.CodeBuildStep(
                'TestViewerEndpoint',
                project_name='TestViewerEndpoint',
                env_from_cfn_outputs={
                    'ENDPOINT_URL': deploy.hc_viewer_url,
                },
                commands=['curl -Ssf $ENDPOINT_URL']
            )
        )
        deploy_stage.add_post(
            pipelines.CodeBuildStep(
                'TestAPIGatewayEndpoint',
                project_name='TestAPIGatewayEndpoint',
                env_from_cfn_outputs={
                    'ENDPOINT_URL': deploy.hc_endpoint,
                },
                commands=[
                    'curl -Ssf $ENDPOINT_URL',
                    'curl -Ssf $ENDPOINT_URL/hello',
                    'curl -Ssf $ENDPOINT_URL/test'
                ]
            )
        )
