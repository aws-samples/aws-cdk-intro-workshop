+++
title = "Getting Started with Pipelines"
weight = 110
+++

> Note: This segment of the workshop assumes you have completed the previous sections of the workshop. If you have not, and just want to follow this segment, or you are returning to try this workshop, you can use the code [here](https://github.com/aws-samples/aws-cdk-intro-workshop/tree/master/code/java/main-workshop) that represents the last state of the project after adding the tests.

## Create Pipeline Stack
The first step is to create the stack that will contain our pipeline.
Since this is separate from our actual "production" application, we want this to be entirely self-contained.

Create a new file under `src/main/java/com/myorg` called `WorkshopPipelineStack.java`. Add the following to that file.

{{<highlight java>}}
package com.myorg;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;

public class PipelineStack extends Stack {
    public PipelineStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public PipelineStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        // Pipeline code goes here
    }
}
{{</highlight>}}

Look familiar? At this point, the pipeline is like any other CDK stack.

## Update CDK Deploy Entrypoint
Next, since the purpose of our pipeline is to deploy our application stack, we no longer want the main CDK application to deploy our original app. Instead, we can change the entry point to deploy our pipeline, which will in turn deploy the application.

To do this, edit the code in `src/main/java/com/myorg/CdkWorkshopApp.java` as follows:

{{<highlight java "hl_lines=9">}}
package com.myorg;

import software.amazon.awscdk.core.App;

public final class CdkWorkshopApp {
    public static void main(final String[] args) {
        App app = new App();

        new PipelineStack(app, "PipelineStack");

        app.synth();
    }
}
{{</highlight>}}

## Enable "New-Style" Synthesis
The construct `software.amazon.awscdk.pipelines` uses new core CDK framework features called "new style stack synthesis". In order to deploy our pipeline, we must enable this feature in our CDK configuration.

Edit the file `cdk.json` as follows:

{{<highlight json "hl_lines=3-5">}}
{
    "app": "mvn -e -q exec:java",
    "context": {
        "@aws-cdk/core:newStyleStackSynthesis": true
    }
}
{{</highlight>}}

This instructs the CDK to use those new features any time it synthesizes a stack (`cdk synth`).

## Special Bootstrap
There's one last step before we're ready. To have the necessary permissions in your account to deploy the pipeline, we must re-run `cdk bootstrap` with the addition of parameter `--cloudformation-execution-policies`. This will explicitly give the CDK full control over your account and switch over to the new bootstrapping resources enabled in the previous step.

```
npx cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

And now we're ready!

# Lets build a pipeline!
