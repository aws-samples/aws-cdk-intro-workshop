+++
title = "Cleanup"
weight = 700
+++

## Clean up
Time to clean up the resources created in this workshop

### Delete Cloudformation Stacks
To clean up the resources created in this section of the workshop, navigate to <a href="https://console.aws.amazon.com/cloudformation" target="_blank">CloudFormation</a> and delete the stacks named InternalConstructHubStack and ConstructPipelineStack.

### Delete CodeCommit Repo
Navigate to  <a href="https://console.aws.amazon.com/codecommit" target="_blank">CodeCommit</a> and delete the construct-lib-repo.

### Delete S3 Buckets
Navigate to  <a href="https://console.aws.amazon.com/s3" target="_blank">S3</a> and delete the buckets starting with "internalconstruct" and "constructpipeline". Good luck!

### Delete DynamoDB Table

### Reset Your NPM Registry
{{<highlight bash>}}
npm config set registry https://registry.npmjs.com/
{{</highlight>}}