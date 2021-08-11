package com.myorg;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;
import software.amazon.awscdk.core.CfnOutput;

import software.amazon.awscdk.services.codecommit.Repository;

import software.amazon.awscdk.services.codepipeline.Artifact;
import software.amazon.awscdk.pipelines.CdkPipeline;
import software.amazon.awscdk.pipelines.SimpleSynthAction;
import software.amazon.awscdk.pipelines.CdkStage;
import software.amazon.awscdk.pipelines.ShellScriptAction;
import software.amazon.awscdk.pipelines.StackOutput;

import software.amazon.awscdk.services.codepipeline.actions.CodeCommitSourceAction;

public class PipelineStack extends Stack {
    public PipelineStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public PipelineStack(final Construct parent, final String id, final StackProps props) {
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
                .installCommands(Arrays.asList("npm install -g aws-cdk")) // Commands to run before build
                .synthCommand("npx cdk synth") // Synth command (always same)
                .sourceArtifact(sourceArtifact) // Where to get source code to build
                .cloudAssemblyArtifact(cloudAssemblyArtifact) // Where to place built source
                .buildCommands(Arrays.asList("mvn package")) // Language-specific build cmds
                .build())
            .build();

        final PipelineStage deploy = new PipelineStage(this, "Deploy");
        final CdkStage deployStage = pipeline.addApplicationStage(deploy);

        final Map<String, StackOutput> TestViewerEndpointOutputs = new HashMap<>();
        TestViewerEndpointOutputs.put("ENDPOINT_URL", pipeline.stackOutput(deploy.hcViewerUrl));

        deployStage.addActions(ShellScriptAction.Builder.create()
            .actionName("TestViewerEndpoint")
            .useOutputs(TestViewerEndpointOutputs)
            .commands(Arrays.asList("curl -Ssf $ENDPOINT_URL"))
            .build());

        final Map<String, StackOutput> TestAPIGatewayEndpointOutputs = new HashMap<>();
        TestAPIGatewayEndpointOutputs.put("ENDPOINT_URL", pipeline.stackOutput(deploy.hcEndpoint));

        deployStage.addActions(ShellScriptAction.Builder.create()
            .actionName("TestAPIGatewayEndpoint")
            .useOutputs(TestAPIGatewayEndpointOutputs)
            .commands(Arrays.asList(
                "curl -Ssf $ENDPOINT_URL",
                "curl -Ssf $ENDPOINT_URL/hello",
                "curl -Ssf $ENDPOINT_URL/test"
            ))
            .build());
    }
}
