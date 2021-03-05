+++
title = "Add a New Stage to the Pipeline"
weight = 4000
+++

## Updating the pipeline


Now let us add a new stage to the pipeline, where the stage will deploy the queue processor application stack we’ve just defined. Open `cdkworkshop/src/main/java/com/myorg/PipelineStack.java` file and make the adjustments below adding the queue processor application stage and removing the WorkshopPipelineStage built in the previous pipeline section.

```java
package com.myorg;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;

import software.amazon.awscdk.services.codecommit.Repository;

import software.amazon.awscdk.services.codepipeline.Artifact;
import software.amazon.awscdk.pipelines.CdkPipeline;
import software.amazon.awscdk.pipelines.SimpleSynthAction;

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

        final QueueProcessorStage queueProcessorStage = new QueueProcessorStage(this, "QueueProcessorStage");
        pipeline.addApplicationStage(queueProcessorStage);
    }
}
```

Let us have a look at what we are doing here:

1. We’ve defined an application for the queue processor stack, which extends the CDK Stage Interface. While this application currently consists of one stack only, you could group together more than one stacks that are part of the same application. If the stacks have resource dependencies, then the Pipeline construct ensures that the stacks within the same stage are deployed in the correct order.
2. We have defined a new stage in the pipeline referencing this application. In case of multiple environments (or) multiple accounts, you simply repeat this code snippet replacing the account and region values as necessary.
3. Since we are using the native CDK pipeline construct you don’t need docker installed on your Cloud9 because CDK handles the docker build for you and uploads the image it built into ECR.

Now that we have the stack setup, let’s start deploying the stack 