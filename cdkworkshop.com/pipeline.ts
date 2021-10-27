import { Stack, StackProps, SecretValue } from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { TheCdkWorkshopStage } from './cdkworkshop.com';
import { Construct } from 'constructs';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: 'WorkshopPipeline',

      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub('aws-samples/aws-cdk-intro-workshop', 'master', {
          authentication: SecretValue.secretsManager('github-token'),
        }),
        commands: [
          'npm ci && tar -C /usr/local/bin -xzf hugo/hugo_*_Linux-64bit.tar.gz hugo',
          'npm run build',
        ],
      }),
    });

    pipeline.addStage(new TheCdkWorkshopStage(this, 'Prod'));

    const failTopic = new sns.Topic(this, 'PipelineFailTopic');

    failTopic.addSubscription(new subs.EmailSubscription(
      'aws-sdk-opensource-support-cdk-primary@amazon.com'
    ));

    const failEvent = new events.Rule(this, 'PipelineFailedEvent', {
      eventPattern: {
        source: [ 'aws.codepipeline' ],
        detailType: [ 'CodePipeline Pipeline Execution State Change' ],
        detail: {
          'state': [ 'FAILED' ],
          'pipeline': [ 'WorkshopPipeline' ]
        },
      }
    });

    failEvent.addTarget(new targets.SnsTopic(failTopic, {
      message: events.RuleTargetInput.fromText(
        `The Pipeline '${events.EventField.fromPath('$.detail.pipeline')}' has ${events.EventField.fromPath('$.detail.state')}`)
    }));
  }
}
