import * as cdk from 'aws-cdk-lib';
import * as waf from 'aws-cdk-lib/aws-wafv2';
import * as codeartifact from 'aws-cdk-lib/aws-codeartifact';
import { ConstructHub } from 'construct-hub';
import * as sources from 'construct-hub/lib/package-sources';
import { Construct } from 'constructs';

export class ConstructHubStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a CodeArtifact domain and repo for user construct packages
    const domain = new codeartifact.CfnDomain(this, 'CodeArtifactDomain', {
        domainName: 'cdkworkshop-domain',
    });
    
    const repository = new codeartifact.CfnRepository(this, 'CodeArtifactRepository', {
        domainName: domain.domainName,
        repositoryName: 'cdkworkshop-repository',
    });
    
    repository.addDependsOn(domain);
    
    // Define the IP Set for allowed origin IP range addresses
    const ipSet = new waf.CfnIPSet(this, 'ConstructHubIPSet', {
        addresses: ['192.0.2.0/24', '192.0.4.0/24'],
        ipAddressVersion: 'IPV4',
        scope: 'CLOUDFRONT',
    });    

    // Define the Web ACL with IP Set rule for ContructHub CloudFront distribution
    const webACL = new waf.CfnWebACL(this, 'ConstructHubWebACL', {
        name: 'ConstructHubWebACL',
        description: 'Web ACL for ConstructHub web app CloudFront distribution',
        defaultAction: {
            block: {}
        },
        scope: 'CLOUDFRONT',
        rules: [{
            name: 'ConstructHubIPSetAllowRule',
            priority: 0,
            statement: {
                ipSetReferenceStatement: {
                    arn: ipSet.attrArn
                }
            },
            action: {
                allow: {}
            },
            visibilityConfig: {
                sampledRequestsEnabled: true,
                cloudWatchMetricsEnabled: true,
                metricName: 'MetricForConstructHubIPSetAllowRule'
            }
        }],
        visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName:'MetricForConstructHubWebACL'
        }
    });
    
    webACL.addDependsOn(ipSet);

    // Create private Construct Hub resources, register our CodeArtifact repo
    new ConstructHub(this, 'ConstructHub', {
        packageSources: [
            new sources.CodeArtifact({ repository: repository }),
        ]
    });
  }
}