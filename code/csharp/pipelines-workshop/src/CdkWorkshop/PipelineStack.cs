using Amazon.CDK;
using Amazon.CDK.AWS.CodeCommit;
using Amazon.CDK.AWS.CodePipeline;
using Amazon.CDK.AWS.CodePipeline.Actions;
using Amazon.CDK.Pipelines;
using System.Collections.Generic;
using System;

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

                    InstallCommand = string.Join(
                        "npm install -g aws-cdk",
                        "sudo apt-get install -y dotnet-sdk-3.1"
                    ),
                    BuildCommand = "dotnet build" // Language-specific build cmd
                })
            });

            var deploy = new WorkshopPipelineStage(this, "Deploy");
            var deployStage = pipeline.AddApplicationStage(deploy);
            deployStage.AddActions(new ShellScriptAction(new ShellScriptActionProps
            {
                ActionName = "TestViewerEndpoint",
                UseOutputs = new Dictionary<string, StackOutput> {
                    { "ENDPOINT_URL", pipeline.StackOutput(deploy.HCViewerUrl) }
                },
                Commands = new string[] {"curl -Ssf $ENDPOINT_URL"}
            }));
            deployStage.AddActions(new ShellScriptAction(new ShellScriptActionProps
            {
                ActionName = "TestAPIGatewayEndpoint",
                UseOutputs = new Dictionary<string, StackOutput> {
                    { "ENDPOINT_URL", pipeline.StackOutput(deploy.HCEndpoint) }
                },
                Commands = new string[] {
                    "curl -Ssf $ENDPOINT_URL/",
                    "curl -Ssf $ENDPOINT_URL/hello",
                    "curl -Ssf $ENDPOINT_URL/test"
                }
            }));
        }
    }
}
