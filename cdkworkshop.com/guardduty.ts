import cdk = require('@aws-cdk/cdk');
import guardduty = require('@aws-cdk/aws-guardduty');
import events = require('@aws-cdk/aws-events');
import sns = require('@aws-cdk/aws-sns');

export interface GuardDutyNotifierProps {

    // An environment name included in the notification email for identification purposes
    environmentName: string

    // The email address to send security findings to
    email: string
}

export class GuardDutyNotifier extends cdk.Construct {
    constructor(scope: cdk.Stack, id: string, props: GuardDutyNotifierProps) {
        super(scope, id);

        // Enable GuardDuty in the AWS region, to detect security issues
        new guardduty.cloudformation.DetectorResource(this, "GuardDutyDetector", { enable: true })

        // Configure GuardDuty to email any security findings
        const guardDutyTopic = new sns.Topic(this, "GuardDutyNotificationTopic");
        guardDutyTopic.subscribeEmail("GuardDutyNotificationSubscription", props.email);
        const eventRule = new events.EventRule(this, "GuardDutyEventRule", {
            eventPattern: {
                source: ["aws.guardduty"],
                detailType: ["GuardDuty Finding"],
            }
        })

        // Format the GuardDuty findings emails (rather than just a large splodge of JSON)
        eventRule.addTarget(guardDutyTopic, {
            pathsMap: {
                "region": "$.region",
                "type": "$.detail.type",
            },
            textTemplate: "WARNING: AWS GuardDuty has discovered a <type> security issue for " + props.environmentName + " (<region>). Please go to https://<region>.console.aws.amazon.com/guardduty/ to find out more details.",
        })

    }
}