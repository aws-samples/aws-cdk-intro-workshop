import {
    aws_guardduty as guardduty,
    aws_events as events,
    aws_events_targets as eventTargets,
    aws_sns as sns,
    aws_sns_subscriptions as subs,
    Stack,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface GuardDutyNotifierProps {

    // An environment name included in the notification email for identification purposes
    environmentName: string

    // The email address to send security findings to
    email: string
}

export class GuardDutyNotifier extends Construct {
    constructor(scope: Stack, id: string, props: GuardDutyNotifierProps) {
        super(scope, id);

        // Enable GuardDuty in the AWS region, to detect security issues
        new guardduty.CfnDetector(this, "GuardDutyDetector", { enable: true })

        // Configure GuardDuty to email any security findings
        const guardDutyTopic = new sns.Topic(this, "GuardDutyNotificationTopic");
        guardDutyTopic.addSubscription(new subs.EmailSubscription(props.email));
        const eventRule = new events.Rule(this, "GuardDutyEventRule", {
            eventPattern: {
                source: ["aws.guardduty"],
                detailType: ["GuardDuty Finding"],
            }
        })

        // Format the GuardDuty findings emails (rather than just a large splodge of JSON)
        eventRule.addTarget(new eventTargets.SnsTopic(guardDutyTopic, {
            message: events.RuleTargetInput.fromText(`WARNING: AWS GuardDuty has discovered a ${events.EventField.fromPath('$.detail.type')} security issue for ${props.environmentName} (${events.EventField.fromPath('$.region')}). Please go to https://${events.EventField.fromPath('$.region')}.console.aws.amazon.com/guardduty/ to find out more details.`)
        }));

    }
}
