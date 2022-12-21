+++
title = "Create Construct Lib - Construct Code"
weight = 300
+++

## Create Construct Lib - Construct

Create a construct library project leveraging Projen to synthesize and manage project configuration files.  Then add the HitCounter Construct to project structure.  Then configure it to transpile Construct to selected targets.  We will use the [HitCounter Construct](../../40-hit-counter/200-handler.html) built earlier in this workshop.

### Setup Projen project

Create a directory named `constructs/` as a sibling (on the same level) of the `pipeline/` directory.

{{<highlight bash>}}
mkdir constructs
cd constructs
{{</highlight>}}

Run `projen new` to scaffold an awscdk-construct type Projen project

{{<highlight js>}}
npx projen new awscdk-construct \
  --build-workflow false \
  --github false \
  --default-release-branch main \
  --no-git \
  --name "cdkworkshop-lib"
{{</highlight>}}

This `projen new` command scaffold Projen awscdk-construct type project, with .projenrc.js file holding the Projen configurations.  

Open the file `.projenrc.js` and make the following two changes.

1. Import the ReleaseTrigger class from projen's library.
{{<highlight js>}}
const { ReleaseTrigger } = require("projen/lib/release");
{{</highlight>}}

2. After the `repositoryUrl` attribute add the following attributes listed below.  
{{<highlight js>}}

  description: 'CDK Construct Library by projen/jsii',
  /* Runtime dependencies of this module. */
  deps: [
    'cdk-dynamo-table-viewer',
  ],
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

`deps` attribute adds the dependency which projen will in turn add it to the `package.json` file.  

`python`, `dotnet` and `publishToMaven` attributes configures Projen telling it we are interested in transpiling the CDK Construct to those target runtimes.

`majorVersion` attribute is set to `1`, so we start with version `1.0.0` of packaged artifacts.

`releaseTrigger` is set to `manual`.  For every commit/push to the repository the pipeline later would do `projen release` which would automatically update the published artifacts version number.  Projen uses <a href="https://semver.org/" target="_blank">SEMVER</a> and <a href="https://www.conventionalcommits.org/en/v1.0.0/#specification" target="_blank">Conventional Commits</a> to figure out which part of the version to increment, for details refer <a href="https://projen.io/releases.html" target="_blank">Projen release documentation</a>.

#### Projen synth

Run `projen` from the `constructs` directory.  This will make projen synthesize configurations.  For instance, the package.json will have `cdk-dynamo-table-viewer` dependency base on what was added in `dependencies` section of `.projenrc.js`.

{{<highlight bash>}}
npx projen
{{</highlight>}}

After updating your `.projenrc.js` Projen configuration file will look like this, with perhaps differences in repositoryUrl and other changes you might have chosen

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
  /* Runtime dependencies of this module. */
  deps: [
    'cdk-dynamo-table-viewer',
  ],
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



### Add HitCounter Construct 

Copy `hitcounter.ts` into the `constructs/src` folder.  You would have created `hitcounter.ts` file as part of instructions in [hit-counter](../../40-hit-counter/300-resources.html) section.
Update `index.ts` in `constructs/src` folder with the following content.
{{<highlight js>}}
export * from './hitcounter';
{{</highlight>}}

Note: Projen only transpiles Typescript files in `src` folder 

### Projen tamper detection
Projen is opinionated and mandates that all project configuration be done through `.projenrc.js` file.  For instance if you directly change `package.json` then Projen would detect that during the release phase and would fail the release attempt.  Hence it is a good idea to do projen synth by running `projen` command on the `constructs/` directory where `.projenrc.js` file is, before pushing the code to Git repository.

### Push code to CodeCommit repository

Commit and push code with the specific Git commit message.  The commit message hints how the version number should be incremented, whether this is a major, minor or hot fix.  For details refer, <a href="https://www.conventionalcommits.org/en/v1.0.0/#specification" target="_blank">Conventional Commits</a>.

{{<highlight bash>}}
# This is to avoid Projen tamper related errors
npx projen
# This is to push to GIT
git add .
git commit -m 'feat: add HitCounter to Construct Library'
git push
{{</highlight>}}

### Extra credits (Optional)
#### How to generate jssi transpiled and jsii-packmak packaged target on my machine?

The `compile` command below needs to be run on `constructs` folder where `.projenrc.js` file is.  It will compile the typescript files in `src/` folder and place it on to `lib/` folder.
{{<highlight bash>}}
npx projen compile
{{</highlight>}}

The `package` command below will transpile to the target language and place it on the `dist/` directory.
{{<highlight bash>}}
npx projen package:js
{{</highlight>}}

Inspect `dist/js/` directory contents to see the generated artifact.


## Summary
In this section, we have created the ConstructLib code in a structure expected by the ConstructLib pipline code (that we created in previous section).  Next section we will look into how to create the pipeline instance from the pipeline CDK code which will then build, transpile, publish artifacts to private ConstructHub.