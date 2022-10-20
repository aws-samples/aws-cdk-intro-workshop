#!/usr/bin/env node
import {
    aws_certificatemanager as acm,
    aws_cloudfront as cloudfront,
    aws_route53 as route53,
    aws_route53_targets as route53Targets,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,
    aws_cloudfront_origins as cloudfrontOrigins,
    App,
    CfnOutput,
    Duration,
    Fn,
    Stack,
    StackProps,
    Stage,
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
    domain: string;

    /**
     * The ARN of the Amazon Certificate Manager (ACM) certificate to use with CloudFront
     */
    certificate: string;

    /**
     * Email address to use for AWS GuardDuty security finding notifications
     */
    email: string;

    /**
     * If true, AWS WAF will be deployed in front of the workshop CloudFront
     * distribution, with a ruleset to only allow access from the Amazon corporate network
     */
    restrictToAmazonNetwork: boolean;

    /**
     * The ARN of the AWS WAF WebACL that restricts access to the Amazon corporate network (should be deployed separately)
     */
    restrictToAmazonNetworkWebACL: string;

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
        new GuardDutyNotifier(this, 'GuardDuty', {
            environmentName: props.domain,
            email: props.email,
        });

        // Create DNS Zone
        const zone = new route53.PublicHostedZone(this, 'HostedZone', {
            zoneName: props.domain,
        });
        // Bucket to hold the static website
        const bucket = new s3.Bucket(this, 'Bucket', {});

        // Due to a bug in `BucketDeployment` (awslabs/aws-cdk#981) we must
        // deploy each version of the content to a different prefix (it's also a
        // good practice, but we plan to support that intrinsicly in
        // `BucketDeployment`).
        const contentDir = path.join(__dirname, '..', 'workshop', 'public');
        const contentHash = hashDirectorySync(contentDir);
        new s3deploy.BucketDeployment(this, 'DeployWebsite', {
            sources: [s3deploy.Source.asset(contentDir)],
            destinationBucket: bucket,
            destinationKeyPrefix: contentHash,
            retainOnDelete: true,
        });

        const originAccess = new cloudfront.OriginAccessIdentity(this, 'BucketOrigin', {
            comment: props.domain,
        });
        (originAccess.node.defaultChild as cloudfront.CfnCloudFrontOriginAccessIdentity).overrideLogicalId(
            'BucketOrigin',
        );

        let acl: string | undefined;
        if (props.restrictToAmazonNetwork) {
            acl = props.restrictToAmazonNetworkWebACL.toString();
        }

        const maxTtl = props.disableCache ? Duration.seconds(0) : undefined;
        // inline SHA is used for CSP policy
        const inlineStyleSha = [
            "'sha256-lyvsfvzlCPk86VDhFvfEbsKDNH8m7RquDGMXgr/rXvs='",
            "'sha256-1o81pz7f/AiJyQQR7T2XZfvOL7Evb0dl0Kb+COb800c='",
            "'sha256-OnU0/ZM3Ss8isHqfdfFOgBAOgZWtTD+nHOOv6pp4mEA='",
            "'sha256-xelWXnqN51+81jzAN/+Dsx4rrOWcoBFozmA/WqAZRSc='",
            "'sha256-mFNr2NQYXlFnoGPo5ZrXEvWx5Qz6mwmUBRAIEgshwMg='",
            "'sha256-Y6md+aHyc5K3QvKXrCB9LaE4UC85kA0+bGRTq6vrW8w='",
            "'sha256-ov4Wov8WyHnhk7NTMz+SwlCEtXNoJlKWGC38zc+jxrw='",
            "'sha256-Isjf6GAChrKWENuFE9soGexQHUjw9Ud7fG5e4yD/CVw='",
            "'sha256-PiGr5/XCDBUIftEuxoF9eQWfbgUdnct9G96aU2QzPvE='",
            "'sha256-TnygcBzo3pCESk6f1cPu+Q/O01I+ZFAyLS5d50xO4r4='",
            "'sha256-14RFOZyTXi065dRjpJJXLAMi28EgteRcQhZ+PK10Wcs='",
            "'sha256-qtAQa+uAIx3gQuwyhGyZXJW6E2Axew+35Zg8NMnYJEY='",
            "'sha256-w8B/fJx+20Jv6473iPMvte2ge4Jl8iNSimfk8YEXvw4='",
            "'sha256-mhN3gpwX/xTgtH0pwpPH9ydLzWJz3VMmt9f7Qb7Nu5M='",
            "'sha256-mW0fu5NM3URGUu99n5Tu4DWk1ylbi94n0UhRFDTcai0='",
            "'sha256-N96idNQ8aHBQwxA/g2AlnH6W2PHKJKMtWrTJsvEK1n8='",
            "'sha256-VYcLDb4amCd5/sMXNcFnl5yO/ZHpGikkxA46IxJ5ls4='",
            "'sha256-uKb965C8DZ35gHStaTha4jCB76DyWnvasSXFVOGeSss='",
            "'sha256-MpuiN7U1aKpBijo0AFzwmYoAMXQMqNdNfLuOz5RycnM='",
            "'sha256-P2hn+VwIP1QpDbViEeyBpSYd56z000KQL1wYKl4fOn4='",
            "'sha256-XMx/51OWXQv5SQUZixnfEaRbvQbG4b+l60m6mdp/wZo='",
            "'sha256-EXGBthQ+1jugtiaEvJFuOn63vodYXHv5jgJxlfOCKxk='",
            "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
            "'sha256-9YGxn2EDc7klQzQghEvJzPqTNMt+NDID+gpX0Ijax2o='",
            "'sha256-qJ7M/0zJ2S1ttJNaPKSOuBfHtoiq6FoDGs6chIFxhFI='",
        ].join(' ');
        const inlineScriptSha = [
            "'sha256-nP0EI9B9ad8IoFUti2q7EQBabcE5MS5v0nkvRfUbYnM='",
            "'sha256-XZMS7TQuhm1YtWZnGpxhrWZ2iILFJ4l7BKaRD+I+bZw='",
            "'sha256-kZZqSw0cnJ4oaS+J/5tiiM2yM4TblrjZzKS357jxk44='",
            "'sha256-Uzqn2zgXJz5HYkJlYClq6z9lkyJLuYMt2If0BPRiRxg='",
        ].join(' ');

        // CloudFront distribution
        const cert = acm.Certificate.fromCertificateArn(this, 'Certificate', props.certificate);
        const cdn = new cloudfront.Distribution(this, 'CloudFrontDistribution', {
            defaultBehavior: {
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                origin: new cloudfrontOrigins.S3Origin(bucket, {
                    originAccessIdentity: originAccess,
                    originPath: `/${contentHash}`,
                }),
                cachePolicy: new cloudfront.CachePolicy(this, 'CachePolicy', {
                    maxTtl,
                }),
                responseHeadersPolicy: new cloudfront.ResponseHeadersPolicy(this, 'ResponseHeadersPolicy', {
                    securityHeadersBehavior: {
                        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
                        contentTypeOptions: { override: true },
                        xssProtection: { protection: true, modeBlock: true, override: true },
                        referrerPolicy: {
                            referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
                            override: true,
                        },
                        contentSecurityPolicy: {
                            override: true,
                            contentSecurityPolicy: `default-src 'self'; connect-src 'self' *.shortbread.aws.dev *.google-analytics.com; script-src 'self' *.google-analytics.com ${inlineScriptSha}; img-src 'self' *.shortbread.aws.dev; style-src 'unsafe-hashes' 'self' ${inlineStyleSha};`,
                        },
                        strictTransportSecurity: {
                            accessControlMaxAge: Duration.seconds(31536000),
                            includeSubdomains: true,
                            override: true,
                        },
                    },
                }),
            },
            defaultRootObject: 'index.html',
            webAclId: acl,
            priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
            certificate: cert,
            domainNames: [props.domain],
        });
        (cdn.node.defaultChild as cloudfront.CfnDistribution).overrideLogicalId('CloudFrontCFDistribution57EFBAC6');

        // TODO: Model dependency from CloudFront Web Distribution on S3 Bucket Deployment

        // DNS alias for the CloudFront distribution
        new route53.ARecord(this, 'CloudFrontDNSRecord', {
            recordName: props.domain + '.',
            zone,
            target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(cdn)),
        });

        // Email security records
        const emailRecordComment =
            'This record restricts email functionality to help prevent spoofing and impersonation events.';
        new route53.TxtRecord(this, 'EmailSpfRecord', {
            zone,
            values: ['v=spf1 -all'],
            comment: emailRecordComment,
        });
        new route53.TxtRecord(this, 'EmailDkimRecord', {
            recordName: '*._domainkey',
            zone,
            values: ['v=DKIM1; p='],
            comment: emailRecordComment,
        });
        new route53.TxtRecord(this, 'EmailDmarcRecord', {
            recordName: '_dmarc',
            zone,
            values: ['v=DMARC1; p=reject; rua=mailto:report@dmarc.amazon.com; ruf=mailto:report@dmarc.amazon.com'],
            comment: emailRecordComment,
        });

        // Configure Outputs
        new CfnOutput(this, 'URL', {
            description: 'The URL of the workshop',
            value: 'https://' + props.domain,
        });
        new CfnOutput(this, 'CloudFrontURL', {
            description: 'The CloudFront distribution URL',
            value: 'https://' + cdn.distributionDomainName,
        });
        new CfnOutput(this, 'CertificateArn', {
            description: 'The SSL certificate ARN',
            value: props.certificate,
        });
        if (zone.hostedZoneNameServers) {
            new CfnOutput(this, 'Nameservers', {
                description: 'Nameservers for DNS zone',
                value: Fn.join(', ', zone.hostedZoneNameServers),
            });
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
            disableCache: true,
        });
    }
}

const app = new App();
new PipelineStack(app, 'WorkshopPipelineStack', { env: ENV, terminationProtection: true });
app.synth();
