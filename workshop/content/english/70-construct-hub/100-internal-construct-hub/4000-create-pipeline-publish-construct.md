+++
title = "Create pipeline and publish construct"
weight = 400
+++

## Create ConstructLib Pipeline

Up to this point we have created the construct code in the `constructs/` directory and the pipeline code in the `pipeline/` directory. Now deploy the Constructs pipeline:

{{<highlight bash>}}
cd pipeline
cdk deploy
{{</highlight>}}

## Publish artifact

Once `cdk deploy` creates the pipeline, it runs and publishes artifacts

In the AWS Console, go to <a href="https://console.aws.amazon.com/codesuite/codepipeline/pipelines" target="_blank">CodePipeline</a> and check out the pipeline run. The pipeline will push the artifact to CodeArtifact. Navigate to <a href="https://console.aws.amazon.com/codesuite/codeartifact/repositories" target="_blank">CodeArtifact</a> and observe that it has version `1.0.0` of the artifact

## Make a patch change and observe new version of artifact

Let's make a small change to our construct library code and commit the changes to CodeCommit. Open the file `constructs/lambda/hitcounter.js` and modify the log message to read the following:

{{<highlight ts>}}
console.log('downstream function response:', JSON.stringify(resp, undefined, 2));
{{</highlight>}}

The whole code will look as follows:

{{<highlight ts>}}
const { DynamoDB, Lambda } = require('aws-sdk');

exports.handler = async function(event) {
console.log("request:", JSON.stringify(event, undefined, 2));

// create AWS SDK clients
const dynamo = new DynamoDB();
const lambda = new Lambda();

// update dynamo entry for "path" with hits++
await dynamo.updateItem({
TableName: process.env.HITS_TABLE_NAME,
Key: { path: { S: event.path } },
UpdateExpression: 'ADD hits :incr',
ExpressionAttributeValues: { ':incr': { N: '1' } }
}).promise();

// call downstream function and capture response
const resp = await lambda.invoke({
FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
Payload: JSON.stringify(event)
}).promise();

console.log('downstream function response:', JSON.stringify(resp, undefined, 2));

// return response back to upstream caller
return JSON.parse(resp.Payload);
};
{{</highlight>}}

Commit the changes to CodeCommit with the following commit message (Commit message has to be crafted specifically since Projen uses <a href="https://www.conventionalcommits.org/en/v1.0.0/#specification" target="_blank">Conventional Commits</a> to infer the new version for the artifact):

{{<highlight bash>}}
cd ..
cd constructs
git add .
git commit -m 'fix: modified log message'
git push
{{</highlight>}}

Now when the pipeline runs, it should publish an updated artifact with the last (Patch) part alone updated. Navigate to <a href="https://console.aws.amazon.com/codesuite/codeartifact/repositories" target="_blank">CodeArtifact</a> and observe that it has version `1.0.1` of the artifact.

![](./code-artifact-cdkworkshop-lib-1.0.1.png)

## Observe the artifacts in the Internal Construct Hub

Navigate to the internal construct hub URL detailed in the [Create Construct Hub](./1000-create-construct-hub.html) section. Click on the `Find constructs` button to view the published constructs.

![](./internal-construct-hub-website-search.png)

Select the `cdkworkshop-lib` tile to display the details of the published construct.

![](./internal-construct-hub-website-details.png)

## Summary

In this section, we have created the pipeline instance from the pipeline CDK code. We saw that the pipeline built, transpiled, packaged and published the artifacts into our Internal Construct Hub. Next we will look into how to consume the transpiled artifacts from the Internal Construct Hub.
