#!/usr/bin/env node
import cdk = require('@aws-cdk/cdk');
import route53 = require('@aws-cdk/aws-route53');
import cloudfront = require('@aws-cdk/aws-cloudfront');
import s3 = require('@aws-cdk/aws-s3');
import { GuardDutyNotifier } from './guardduty';
import { PolicyStatement, CanonicalUserPrincipal } from '@aws-cdk/aws-iam';

class CdkWorkshop extends cdk.Stack {

    public readonly domain = 'cdkworkshop.com';
    public readonly certificate = 'arn:aws:acm:us-east-1:025656461920:certificate/c75d7a9d-1253-4506-bc6d-5874767b3c35';
    public readonly email = 'aws-cdk-workshop@amazon.com';

    constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
        super(parent, name, props);

        // Enable AWS GuardDuty in this account, and send any security findings via email
        new GuardDutyNotifier(this, "GuardDuty", {
            environmentName: this.domain,
            email: this.email
        })

        // Create DNS Zone
        const zone = new route53.PublicHostedZone(this, 'HostedZone', {
            zoneName: this.domain,
        })

        // Bucket to hold the static website
        const bucket = new s3.Bucket(this, 'Bucket');
        const origin = new cloudfront.cloudformation.CloudFrontOriginAccessIdentityResource(this, "BucketOrigin", {
            cloudFrontOriginAccessIdentityConfig: { comment: this.domain }
        })

        // Restrict the S3 bucket via a bucket policy that only allows our CloudFront distribution
        const bucketPolicy = new PolicyStatement()
        bucketPolicy.addPrincipal(new CanonicalUserPrincipal(origin.cloudFrontOriginAccessIdentityS3CanonicalUserId));
        bucketPolicy.addAction("s3:GetObject");
        bucketPolicy.addResource(bucket.bucketArn + "/*");
        bucketPolicy.allow();
        bucket.addToResourcePolicy(bucketPolicy);

        // TODO: Create BucketDeployment for syncing workshop/public/* up to S3 once construct is available 

        // CloudFront distribution
        const cdn = new cloudfront.CloudFrontWebDistribution(this, 'CloudFront', {
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.RedirectToHTTPS,
            priceClass: cloudfront.PriceClass.PriceClassAll,
            originConfigs: [{
                behaviors: [{ isDefaultBehavior: true }],
                s3OriginSource: {
                    s3BucketSource: bucket,
                    originAccessIdentity: origin,
                }
            }],
            aliasConfiguration: {
                names: [this.domain],
                acmCertRef: this.certificate,
            }
        })

        // DNS alias for the CloudFront distribution
        // Having to use L1 construct here as currently only TXT/NS records can be created with the L2 construct
        // https://github.com/awslabs/aws-cdk/issues/966
        new route53.cloudformation.RecordSetResource(this, 'CloudFrontDNSRecord', {
            recordSetName: this.domain + '.',
            hostedZoneId: zone.hostedZoneId,
            type: 'A',
            aliasTarget: {
                hostedZoneId: 'Z2FDTNDATAQYW2', // Always used for CloudFront in any region
                dnsName: cdn.domainName,
            },
        });

        // Configure Outputs

        new cdk.Output(this, 'URL', {
            description: 'The URL of the workshop',
            value: 'https://' + this.domain,
        })

        new cdk.Output(this, 'CloudFrontURL', {
            description: 'The CloudFront distribution URL',
            value: 'https://' + cdn.domainName,
        })

        new cdk.Output(this, 'CertificateArn', {
            description: 'The SSL certificate ARN',
            value: this.certificate,
        })

        new cdk.Output(this, 'Nameservers', {
            description: 'Nameservers for DNS zone',
            value: new cdk.FnJoin(', ', zone.nameServers.resolve())
        })

    }
}

const app = new cdk.App();
new CdkWorkshop(app, 'CDK-WORKSHOP-PROD', { env: { account: '025656461920', region: 'eu-west-1' } });
app.run();