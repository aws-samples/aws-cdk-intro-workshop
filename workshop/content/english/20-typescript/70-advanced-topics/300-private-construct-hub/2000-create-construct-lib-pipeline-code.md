+++
title = "Create Construct Lib - pipeline code"
weight = 200
+++

## Create Construct Lib pipeline

Create an infrastructure that could deploy the construct Library into private Construct Hub.   Since this is separate from "private construct hub" infrastructure, create this to be entirely self-contained in a
separate repository.

Navigate to [**CodeCommit**](https://aws.amazon.com/codecommit/) repository and create a repository named "
construct-lib-repo". Clone the repository, "construct-lib-repo" to your local. 

{{<highlight bash>}}
git clone <<construct-lib-repo>>
{{</highlight>}}

Open this in your editor of choice.

Note: Since we will be working with Typescript, have it installed

{{<highlight bash>}}
npm install -g typescript
{{</highlight>}}

Create a new folder called `pipeline`. This would have all the pipeline infrstructure in it. Then create a typescript
project.
{{<highlight bash>}}
mkdir pipeline
cd pipeline
cdk init app --language typescript
{{</highlight>}}

Create a new file under `lib` called `lib/pipeline-stack.ts`. Add the following to that file.  This creates a CodePipline pipeline with two stages, a source stage linked to CodeCommit GIT repository and a CodeBuild project that does build and release of the transpiled packaged artifacts.

{{<highlight ts>}}
import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline'
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions'
import {Construct} from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam'
import {Effect} from 'aws-cdk-lib/aws-iam'
import {PipelineProject} from "aws-cdk-lib/aws-codebuild";
import {Artifact, Pipeline} from "aws-cdk-lib/aws-codepipeline";

interface ConstructPipelineStackProps extends cdk.StackProps {
    codeArtifactDomain: string;
    codeArtifactRepository: string;
    constructLibGitRepositoryName: string;
}

export class PipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ConstructPipelineStackProps) {
        super(scope, id, props);

        const sourceArtifact = new codepipeline.Artifact();

        const pipeline = new codepipeline.Pipeline(this, 'Pipeline');
        this.addSourceStageToPipeline(pipeline, sourceArtifact, props);
        this.addCodeBuildStageToPipeline(pipeline, sourceArtifact, props);
    }

    private addSourceStageToPipeline(pipeline: Pipeline, sourceArtifact: Artifact, props: ConstructPipelineStackProps) {
        const sourceStage = pipeline.addStage({stageName: 'Source'});
        sourceStage.addAction(new codepipeline_actions.CodeCommitSourceAction({
            actionName: 'Source',
            output: sourceArtifact,
            repository: codecommit.Repository.fromRepositoryName(this, 'ConstructLibRepository', props.constructLibGitRepositoryName),
            branch: "main",
            codeBuildCloneOutput: true
        }));
    }

    private addCodeBuildStageToPipeline(pipeline: Pipeline, sourceArtifact: Artifact, props: ConstructPipelineStackProps) {
        const constructBuildPackageAndReleaseBuildProject = new codebuild.PipelineProject(this, `ConstructBuildPackageAndReleaseCodeBuildProject`, {
            buildSpec: codebuild.BuildSpec.fromSourceFilename("pipeline/build-spec/projen-release.yml"),
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_6_0
            },
            environmentVariables: {
                CODEARTIFACT_DOMAIN: {value: props.codeArtifactDomain},
                AWS_ACCOUNT_ID: {value: this.account},
                CODEARTIFACT_REPOSITORY: {value: props.codeArtifactRepository}
            },
        });
        this.configureBuildProjectRolePolicy(constructBuildPackageAndReleaseBuildProject, props);

        const packageAndReleaseStage = pipeline.addStage({
            stageName: 'ConstructBuildPackageAndRelease'
        });

        packageAndReleaseStage.addAction(
            new codepipeline_actions.CodeBuildAction({
                actionName: 'ConstructBuildPackageAndRelease',
                project: constructBuildPackageAndReleaseBuildProject,
                input: sourceArtifact
            }));
    }

    private configureBuildProjectRolePolicy(constructBuildPackageAndReleaseBuildProject: PipelineProject, props: ConstructPipelineStackProps) {
        constructBuildPackageAndReleaseBuildProject.addToRolePolicy(new iam.PolicyStatement({
                actions: ['codeartifact:GetAuthorizationToken'],
                resources: [`arn:aws:codeartifact:${this.region}:${this.account}:domain/${props.codeArtifactDomain}`],
                effect: Effect.ALLOW
            }
        ));
        constructBuildPackageAndReleaseBuildProject.addToRolePolicy(new iam.PolicyStatement({
                actions: ['codeartifact:GetRepositoryEndpoint', 'codeartifact:ReadFromRepository'],
                resources: [`arn:aws:codeartifact:${this.region}:${this.account}:repository/${props.codeArtifactDomain}/${props.codeArtifactRepository}`],
                effect: Effect.ALLOW
            }
        ));
        constructBuildPackageAndReleaseBuildProject.addToRolePolicy(new iam.PolicyStatement({
                actions: ['codeartifact:PublishPackageVersion', 'codeartifact:PutPackageMetadata'],
                resources: [`arn:aws:codeartifact:${this.region}:${this.account}:package/${props.codeArtifactDomain}/${props.codeArtifactRepository}/*/*/*`],
                effect: Effect.ALLOW
            }
        ));
        constructBuildPackageAndReleaseBuildProject.addToRolePolicy(new iam.PolicyStatement({
                actions: ['sts:GetServiceBearerToken'],
                resources: ["*"],
                conditions: {"StringEquals": {"sts:AWSServiceName": "codeartifact.amazonaws.com"}},
                effect: Effect.ALLOW
            }
        ));
        constructBuildPackageAndReleaseBuildProject.addToRolePolicy(new iam.PolicyStatement({
                actions: ['codecommit:GitPull', 'codecommit:GitPush'],
                resources: [`arn:aws:codecommit:${this.region}:${this.account}:${props.constructLibGitRepositoryName}`],
                effect: Effect.ALLOW
            }
        ));
    }
}
{{</highlight>}}

Looks familiar? At this point, the pipeline is like any other CDK stack. Let us utilize the stack from our CDK app.

## Update CDK Deploy Entrypoint

We change the entry point to deploy Construct's pipeline.

To do this, edit the code in `bin/pipeline.ts` as follows:

{{<highlight ts "hl_lines=2 5">}}
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {PipelineStack} from '../lib/pipeline-stack';

const app = new cdk.App();
new PipelineStack(app, 'ConstructPipelineStack', {
    codeArtifactDomain: "cdkworkshop-domain",
    codeArtifactRepository: "cdkworkshop-repository",
    constructLibGitRepositoryName: "construct-lib-repo"
});
{{</highlight>}}

And now we're ready!

## CodeBuild 

CodeBuild project has two phases,

### `install` Phase

As part of install phase, we get the project build requirements configured

### `build` Phase

As part of the build phase, we first do `projen release`.   [Projen](https://projen.io) helps us with taking care of the JSII compilation, unit testing, tamper detection and packaging.  We will look into more about Projen in next section.  Projen creates the transpiled packages and places them on `dist` directory.

Rest of build phase commands (Look into section in YAML below `phases/build/commands`), looks for existence of runtime specific `dist` directory and sets the runtime specific CodeArtifact's environmental variables, before publishing the artifacts using [publib](https://github.com/cdklabs/publib/blob/main/README.md).

Create the build specification for the CodeBuild project with the following content at location `pipeline/build-spec/projen-release.yml`.

{{<highlight yml>}}
version: 0.2

env:
  shell: "bash"
  git-credential-helper": "yes"

phases: 
  install: 
    runtime-versions: 
      python: "3.10"
      nodejs: "16"
      java: "corretto17"
      dotnet: "6.0"
    commands:
      - cd constructs
      - "npm install --location=global projen yarn"
      - "yarn install --check-files"
      - pip install git-remote-codecommit
#      Avoid detached head
      - git checkout main
      - git remote set-url origin `git remote -v | head -1 | cut -f1 -d " " | cut -f2 | sed 's/https:\/\/git-codecommit./codecommit::/g' | sed 's/.amazonaws.com\/v1\/repos\//:\/\//g'`
      - git config --global user.email "build-automation@amazon.com"
      - git config --global user.name "CodeBuild Automation"
  build:
    commands:
      - "projen release"
      - |-
        if [ -d "dist/js" ]; then
          echo "Uploading NPM package..."
          export NPM_TOKEN=`aws codeartifact get-authorization-token --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --query authorizationToken --output text`
          export NPM_REGISTRY=`aws codeartifact get-repository-endpoint --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --repository "${CODEARTIFACT_REPOSITORY}" --format npm --query repositoryEndpoint --output text | sed s~^https://~~`
          npx -p publib@latest publib-npm
          echo "Done uploading NPM package."
        else
          echo "dist/js was not found. Skipping NPM package upload."
        fi
        if [ -d "dist/python" ]; then
          echo "Uploading Python package..."
          export TWINE_USERNAME=aws
          export TWINE_PASSWORD=`aws codeartifact get-authorization-token --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --query authorizationToken --output text`
          export TWINE_REPOSITORY_URL=`aws codeartifact get-repository-endpoint --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --repository "${CODEARTIFACT_REPOSITORY}" --format pypi --query repositoryEndpoint --output text`
          npx -p publib@latest publib-pypi
          echo "Done uploading Python package."
        else
          echo "dist/python was not found. Skipping Python package upload."
        fi
        if [ -d "dist/dotnet" ]; then
          echo "Uploading NuGet package..."
          export NUGET_API_KEY=`aws codeartifact get-authorization-token --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --query authorizationToken --output text`
          export NUGET_SERVER="`aws codeartifact get-repository-endpoint --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --repository "${CODEARTIFACT_REPOSITORY}" --format nuget --query repositoryEndpoint --output text`v3/index.json"
          aws codeartifact login --tool dotnet --repository "${CODEARTIFACT_REPOSITORY}" --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}"
          npx -p publib@latest publib-nuget
          echo "Done uploading NuGet package."
        else
          echo "dist/dotnet was not found. Skipping NuGet package upload."
        fi
        if [ -d "dist/java" ]; then
          echo "Uploading Java package..."
          export MAVEN_USERNAME=aws
          export MAVEN_PASSWORD=`aws codeartifact get-authorization-token --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --query authorizationToken --output text`
          export MAVEN_REPOSITORY_URL=`aws codeartifact get-repository-endpoint --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --repository "${CODEARTIFACT_REPOSITORY}" --format maven --query repositoryEndpoint --output text`
          export MAVEN_SERVER_ID=codeartifact
          npx -p publib@latest publib-maven
          echo "Done uploading Java package."
        else
          echo "dist/java was not found. Skipping Java package upload."
        fi

reports: 
  test-reports: 
    files: 
      - "**/test-reports/junit.xml"
    file-format: "JUNITXML"

{{</highlight>}}

We could adjust the runtime-versions needed based on all the target languages we are transpiling the construct to.  

## Summary
In this section, we have created the pipeline code that would be used to build, package and push the ConstructLib code.  Next section we will look into how to structure the ConstructLib code.