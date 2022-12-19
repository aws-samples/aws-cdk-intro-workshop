const { awscdk } = require('projen');
const { ReleaseTrigger } = require('projen/lib/release');

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'BEx',
  authorAddress: 'aplatono@amazon.com',
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