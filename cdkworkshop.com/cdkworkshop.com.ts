#!/usr/bin/env node
import {
    aws_certificatemanager as acm,
    aws_cloudfront as cloudfront,
    aws_route53 as route53,
    aws_route53_targets as route53Targets,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,
    aws_cloudfront_origins as cloudfrontOrigins,
    App, CfnOutput, Duration, Fn, Stack, StackProps, Stage,
} from 'aws-cdk-lib';
import { GuardDutyNotifier } from './guardduty';
import path = require('path');
import { hashDirectorySync } from './hash';
import { PipelineStack } from './pipeline';
import { Construct } from 'constructs';

export interface CdkWorkshopProps extends StackProps {

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

export class CdkWorkshop extends Stack {

    constructor(scope: Construct, id: string, props: CdkWorkshopProps) {
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

        const maxTtl = props.disableCache ? Duration.seconds(0) : undefined;

        // CloudFront distribution
        const cert = acm.Certificate.fromCertificateArn(this, 'Certificate', props.certificate);
        const cdn = new cloudfront.Distribution(this, 'CloudFrontDistribution', {
            defaultBehavior: {
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                origin: new cloudfrontOrigins.S3Origin(bucket, {
                    originAccessIdentity: origin, originPath: `/${contentHash}`
                }),
                cachePolicy: new cloudfront.CachePolicy(this, 'CachePolicy', {
                    maxTtl,
                }),
                responseHeadersPolicy: new cloudfront.ResponseHeadersPolicy(this, 'ResponseHeadersPolicy', {
                    securityHeadersBehavior: {
                        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
                        contentTypeOptions: { override: true },
                        xssProtection: { protection: true, modeBlock: true, override: true },
                        referrerPolicy: { referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, override: true },
                        strictTransportSecurity: { accessControlMaxAge: Duration.seconds(31536000), includeSubdomains: true, override: true },
                    }
                }),
            },
            webAclId: acl,
            priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
            certificate: cert,
            domainNames: [ props.domain ],
        });

        (cdn.node.defaultChild as cloudfront.CfnDistribution).overrideLogicalId('CloudFrontCFDistribution57EFBAC6');

        // TODO: Model dependency from CloudFront Web Distribution on S3 Bucket Deployment

        // DNS alias for the CloudFront distribution
        new route53.ARecord(this, 'CloudFrontDNSRecord', {
            recordName: props.domain + '.',
            zone,
            target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(cdn)),
        });

        // Configure Outputs

        new CfnOutput(this, 'URL', {
            description: 'The URL of the workshop',
            value: 'https://' + props.domain,
        })

        new CfnOutput(this, 'CloudFrontURL', {
            description: 'The CloudFront distribution URL',
            value: 'https://' + cdn.distributionDomainName,
        })

        new CfnOutput(this, 'CertificateArn', {
            description: 'The SSL certificate ARN',
            value: props.certificate,
        })

        if (zone.hostedZoneNameServers) {
            new CfnOutput(this, 'Nameservers', {
                description: 'Nameservers for DNS zone',
                value: Fn.join(', ', zone.hostedZoneNameServers)
            })
        }

    }
}

const ENV = { account: '025656461920', region: 'eu-west-1' };

export class TheCdkWorkshopStage extends Stage {
    constructor(scope: Construct, id: string) {
        super(scope, id, { env: ENV });

        new CdkWorkshop(this, 'CloudFrontStack', {
            stackName: 'CDK-WORKSHOP-PROD',
            domain: 'cdkworkshop.com',
            certificate: 'arn:aws:acm:us-east-1:025656461920:certificate/c75d7a9d-1253-4506-bc6d-5874767b3c35',
            email: 'aws-cdk-workshop@amazon.com',
            restrictToAmazonNetwork: false,
            restrictToAmazonNetworkWebACL: Fn.importValue('AMAZON-CORP-NETWORK-ACL:AmazonNetworkACL'),
            disableCache: true
        });
    }
}

const app = new App();
new PipelineStack(app, 'WorkshopPipelineStack', { env: ENV, terminationProtection: true });
app.synth();
