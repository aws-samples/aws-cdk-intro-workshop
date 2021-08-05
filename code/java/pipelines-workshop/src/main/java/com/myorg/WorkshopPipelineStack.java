package com.myorg;

import java.util.List;
import java.util.Map;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;
import software.amazon.awscdk.pipelines.CodeBuildStep;
import software.amazon.awscdk.pipelines.CodePipeline;
import software.amazon.awscdk.pipelines.CodePipelineSource;
import software.amazon.awscdk.pipelines.StageDeployment;
import software.amazon.awscdk.services.codecommit.Repository;

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

        // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
        CodePipeline pipeline = CodePipeline.Builder.create(this, "Pipeline")
                .pipelineName("WorkshopPipeline")
                .synth(CodeBuildStep.Builder.create("SynthStep")
                        .input(CodePipelineSource.codeCommit(repo, "master"))
                        .installCommands(List.of(
                                "npm install -g aws-cdk"   // Commands to run before build
                        ))
                        .commands(List.of(
                                "mvn package",            // Language-specific build commands
                                "npx cdk synth"           // Synth command (always same)
                        )).build())
                .build();

        final WorkshopPipelineStage deploy = new WorkshopPipelineStage(this, "Deploy");

        StageDeployment stageDeployment = pipeline.addStage(deploy);

        stageDeployment.addPost(
                CodeBuildStep.Builder.create("TestViewerEndpoint")
                        .projectName("TestViewerEndpoint")
                        .commands(List.of("curl -Ssf $ENDPOINT_URL"))
                        .envFromCfnOutputs(Map.of("ENDPOINT_URL", deploy.hcViewerUrl))
                        .build(),

                CodeBuildStep.Builder.create("TestAPIGatewayEndpoint")
                        .projectName("TestAPIGatewayEndpoint")
                        .envFromCfnOutputs(Map.of("ENDPOINT_URL", deploy.hcEndpoint))
                        .commands(List.of(
                                "curl -Ssf $ENDPOINT_URL",
                                "curl -Ssf $ENDPOINT_URL/hello",
                                "curl -Ssf $ENDPOINT_URL/test"
                        ))
                        .build()
        );
    }
}