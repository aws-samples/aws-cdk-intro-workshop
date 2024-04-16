+++
title = "Cleanup"
weight = 700
+++

## Cleanup

Time to clean up the resources created in this workshop:

### Delete the CodeCommit Repo

Navigate to  <a href="https://console.aws.amazon.com/codecommit" target="_blank">CodeCommit</a> and delete the `construct-lib-repo` repository.

### Delete the DynamoDB Table

Then navigate to <a href="https://console.aws.amazon.com/dynamodb" target="_blank">DynamoDB</a> and delete the `HelloCdkAppStack-HelloHitCounterHitsXXXXXXXX-XXXXXXXXXXXX` table.

### Remove and Delete the CodeArtifact Upstream Repositories

Run this command to disassociate all upstream repositories from the CodeArtifact domain:

{{<highlight bash>}}
aws codeartifact update-repository --repository cdkworkshop-repository --domain cdkworkshop-domain --upstreams --region [Insert Region]
{{</highlight>}}

Then run this command to delete the actual upstream repository (npm-store):

{{<highlight bash>}}
aws codeartifact delete-repository --domain cdkworkshop-domain --repository npm-store --region [Insert Region]
{{</highlight>}}

### Reset Your NPM Registry

{{<highlight bash>}}
npm config set registry https://registry.npmjs.com/
{{</highlight>}}

### Delete Cloudformation Stacks

To clean up the resources created in this section of the workshop, navigate to <a href="https://console.aws.amazon.com/cloudformation" target="_blank">CloudFormation</a> and delete the stacks named `InternalConstructHubStack`, `InternalConstructPipelineStack`, and `HelloCdkAppStack`.

### Delete S3 Buckets

Navigate to  <a href="https://console.aws.amazon.com/s3" target="_blank">S3</a> and delete the buckets (~11 of them) whose names begin with `internalconstruct`. Some may need to be emptied before deleting them. See the <a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/delete-bucket.html" target="_blank">Deleting a bucket</a> documentation for more information.

### Delete the construct-hub-workshop Directory

On your machine, delete the `construct-hub-workshop` directory.

{{< nextprevlinks >}}