#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import route53 = require('@aws-cdk/aws-route53');
import route53Targets = require('@aws-cdk/aws-route53-targets');
import cloudfront = require('@aws-cdk/aws-cloudfront');
import s3 = require('@aws-cdk/aws-s3');
import { GuardDutyNotifier } from './guardduty';
import s3deploy = require('@aws-cdk/aws-s3-deployment');
import path = require('path');
import { hashDirectorySync } from './hash';
import { PipelineStack } from './pipeline';

export interface CdkWorkshopProps extends cdk.StackProps {

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

export class CdkWorkshop extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props: CdkWorkshopProps) {
        super(scope, id, props);

        this.renameLogicalId('CloudFrontDNSRecord46217411', 'CloudFrontDNSRecord');

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

        const origin = new cloudfront.OriginAccessIdentity(this, "BucketOrigin", {
            comment: props.domain,
        });
        (origin.node.defaultChild as cloudfront.CfnCloudFrontOriginAccessIdentity).overrideLogicalId('BucketOrigin');

        // Due to a bug in `BucketDeployment` (awslabs/aws-cdk#981) we must
        // deploy each version of the content to a different prefix (it's also a
        // good practice, but we plan to support that intrinsicly in
        // `BucketDeployment`).
        const contentDir = path.join(__dirname, '..', 'workshop', 'public');
        const contentHash = hashDirectorySync(contentDir);

        new s3deploy.BucketDeployment(this, 'DeployWebsite', {
            sources: [
                s3deploy.Source.asset(contentDir)
            ],
            destinationBucket: bucket,
            destinationKeyPrefix: contentHash,
            retainOnDelete: true
        });

        let acl: string | undefined
        if (props.restrictToAmazonNetwork) {
            acl = props.restrictToAmazonNetworkWebACL.toString()
        }

        const maxTtl = props.disableCache ? cdk.Duration.seconds(0) : undefined;

        // CloudFront distribution
        const cdn = new cloudfront.CloudFrontWebDistribution(this, 'CloudFront', {
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
            webACLId: acl,
            originConfigs: [{
                behaviors: [{
                    isDefaultBehavior: true,
                    maxTtl
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

        // TODO: Model dependency from CloudFront Web Distribution on S3 Bucket Deployment

        // DNS alias for the CloudFront distribution
        new route53.ARecord(this, 'CloudFrontDNSRecord', {
            recordName: props.domain + '.',
            zone,
            target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(cdn)),
        });

        // Configure Outputs

        new cdk.CfnOutput(this, 'URL', {
            description: 'The URL of the workshop',
            value: 'https://' + props.domain,
        })

        new cdk.CfnOutput(this, 'CloudFrontURL', {
            description: 'The CloudFront distribution URL',
            value: 'https://' + cdn.domainName,
        })

        new cdk.CfnOutput(this, 'CertificateArn', {
            description: 'The SSL certificate ARN',
            value: props.certificate,
        })

        if (zone.hostedZoneNameServers) {
            new cdk.CfnOutput(this, 'Nameservers', {
                description: 'Nameservers for DNS zone',
                value: cdk.Fn.join(', ', zone.hostedZoneNameServers)
            })
        }

    }
}

const ENV = { account: '025656461920', region: 'eu-west-1' };

export class TheCdkWorkshopStage extends cdk.Stage {
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id, { env: ENV });

        new CdkWorkshop(this, 'CloudFrontStack', {
            stackName: 'CDK-WORKSHOP-PROD',
            domain: 'cdkworkshop.com',
            certificate: 'arn:aws:acm:us-east-1:025656461920:certificate/c75d7a9d-1253-4506-bc6d-5874767b3c35',
            email: 'aws-cdk-workshop@amazon.com',
            restrictToAmazonNetwork: false,
            restrictToAmazonNetworkWebACL: cdk.Fn.importValue('AMAZON-CORP-NETWORK-ACL:AmazonNetworkACL'),
            disableCache: true
        });
    }
}

const app = new cdk.App();
new PipelineStack(app, 'WorkshopPipelineStack', { env: ENV });
app.synth();
