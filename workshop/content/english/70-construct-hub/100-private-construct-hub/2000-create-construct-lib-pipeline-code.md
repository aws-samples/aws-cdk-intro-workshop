+++
title = "Create Construct Lib - pipeline code"
weight = 200
+++

## Create Construct Lib pipeline

Next, we'll set up the infrastructure that will deploy the construct Library into our private Construct Hub. Since this is separate from the "Private Construct Hub" infrastructure in the previous step, we'll want this code to be in its own directory. In your terminal, make sure you are in the parent directory of 'aws-cdk-workshop'

Navigate to <a href="https://console.aws.amazon.com/codecommit" target="_blank">CodeCommit</a> repository and create a remote repository named `construct-lib-repo`. Then clone the repository `construct-lib-repo` to your local machine (replace `<path>` in the code below with the URL to the newly created repository). 

{{<highlight bash>}}
git clone <path>
cd construct-lib-repo
{{</highlight>}}

Open this in your editor of choice.

Note: We will be working with Typescript, so make sure you have it installed. If not, run the following command in your terminal:

{{<highlight bash>}}
npm install -g typescript
{{</highlight>}}

Create a new folder called `pipeline` within the `/construct-lib-repo` directory. This will contain all the pipeline infrstructure. Then initialize a cdk typescript application
project.
{{<highlight bash>}}
mkdir pipeline
cd pipeline
cdk init app --language typescript
{{</highlight>}}

Open the `lib/pipeline-stack.ts`file and replace the code with the following:

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

This creates a CodePipline pipeline with two stages, a source stage linked to the CodeCommit GIT repository, and a CodeBuild project that does the build and release of the transpiled packaged artifacts.

## Update CDK Deploy Entrypoint

Next we need to change the entry point to deploy our pipeline. To do this, edit the code in `bin/pipeline.ts` as follows:

{{<highlight ts "hl_lines=2 5">}}
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

We'll use CodeBuild to actually build our project. CodeBuild needs a 'buildspec' file. A buildspec is a collection of build commands and related settings, in YAML format, that CodeBuild uses to run a build.

Run the following commands to create the buildspec file:
{{<highlight bash>}}
mkdir build-spec
touch build-spec/projen-release.yml
{{</highlight>}}

Now copy the following code and paste it into 'projen-release.yml':
    
{{<highlight yaml>}}
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

The first command in the build phase of this YAML file is `projen release`.  <a href="https://projen.io" target="_blank">Projen</a> helps us with taking care of the JSII compilation, unit testing, tamper detection and packaging.  We will dive deeper into Projen in next section.  Projen creates the transpiled packages and places them in the `dist` directory.

The other build phase commands look for the existence of runtime specific `dist` directories and set the runtime specific CodeArtifact environmental variables before publishing the artifacts using <a href="https://github.com/cdklabs/publib/blob/main/README.md" target="_blank">publib</a>.

## Summary
In this section, we created the pipeline code that will be used to build, package and push the ConstructLib code to our Private Construct Hub. In the next section we will set up Projen to create a construct library
