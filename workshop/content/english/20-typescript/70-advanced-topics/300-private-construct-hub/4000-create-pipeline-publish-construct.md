+++
title = "Create pipeline and publish construct"
weight = 400
+++

## Create ConstructLib Pipeline

Up to this point we have created the construct code in the `constructs/` directory and the pipeline code in the `pipeline/` directory.  Now deploy the Constructs pipeline:

{{<highlight bash>}}
cd pipeline
cdk deploy
{{</highlight>}}

## Publish artifact

Once `cdk deploy` creates the pipeline, it runs and publishes artifacts

In the AWS Console, go to <a href="https://console.aws.amazon.com/codesuite/codepipeline/pipelines" target="_blank">CodePipeline</a> and check out the pipeline run.  The pipeline will push the artifact to CodeArtifact.  Navigate to <a href="https://console.aws.amazon.com/codesuite/codeartifact/repositories" target="_blank">CodeArtifact</a> and observe that it has version `1.0.0` of the artifact


## Make a patch change and observe new version of artifact

Make small change to `constructs/src/hitcounter.ts`, perhaps to the Error message and commit with the following commit message (Commit message has to be crafted specifically since Projen uses <a href="https://www.conventionalcommits.org/en/v1.0.0/#specification" target="_blank">Conventional Commits</a> to infer the new version for the artifact)

{{<highlight bash>}}
git add .
git commit -m 'fix: fix error message'
git push
{{</highlight>}}

Now when the pipeline runs, it should publish an updated artifact with the last (Patch) part alone updated.   Navigate to <a href="https://console.aws.amazon.com/codesuite/codeartifact/repositories" target="_blank">CodeArtifact</a> and observe that it has version `1.0.1` of the artifact.

## Observe the artifacts in private construct hub

Navigate to the private construct hub URL detailed in [private construct Hub section](./1000-create-construct-hub.html)

Click on `Find constructs` button to view the published constructs.

## Summary
In this section, we have created the pipeline instance from the pipeline CDK code.  We saw that the pipeline built, transpiled, packaged and published the artifacts into private ConstructHub.  Next we will now look into how to consume the transpiled artifacts from private ConstructHub.
