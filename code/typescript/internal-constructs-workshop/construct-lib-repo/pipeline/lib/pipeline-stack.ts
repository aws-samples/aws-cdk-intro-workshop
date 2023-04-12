import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline'
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions'
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam'
import { Effect } from 'aws-cdk-lib/aws-iam'
import { PipelineProject } from "aws-cdk-lib/aws-codebuild";
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";

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
    const sourceStage = pipeline.addStage({ stageName: 'Source' });
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
        CODEARTIFACT_DOMAIN: { value: props.codeArtifactDomain },
        AWS_ACCOUNT_ID: { value: this.account },
        CODEARTIFACT_REPOSITORY: { value: props.codeArtifactRepository }
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
      conditions: { "StringEquals": { "sts:AWSServiceName": "codeartifact.amazonaws.com" } },
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