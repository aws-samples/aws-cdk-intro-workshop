import { Construct, Stack, StackProps, SecretValue } from '@aws-cdk/core';
import * as pipelines from '@aws-cdk/pipelines';
import * as cpipe from '@aws-cdk/aws-codepipeline';
import * as cpipe_actions from '@aws-cdk/aws-codepipeline-actions';
import { TheCdkWorkshopStage } from './cdkworkshop.com';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceArtifact = new cpipe.Artifact();
    const cloudAssemblyArtifact = new cpipe.Artifact();

    const pipeline = new pipelines.CdkPipeline(this, 'Pipeline', {
      pipelineName: 'WorkshopPipeline',
      cloudAssemblyArtifact,

      sourceAction: new cpipe_actions.GitHubSourceAction({
        actionName: 'GitHub',
        output: sourceArtifact,
        owner: 'aws-samples',
        repo: 'aws-cdk-intro-workshop',
        oauthToken: SecretValue.secretsManager('github-token'),
      }),

      synthAction: pipelines.SimpleSynthAction.standardNpmSynth({
        actionName: 'Synth',
        cloudAssemblyArtifact,
        sourceArtifact,
        subdirectory: 'cdkworkshop.com',

        // Hugo is necessary for the build -- install from included tarball
        installCommand: 'npm ci && tar -C /usr/local/bin -xzf hugo/hugo_*_Linux-64bit.tar.gz hugo',
        buildCommand: 'npm run build',
      }),
    });

    pipeline.addApplicationStage(new TheCdkWorkshopStage(this, 'Prod'));
  }
}
