+++
title = "Publish Construct"
weight = 400
+++

## Publish Construct

We have so far created the construct in the `constructs/` directory and the pipeline in the `pipeline/` directory.  Now deploy the infrastructure.

{{<highlight bash>}}
cd pipeline
cdk deploy
{{</highlight>}}

## Observe pipeline run and published artifact

In AWS Console, go to [CodePipeline](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) and see the pipeline run.  The pipeline would push the artifact to CodeArtifact.  Navigate to [CodeArtifact](https://console.aws.amazon.com/codesuite/codeartifact/repositories) and observe that it has version `1.0.0` of the artifact


## Make a patch change and observe new version of artifact

Make small change to `constructs/src/hitcounter.ts`, perhaps to the Error message and commit with the following commit message (Commit message has to be crafted specifically since Projen uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#specification) to infer the new version for the artifact)

{{<highlight bash>}}
git add .
git commit -m 'fix: fix error message'
git push
{{</highlight>}}

Now when the pipeline runs, it should publish an updated artifact with the last (Patch) part alone updated.   Navigate to [CodeArtifact](https://console.aws.amazon.com/codesuite/codeartifact/repositories) and observe that it has version `1.0.1` of the artifact.

## Observe the artifacts in private construct hub

Navigate to the private construct hub URL detailed in [private construct Hub section](../100-TODO)

Click on `Find constructs` button to view the published constructs. 