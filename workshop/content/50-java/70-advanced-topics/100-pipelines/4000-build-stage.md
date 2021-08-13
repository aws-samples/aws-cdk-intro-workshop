+++
title = "Add Application to Pipeline"
weight = 140
+++

## Create Stage
At this point, you have a fully operating CDK pipeline that will automatically update itself on every commit, *BUT* at the moment, that is all it does. We need to add a stage to the pipeline that will deploy our application.

Create a new file in `CdkWorkshop` called `PipelineStage.cs` with the code below:

{{<highlight java>}}
package com.myorg;

import software.amazon.awscdk.core.Stage;
import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.StageProps;

public class PipelineStage extends Stage {
    public PipelineStage(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public PipelineStage(final Construct scope, final String id, final StageProps props) {
        super(scope, id, props);

        new CdkWorkshopStack(this, "WebService");
    }
}
{{</highlight>}}

All this does is declare a new `Stage` (component of a pipeline), and in that stage instantiate our application stack.

## Add stage to pipeline
Now we must add the stage to the pipeline by adding the following code to `PipelineStack.java`:

{{<highlight java "hl_lines=36 57-58">}}
package com.myorg;

import java.util.Arrays;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;

import software.amazon.awscdk.services.codecommit.Repository;
import software.amazon.awscdk.services.codepipeline.Artifact;
import software.amazon.awscdk.services.codepipeline.actions.CodeCommitSourceAction;
import software.amazon.awscdk.pipelines.CdkPipeline;
import software.amazon.awscdk.pipelines.SimpleSynthAction;

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
        pipeline.addApplicationStage(deploy);
    }
}
{{</highlight>}}

This imports and creates an instance of the `PipelineStage`. Later, you might instantiate this stage multiple times (e.g. you want a Production deployment and a separate devlopment/test deployment).

Then we add that stage to our pipeline (`pipepeline.addApplicationStage(deploy);`). An `ApplicationStage` in a CDK pipeline represents any CDK deployment action.

## Commit/Deploy
Now that we have added the code to deploy our application, all that's left is to commit and push those changes to the repo.

```
git commit -am "Add deploy stage to pipeline" && git push
```

Once that is done, we can go back to the [CodePipeline console](https://us-west-2.console.aws.amazon.com/codesuite/codepipeline/pipelines) and take a look as the pipeline runs (this may take a while).

![](./pipeline-succeed.png)

Success!
