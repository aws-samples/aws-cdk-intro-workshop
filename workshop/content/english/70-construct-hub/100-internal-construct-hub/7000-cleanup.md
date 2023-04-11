+++
title = "Clean Up"
weight = 700
+++

## Clean Up

Time to clean up the resources created in this workshop:

### Delete Cloudformation Stacks

To clean up the resources created in this section of the workshop, navigate to <a href="https://console.aws.amazon.com/cloudformation" target="_blank">CloudFormation</a> and delete the stacks named `InternalConstructHubStack`, `InternalConstructPipelineStack`, and `HelloCdkAppStack`.

### Delete CodeCommit Repo

Navigate to  <a href="https://console.aws.amazon.com/codecommit" target="_blank">CodeCommit</a> and delete the `construct-lib-repo` repository.

### DynamoDB Table

Then navigate to <a href="https://console.aws.amazon.com/dynamodb" target="_blank">DynamoDB</a> and delete the table.

### Delete S3 Buckets

Navigate to  <a href="https://console.aws.amazon.com/s3" target="_blank">S3</a> and delete the buckets starting with "internalconstruct". Some may need to be emptied before deleting them.

### Reset Your NPM Registry

{{<highlight bash>}}
npm config set registry https://registry.npmjs.com/
{{</highlight>}}