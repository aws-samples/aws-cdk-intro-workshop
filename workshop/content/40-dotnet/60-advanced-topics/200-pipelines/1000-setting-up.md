+++
title = "Getting Started with Pipelines"
weight = 110
+++

> Note: This segment of the workshop assumes you have completed the previous sections of the workshop. If you have not, and just want to follow this segment, or you are returning to try this workshop, you can use the code [here](https://github.com/aws-samples/aws-cdk-intro-workshop/tree/master/code/csharp/main-workshop) that represents the last state of the project after adding the tests.

## Create Pipeline Stack
The first step is to create the stack that will contain our pipeline.
Since this is separate from our actual "production" application, we want this to be entirely self-contained.

Create a new file under `src/CdkWorkshop` called `CdkWorkshop/WorkshopPipelineStack.cs`. Add the following to that file.

{{<highlight ts>}}
using Amazon.CDK;

namespace CdkWorkshop
{
    public class WorkshopPipelineStack : Stack
    {
        public WorkshopPipelineStack(Construct parent, string id, IStackProps props = null) : base(parent, id, props)
        {
            // Pipeline code goes here
        }
    }
}
{{</highlight>}}

Look familiar? At this point, the pipeline is like any other CDK stack.

## Update CDK Deploy Entrypoint
Next, since the purpose of our pipeline is to deploy our application stack, we no longer want the main CDK application to deploy our original app. Instead, we can change the entry point to deploy our pipeline, which will in turn deploy the application.

To do this, edit the code in `CdkWorkshop/Program.cs` as follows:

{{<highlight ts "hl_lines=10">}}
using Amazon.CDK;

namespace CdkWorkshop
{
    class Program
    {
        static void Main(string[] args)
        {
            var app = new App();
            new WorkshopPipelineStack(app, "WorkshopPipelineStack");

            app.Synth();
        }
    }
}

{{</highlight>}}

## Enable "New-Style" Synthesis
The construct `@aws-cdk/pipelines` uses new core CDK framework features called "new style stack synthesis". In order to deploy our pipeline, we must enable this feature in our CDK configuration.

Edit the file `cdk.json` as follows:

{{<highlight json "hl_lines=4">}}
{
  "app": "dotnet run -p src/CdkWorkshop/CdkWorkshop.csproj",
  "context": {
    "@aws-cdk/core:newStyleStackSynthesis": true,
    "@aws-cdk/core:enableStackNameDuplicates": "true",
    "aws-cdk:enableDiffNoFail": "true",
    "@aws-cdk/core:stackRelativeExports": "true",
    "@aws-cdk/aws-ecr-assets:dockerIgnoreSupport": true,
    "@aws-cdk/aws-secretsmanager:parseOwnedSecretName": true,
    "@aws-cdk/aws-kms:defaultKeyPolicies": true,
    "@aws-cdk/aws-s3:grantWriteWithoutAcl": true
  }
}
{{</highlight>}}

This instructs the CDK to use those new features any time it synthesizes a stack (`cdk synth`).

## Special Bootstrap
There's one last step before we we're ready. To have the necessary permissions in your account to deploy the pipeline, we must re-run `cdk bootstrap` with the addition of parameter `--cloudformation-execution-policies`. This will explicitly give the CDK full control over your account and switch over to the new bootstrapping resources enabled in the previous step.

```
cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

And now we're ready!

# Lets build a pipeline!
