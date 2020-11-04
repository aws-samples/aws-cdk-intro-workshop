import * as cdk from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as codecommit from '@aws-cdk/aws-codecommit';
import { WorkshopPipelineStage } from './pipeline-stage';
import { ShellScriptAction, SimpleSynthAction, CdkPipeline } from "@aws-cdk/pipelines";

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // This creates a new CodeCommit repository called 'WorkshopRepo'
        const repo = new codecommit.Repository(this, 'WorkshopRepo', {
            repositoryName: "WorkshopRepo"
        });

        // Defines the artifact representing the sourcecode
        const sourceArtifact = new codepipeline.Artifact(); 
        // Defines the artifact representing the cloud assembly 
        // (cloudformation template + all other assets)
        const cloudAssemblyArtifact = new codepipeline.Artifact();

        // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
        const pipeline = new CdkPipeline(this, 'Pipeline', {
            pipelineName: 'WorkshopPipeline',
            cloudAssemblyArtifact,

            // Generates the source artifact from the repo we created in the last step
            sourceAction: new codepipeline_actions.CodeCommitSourceAction({
                actionName: 'CodeCommit', // Any Git-based source control
                output: sourceArtifact, // Indicates where the artifact is stored
                repository: repo // Designates the repo to draw code from
            }),

            // Builds our source code outlined above into a could assembly artifact
            synthAction: SimpleSynthAction.standardNpmSynth({
                sourceArtifact, // Where to get source code to build
                cloudAssemblyArtifact, // Where to place built source

                buildCommand: 'npm run build' // Language-specific build cmd
            })
        })

        const deploy = new WorkshopPipelineStage(this, 'Deploy');
        const deployStage = pipeline.addApplicationStage(deploy);
        deployStage.addActions(new ShellScriptAction({
            actionName: 'TestViewerEndpoint',
            useOutputs: {
                ENDPOINT_URL: pipeline.stackOutput(deploy.hcViewerUrl)
            },
            commands: [
                'curl -Ssf $ENDPOINT_URL'
            ]
        }));
        deployStage.addActions(new ShellScriptAction({
            actionName: 'TestAPIGatewayEndpoint',
            useOutputs: {
                ENDPOINT_URL: pipeline.stackOutput(deploy.hcEndpoint)
            },
            commands: [
                'curl -Ssf $ENDPOINT_URL/',
                'curl -Ssf $ENDPOINT_URL/hello',
                'curl -Ssf $ENDPOINT_URL/test'
            ]
        }));
    }
}