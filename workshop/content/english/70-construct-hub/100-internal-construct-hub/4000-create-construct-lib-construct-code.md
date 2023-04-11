+++
title = "Create Construct Library - Construct Code"
weight = 400
+++

## Create Construct Library - Construct

Next, we will create a construct library project leveraging Projen to synthesize and manage project configuration files. Then, as an Internal Construct Hub Producer, we'll create a construct called `Hitcounter`. Lastly, we'll edit the configuration to transpile our constructs to the selected runtime/language targets.

### Set Up a Projen Project

From the `construct-lib-repo` directory, Create a directory named `constructs/`. It should be a sibling (on the same level) of the `pipeline/` directory.

{{<highlight bash>}}
mkdir constructs
cd constructs
{{</highlight>}}

Run the following command to scaffold an awscdk-construct type Projen project

{{<highlight javascript>}}
npx projen new awscdk-construct \
 --build-workflow false \
 --github false \
 --default-release-branch main \
 --no-git \
 --name "cdkworkshop-lib"
{{</highlight>}}

The `.projenrc.js` file holds the Projen configuration.

Open the file `.projenrc.js` and make the following two changes.

1. Import the ReleaseTrigger class from projen's library.
   {{<highlight javascript>}}
   const { ReleaseTrigger } = require('projen/lib/release');
   {{</highlight>}}

2. After the `repositoryUrl` attribute add the following attributes listed below.  
   {{<highlight javascript>}}
description: 'CDK Construct Library by projen/jsii',
python: {
distName: 'hitcounter',
module: 'cdkworkshop-lib',
},
dotnet: {
dotNetNamespace: 'CDKWorkshopLib',
packageId: 'com.cdkworkshop.HitCounter',
},
publishToMaven: {
javaPackage: 'com.cdkworkshop.hitcounter',
mavenArtifactId: 'constructs',
mavenGroupId: 'cdkworkshop-lib',
},
majorVersion: 1,
releaseTrigger: ReleaseTrigger.manual(),
{{</highlight>}}

The file should look something like this:

{{<highlight javascript>}}
const { awscdk } = require('projen');
const { ReleaseTrigger } = require('projen/lib/release');

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'CDK Workshop',
  authorAddress: 'cdkworkshop@amazon.com',
  buildWorkflow: false,
  cdkVersion: '[Insert Latest CDK Version]', //Make sure to update this value to the latest version
  defaultReleaseBranch: 'main',
  github: false,
  name: 'cdkworkshop-lib',
  releaseTagPrefix: 'cdkworkshop-lib',
  repositoryUrl: 'codecommit::us-east-1://construct-lib-repo',
  description: 'CDK Construct Library by projen/jsii',
  python: {
    distName: 'hitcounter',
    module: 'cdkworkshop-lib',
  },
  dotnet: {
    dotNetNamespace: 'CDKWorkshopLib',
    packageId: 'com.cdkworkshop.HitCounter',
  },
  publishToMaven: {
    javaPackage: 'com.cdkworkshop.hitcounter',
    mavenArtifactId: 'constructs',
    mavenGroupId: 'cdkworkshop-lib',
  },
  releaseTrigger: ReleaseTrigger.manual(),
  majorVersion: 1,
});

project.synth();
{{</highlight>}}

Make sure to replace the value of cdkVersion with the latest version (Version 2), which you can find here: <a href="https://docs.aws.amazon.com/cdk/api/versions.html" target="_blank">CDK Version</a>

The `python`, `dotnet` and `publishToMaven` attributes tell Projen to transpile the CDK Construct to those target runtimes.

The `majorVersion` attribute is set to `1`, so we start with version `1.0.0` of packaged artifacts.

The `releaseTrigger` attribute is set to `manual`. For every commit/push to the repository the pipeline later would do `projen release` which would automatically update the published artifacts version number. Projen uses <a href="https://semver.org/" target="_blank">SEMVER</a> and <a href="https://www.conventionalcommits.org/en/v1.0.0/#specification" target="_blank">Conventional Commits</a> to figure out which part of the version to increment, for details refer <a href="https://projen.io/releases.html" target="_blank">Projen release documentation</a>.

#### Projen Synth
Run `projen` from the `constructs` directory. This will make projen synthesize the configuration. Projen synthesizes project configuration files such as package.json, tsconfig.json, .gitignore, GitHub Workflows, eslint, jest, etc. from a well-typed definition written in JavaScript:

{{<highlight bash>}}
npx projen
{{</highlight>}}

#### Create Lambda Directory
Create a directory `lambda` in the root of the constructs directory (next to `src` and `test`):

{{<highlight bash>}}
mkdir lambda
{{</highlight>}}

#### Hit Counter Lambda Handler
We'll be reusing the [Hit counter lambda handler](../../20-typescript/40-hit-counter/200-handler.html) from the TypeScript workshop. 

Create the file `lambda/hitcounter.js`:
{{<highlight typescript>}}
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

  console.log('downstream response:', JSON.stringify(resp, undefined, 2));

  // return response back to upstream caller
  return JSON.parse(resp.Payload);
};
{{</highlight>}}

#### Add Hit Counter Construct

Create a new file `hitcounter.ts` in the `constructs/src` directory. Use the following code:

{{<highlight typescript>}}
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { Construct } from 'constructs';

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  readonly downstream: lambda.IFunction;

  /** the path to the hitcounter lambda directory. Doing it this way allows us to specify the path in the stack itself **/
  readonly hitcounterPath: string;
}

export class HitCounter extends Construct {
  /*_ allows accessing the counter function */
  public readonly handler: lambda.Function;

  /*_ the hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
    });
    this.table = table;

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hitcounter.handler',
      code: lambda.Code.fromAsset(props.hitcounterPath),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName,
      },
    });

    // grant the lambda role read/write permissions to our table
    table.grantReadWriteData(this.handler);

    // grant the lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler);

  }
}
{{</highlight>}}

This is very similar to the [Hitcounter construct](../../20-typescript/40-hit-counter/300-resources.html) from the TypeScript workshop with some slight modifications.

Next, update `index.ts` in `constructs/src` by adding the following code on line 1:
{{<highlight typescript>}}
export * from './hitcounter';
{{</highlight>}}

{{% notice info %}} Note: Projen only transpiles Typescript files in `src` folder {{% /notice %}}

Finally, lets add a simple test for our new construct to ensure the projen build process succeeds. Rename the `hello.test.ts` file found in `constructs\test` directory to `constructs.test.ts` and replace the contents with the following code:
{{<highlight typescript>}}
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter } from '../src/hitcounter';

test('DynamoDB Table Created', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    hitcounterPath: 'lambda',
    downstream: new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`exports.handler = async function(event) {
          console.log("event: ", event);
        };
     `),
    }),

  });
  // THEN
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::DynamoDB::Table', 1);
});
{{</highlight>}}

#### Projen Tamper Detection

Projen is opinionated and mandates that all project configuration be done through the `.projenrc.js` file. For instance if you directly change `package.json` then Projen will detect that during the release phase and will fail the release attempt. Hence, it is a good idea to do projen synth by running the `projen` command on the `constructs/` directory where the `.projenrc.js` file is before pushing the code to our CodeCommit repository.

{{<highlight bash>}}
# This is to avoid Projen tamper related errors
npx projen
{{</highlight>}}

## Push Initial Commit to CodeCommit Repository

Ensure you push from the `construct-lib-repo` directory:
{{<highlight bash>}}
git add .
git commit -m 'Initial Commit'
git push
{{</highlight>}}

### Extra Credit (Optional)

#### How Do I Generate JSSI Transpiled Packages Locally?

The `compile` command below needs to be run on `constructs` folder where `.projenrc.js` file is. It will compile the typescript files in `src/` folder and place it on to `lib/` folder.
{{<highlight bash>}}
npx projen compile
{{</highlight>}}

The `package` command below will transpile to the target language and place it on the `dist/` directory.
{{<highlight bash>}}
npx projen package:js
{{</highlight>}}

Inspect `dist/js/` directory contents to see the generated artifact.

## Summary

In this section, we structured the construct library construct code in a way that is expected by the construct library pipline code. In the next section we deploy the pipeline to build, transpile, and publish artifacts to our Internal Construct Hub.
