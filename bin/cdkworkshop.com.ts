#!/usr/bin/env node
import cdk = require('@aws-cdk/cdk');
import route53 = require('@aws-cdk/aws-route53');

class CdkWorkshop extends cdk.Stack {
    constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
        super(parent, name, props);

        const zone = new route53.PublicHostedZone(this, "HostedZone", {
            zoneName: "cdkworkshop.com",
        })

        new cdk.Output(this, "DNSNameservers", {
            description: "Nameservers for DNS zone",
            value: zone.nameServers,
        })

    }
}

const app = new cdk.App();
new CdkWorkshop(app, 'CDK-WORKSHOP-PROD', { env: { account: "025656461920", region: "eu-west-1" } });
app.run();