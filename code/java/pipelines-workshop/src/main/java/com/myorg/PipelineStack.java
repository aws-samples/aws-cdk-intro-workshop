package com.myorg;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;

import software.amazon.awscdk.services.codecommit.Repository;

import software.amazon.awscdk.services.codepipeline.Artifact;
import software.amazon.awscdk.pipelines.CdkPipeline;
import software.amazon.awscdk.pipelines.SimpleSynthAction;
import software.amazon.awscdk.pipelines.CdkStage;
import software.amazon.awscdk.pipelines.ShellScriptAction;

import software.amazon.awscdk.services.codepipeline.actions.CodeCommitSourceAction;

public class WorkshopPipelineStack extends Stack {
    public WorkshopPipelineStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public WorkshopPipelineStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        // This creates a new CodeCommit repository called 'WorkshopRepo'
        final Repository repo = Repository.Builder.create(this, "WorkshopRepo")
            .repositoryName("WorkshopRepo")
            .build();

        // Defines the artifact representing the sourcecode
        final Artifact sourceArtifact = new Artifact();
        // Defines the artifact representing the cloud assembly 
        // (cloudformation template + all other assets)
        final Artifact cloudAssemblyArtifact = new Artifact();

        // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
        final CdkPipeline pipeline = CdkPipeline.Builder.create(this, "Pipeline")
            .pipelineName("WorkshopPipeline")
            .cloudAssemblyArtifact(cloudAssemblyArtifact)
            
            // Generates the source artifact from the repo we created in the last step
            .sourceAction(CodeCommitSourceAction.Builder.create()
                .actionName("CodeCommit") // Any Git-based source control
                .output(sourceArtifact) // Indicates where the artifact is stored
                .repository(repo) // Designates the repo to draw code from
                .build())
            
                // Builds our source code outlined above into a could assembly artifact
            .synthAction(SimpleSynthAction.Builder.create()
                .installCommands(List.of("npm install -g aws-cdk")) // Commands to run before build
                .synthCommand("npx cdk synth") // Synth command (always same)
                .sourceArtifact(sourceArtifact) // Where to get source code to build
                .cloudAssemblyArtifact(cloudAssemblyArtifact) // Where to place built source
                .buildCommands(List.of("mvn package")) // Language-specific build cmds
                .build())
            .build();

        final WorkshopPipelineStage deploy = new WorkshopPipelineStage(this, "Deploy");
        final CdkStage deployStage = pipeline.addApplicationStage(deploy);
        deployStage.addActions(ShellScriptAction.Builder.create()
            .actionName("TestViewerEndpoint")
            .useOutputs(Map.of("ENDPOINT_URL", deploy.hcViewerUrl))
            .commands(List.of("curl -Ssf $ENDPOINT_URL"))
            .build());
        deployStage.addActions(ShellScriptAction.Builder.create()
            .actionName("TestAPIGatewayEndpoint")
            .useOutputs(Map.of("ENDPOINT_URL", deploy.hcEndpoint))
            .commands(List.of(
                "curl -Ssf $ENDPOINT_URL",
                "curl -Ssf $ENDPOINT_URL/hello",
                "curl -Ssf $ENDPOINT_URL/test"
            ))
            .build());
    }
}