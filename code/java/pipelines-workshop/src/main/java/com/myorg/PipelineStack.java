package com.myorg;

import software.amazon.awscdk.core.Stack;

import java.util.Arrays;

import com.myorg.WorkshopPipelineStage;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.StackProps;

import software.amazon.awscdk.services.codecommit.Repository;
import software.amazon.awscdk.services.codepipeline.Artifact;
import software.amazon.awscdk.services.codepipelineactions.CodeCommitSourceAction;
import software.amazon.awscdk.pipelines.CdkPipeline;
import software.amazon.awscdk.pipelines.SimpleSynthAction;

public class WorkshopPipelineStack extends Stack {
    public PipelineStack(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public PipelineStack(final Construct scope, final String id, final StackProps props) {
        super(parent, id, props);

        final Repository repo = Repository.Builder.create(this, "WorkshopRepo")
            .repositoryName("WorkshopRepo")
            .build();

        final Artifact sourceArtifact = new Artifact();
        final Artifact cloudAssemblyArtifact = new Artifact();

        final CdkPipeline pipeline = CdkPipeline.Builder.create(this, "Pipeline")
            .pipelineName("WorkshopPipeline")
            .cloudAssemblyArtifact(cloudAssemblyArtifact)
            .sourceAction(CodeCommitSourceAction.Builder.create()
                .actionName("CodeCommit")
                .output(sourceArtifact)
                .repository(repo))
            .synthAction(SimpleSynthAction.standardNpmSynth(Map.of(
                "sourceArtifact", sourceArtifact,
                "cloudAssemblyArtifact", cloudAssemblyArtifact,
                "buildCommand", "npmrunbuild")))
            .build();

        final WorkshopPipelineStage deploy = new WorkshopPipelineStage(this, "Deploy");
        final CdkStage deployStage = pipeline.addApplicationStage(deploy);
        deployStage.addActions(ShellScriptAction.Builder.create()
            .actionName("TestViewerEndpoint")
            .useOutputs(Map.of(
                "ENDPOINT_URL", pipeline.stackOutput(deploy.hcViewerUrl)
            ))
            .commands(Arrays.asList(new String[] {
                "curl -Ssf $ENDPOINT_URL"
            }))
            .build());
        deployStage.addActions(ShellScriptAction.Builder.create()
            .actionName("TestAPIGatewayEndpoint")
            .useOutputs(Map.of(
                "ENDPOINT_URL", pipeline.stackOutput(deploy.hcEndpoint)
            ))
            .commands(Arrays.asList(new String[] {
                "curl -Ssf $ENDPOINT_URL/",
                "curl -Ssf $ENDPOINT_URL/hello",
                "curl -Ssf $ENDPOINT_URL/test"
            }))
            .build());
    }
}
