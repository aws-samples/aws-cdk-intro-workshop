+++
title = "Create New Pipeline"
weight = 130
+++

## Define an Empty Pipeline
Now we are ready to define the basics of the pipeline.

We will be using several new packages here, so first add the following to `pom.xml`:
{{<highlight html>}}
<dependency>
    <groupId>software.amazon.awscdk</groupId>
    <artifactId>codepipeline</artifactId>
    <version>VERSION</version>
</dependency>
        <dependency>
    <groupId>software.amazon.awscdk</groupId>
    <artifactId>codepipeline-actions</artifactId>
    <version>VERSION</version>
</dependency>
<dependency>
    <groupId>software.amazon.awscdk</groupId>
    <artifactId>cdk-pipelines</artifactId>
    <version>VERSION</version>
</dependency>
{{</highlight>}}

Return to the file `PipelineStack.java` and edit as follows:

{{<highlight java "hl_lines=9-11 13 28-55">}}
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
    }
}
{{</highlight>}}

### Component Breakdown
The above code does several things:

* `sourceArtifact`/`cloudAssemblyArtifact`: These will store our source code and [cloud assembly](https://docs.aws.amazon.com/cdk/latest/guide/apps.html#apps_cloud_assembly) respectively
* `CdkPipeline.Builder(...)`: This initializes the pipeline with the required values. This will serve as the base component moving forward. Every pipeline requires at bare minimum:
    * `CodeCommitSourceAction.Builder(...)`: The `sourceAction` of the pipeline will check the designated repository for source code and generate an artifact.
    * `SimpleSynthAction.Builder(...)`: The `synthAction` of the pipeline will take the source artifact generated in by the `sourceAction` and build the application based on the `buildCommands`. This is always followed by `npx cdk synth`

## Deploy Pipeline and See Result
All that's left to get our pipeline up and running is to commit our changes and run one last cdk deploy.

```sh
git commit -am "MESSAGE" && git push
mvn package
npx cdk deploy
```

CdkPipelines auto-update for each commit in a source repo, so this is the *last time* we will need to execute this command!

Once deployment is finished, you can go to the [CodePipeline console](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) and you will see a new pipeline! If you navigate to it, it should look like this:

![](./pipeline-init.png)
