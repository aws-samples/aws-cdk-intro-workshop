+++
title = "Create Construct Lib - Construct Code"
weight = 300
+++

## Create Construct Lib - Construct

Next, we will create a construct library project leveraging Projen to synthesize and manage project configuration files. Then we'll create a Construct called HitCounter. Lastly, we'll edit the configuration to transpile our Constructs to the selected runtime/language targets.

### Setup Projen project

Create a directory named `constructs/` as a sibling (on the same level) of the `pipeline/` directory.

{{<highlight bash>}}
mkdir constructs
cd constructs
{{</highlight>}}

Run the following command to scaffold an awscdk-construct type Projen project

{{<highlight js>}}
npx projen new awscdk-construct \
 --build-workflow false \
 --github false \
 --default-release-branch main \
 --no-git \
 --name "cdkworkshop-lib"
{{</highlight>}}

The `.projenrc.js` file holds the Projen configurations.

Open the file `.projenrc.js` and make the following two changes.

1. Import the ReleaseTrigger class from projen's library.
   {{<highlight js>}}
   const { ReleaseTrigger } = require("projen/lib/release");
   {{</highlight>}}

2. After the `repositoryUrl` attribute add the following attributes listed below.  
   {{<highlight js>}}

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

{{<highlight js>}}
const { awscdk } = require('projen');
const { ReleaseTrigger } = require('projen/lib/release');

const project = new awscdk.AwsCdkConstructLibrary({
author: 'CDK Workshop',
authorAddress: 'cdkworkshop@amazon.com',
buildWorkflow: false,
cdkVersion: '2.1.0',
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

The `python`, `dotnet` and `publishToMaven` attributes tell Projen it we are interested in transpiling the CDK Construct to those target runtimes.

The `majorVersion` attribute is set to `1`, so we start with version `1.0.0` of packaged artifacts.

The `releaseTrigger` attribute is set to `manual`. For every commit/push to the repository the pipeline later would do `projen release` which would automatically update the published artifacts version number. Projen uses <a href="https://semver.org/" target="_blank">SEMVER</a> and <a href="https://www.conventionalcommits.org/en/v1.0.0/#specification" target="_blank">Conventional Commits</a> to figure out which part of the version to increment, for details refer <a href="https://projen.io/releases.html" target="_blank">Projen release documentation</a>.

#### Projen synth

Run `projen` from the `constructs` directory. This will make projen synthesize configurations. For instance, the package.json will have `cdk-dynamo-table-viewer` dependency base on what was added in `dependencies` section of `.projenrc.js`.

{{<highlight bash>}}
npx projen
{{</highlight>}}

### Add HitCounter Construct

Create a new file `hitcounter.ts` in the `constructs/src` folder. Use the following code:

{{<highlight js>}}
import _ as lambda from "aws-cdk-lib/aws-lambda";
import _ as dynamodb from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";

export interface HitCounterProps {
/** the function for which we want to count url hits **/
readonly downstream: lambda.IFunction;
}

export class HitCounter extends Construct {
/\*_ allows accessing the counter function _/
public readonly handler: lambda.Function;

/\*_ the hit counter table _/
public readonly table: dynamodb.Table;

constructor(scope: Construct, id: string, props: HitCounterProps) {
super(scope, id);

    const table = new dynamodb.Table(this, "Hits", {
      partitionKey: { name: "path", type: dynamodb.AttributeType.STRING },
    });
    this.table = table;

    this.handler = new lambda.Function(this, "HitCounterHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "hitcounter.handler",
      code: lambda.Code.fromAsset("lambda"),
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

This is very similar to the [hit-counter](../../40-hit-counter/300-resources.html) construct from a previous section with some slight modifications.

Next, update `index.ts` in `constructs/src` folder with the following content.
{{<highlight js>}}
export \* from './hitcounter';
{{</highlight>}}

{{% notice info %}} Note: Projen only transpiles Typescript files in `src` folder {{% /notice %}}

Finally, lets add a simple test for our new construct to ensure the projen build process succeeds. Remove `hello.test.ts` file generated in the initial projen project setup in the `constructs\test` folder. Add a new file named `constructs.test.ts` to the `constructs\test` folder and insert the following code into it:
{{<highlight js>}}
import _ as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import _ as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter } from '../src/hitcounter';

test('DynamoDB Table Created', () => {
const stack = new cdk.Stack();
// WHEN
new HitCounter(stack, 'MyTestConstruct', {
downstream: new lambda.Function(stack, 'TestFunction', {
runtime: lambda.Runtime.NODEJS_14_X,
handler: 'index.handler',
code: lambda.Code.fromInline(`        exports.handler = async function(event) {
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

### Projen tamper detection

Projen is opinionated and mandates that all project configuration be done through `.projenrc.js` file. For instance if you directly change `package.json` then Projen will detect that during the release phase and will fail the release attempt. Hence, it is a good idea to do projen synth by running the `projen` command on the `constructs/` directory where the `.projenrc.js` file is before pushing the code to our CodeCommit repository.

{{<highlight bash>}}

# This is to avoid Projen tamper related errors

npx projen
{{</highlight>}}

### Push code to CodeCommit repository

Commit and push code with the specific Git commit message. The commit message hints how the version number should be incremented, whether this is a major, minor or hot fix. For details refer, <a href="https://www.conventionalcommits.org/en/v1.0.0/#specification" target="_blank">Conventional Commits</a>.

Ensure you push from the `construct-lib-repo` directory

{{<highlight bash>}}
git add .
git commit -m 'feat: add HitCounter to Construct Library'
git push
{{</highlight>}}

### Extra credits (Optional)

#### How to generate jssi transpiled and jsii-packmak packaged target on my machine?

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

In this section, we have created the ConstructLib code in a structure expected by the ConstructLib pipline code (that we created in previous section). Next section we will look into how to create the pipeline instance from the pipeline CDK code which will then build, transpile, publish artifacts to our Internal ConstructHub.
