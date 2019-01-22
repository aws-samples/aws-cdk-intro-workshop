#!/usr/bin/env node
import cdk = require('@aws-cdk/cdk');
import route53 = require('@aws-cdk/aws-route53');
import cloudfront = require('@aws-cdk/aws-cloudfront');
import s3 = require('@aws-cdk/aws-s3');
import { GuardDutyNotifier } from './guardduty';
import { PolicyStatement, CanonicalUserPrincipal } from '@aws-cdk/aws-iam';
import s3deploy = require('@aws-cdk/aws-s3-deployment');
import path = require('path');
import { hashDirectorySync } from './hash';

interface CdkWorkshopProps extends cdk.StackProps {

    /**
     * The Domain the workshop should be hosted at
     */
    domain: string

    /**
     * The ARN of the Amazon Certificate Manager (ACM) certificate to use with CloudFront
     */
    certificate: string

    /**
     * Email address to use for AWS GuardDuty security finding notifications
     */
    email: string

    /**
     * If true, AWS WAF will be deployed in front of the workshop CloudFront
     * distribution, with a ruleset to only allow access from the Amazon corporate network
     */
    restrictToAmazonNetwork: boolean

    /**
     * The ARN of the AWS WAF WebACL that restricts access to the Amazon corporate network (should be deployed separately)
     */
    restrictToAmazonNetworkWebACL: string

    /**
     * If enabled, sets the max TTL to 0 in the CloudFront distribution.
     * @default false
     */
    disableCache?: boolean;
}

class CdkWorkshop extends cdk.Stack {

    constructor(scope: cdk.App, id: string, props: CdkWorkshopProps) {
        super(scope, id, props);

        // Enable AWS GuardDuty in this account, and send any security findings via email
        new GuardDutyNotifier(this, "GuardDuty", {
            environmentName: props.domain,
            email: props.email
        })

        // Create DNS Zone
        const zone = new route53.PublicHostedZone(this, 'HostedZone', {
            zoneName: props.domain,
        })

        // Bucket to hold the static website
        const bucket = new s3.Bucket(this, 'Bucket', {
            websiteIndexDocument: 'index.html'
        });

        const origin = new cloudfront.CfnCloudFrontOriginAccessIdentity(this, "BucketOrigin", {
            cloudFrontOriginAccessIdentityConfig: { comment: props.domain },
        })

        // Restrict the S3 bucket via a bucket policy that only allows our CloudFront distribution
        const bucketPolicy = new PolicyStatement()
        bucketPolicy.addPrincipal(new CanonicalUserPrincipal(origin.cloudFrontOriginAccessIdentityS3CanonicalUserId));
        bucketPolicy.addAction("s3:GetObject");
        bucketPolicy.addResource(bucket.bucketArn + "/*");
        bucketPolicy.allow();
        bucket.addToResourcePolicy(bucketPolicy);

        // Due to a bug in `BucketDeployment` (awslabs/aws-cdk#981) we must
        // deploy each version of the content to a different prefix (it's also a
        // good practice, but we plan to support that intrinsicly in
        // `BucketDeployment`).
        const contentDir = path.join(__dirname, '..', 'workshop', 'public');
        const contentHash = hashDirectorySync(contentDir);

        new s3deploy.BucketDeployment(this, 'DeployWebsite', {
            source: s3deploy.Source.asset(contentDir),
            destinationBucket: bucket,
            destinationKeyPrefix: contentHash,
            retainOnDelete: true
        });

        let acl: string | undefined
        if (props.restrictToAmazonNetwork) {
            acl = props.restrictToAmazonNetworkWebACL.toString()
        }

        const maxTtlSeconds = props.disableCache ? 0 : undefined;

        // CloudFront distribution
        const cdn = new cloudfront.CloudFrontWebDistribution(this, 'CloudFront', {
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.RedirectToHTTPS,
            priceClass: cloudfront.PriceClass.PriceClassAll,
            webACLId: acl,
            originConfigs: [{
                behaviors: [{
                    isDefaultBehavior: true,
                    maxTtlSeconds
                }],
                originPath: `/${contentHash}`,
                s3OriginSource: {
                    s3BucketSource: bucket,
                    originAccessIdentity: origin,
                }
            }],
            aliasConfiguration: {
                names: [props.domain],
                acmCertRef: props.certificate,
            },
        })

        // DNS alias for the CloudFront distribution
        // Having to use L1 construct here as currently only TXT/NS records can be created with the L2 construct
        // https://github.com/awslabs/aws-cdk/issues/966
        new route53.CfnRecordSet(this, 'CloudFrontDNSRecord', {
            name: props.domain + '.',
            hostedZoneId: zone.hostedZoneId,
            type: 'A',
            aliasTarget: {
                hostedZoneId: cdn.aliasHostedZoneId, // Always used for CloudFront in any region
                dnsName: cdn.domainName,
            },
        });

        // Configure Outputs

        new cdk.Output(this, 'URL', {
            description: 'The URL of the workshop',
            value: 'https://' + props.domain,
        })

        new cdk.Output(this, 'CloudFrontURL', {
            description: 'The CloudFront distribution URL',
            value: 'https://' + cdn.domainName,
        })

        new cdk.Output(this, 'CertificateArn', {
            description: 'The SSL certificate ARN',
            value: props.certificate,
        })

        if (zone.hostedZoneNameServers) {
            new cdk.Output(this, 'Nameservers', {
                description: 'Nameservers for DNS zone',
                value: cdk.Fn.join(', ', zone.hostedZoneNameServers)
            })
        }

    }
}

const app = new cdk.App();

new CdkWorkshop(app, 'CDK-WORKSHOP-PROD', {
    env: { account: '025656461920', region: 'eu-west-1' },
    domain: 'cdkworkshop.com',
    certificate: 'arn:aws:acm:us-east-1:025656461920:certificate/c75d7a9d-1253-4506-bc6d-5874767b3c35',
    email: 'aws-cdk-workshop@amazon.com',
    restrictToAmazonNetwork: false,
    restrictToAmazonNetworkWebACL: cdk.Fn.importValue('AMAZON-CORP-NETWORK-ACL:AmazonNetworkACL'),
    disableCache: true
});

app.run();
