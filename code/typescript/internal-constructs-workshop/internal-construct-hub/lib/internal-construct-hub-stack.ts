import * as cdk from 'aws-cdk-lib';
import * as codeartifact from 'aws-cdk-lib/aws-codeartifact';
import { ConstructHub } from 'construct-hub';
import * as sources from 'construct-hub/lib/package-sources';
import { Construct } from 'constructs';

export class InternalConstructHubStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a CodeArtifact domain and repo for user construct packages
    const domain = new codeartifact.CfnDomain(this, 'CodeArtifactDomain', {
      domainName: 'cdkworkshop-domain',
    });

    const repo = new codeartifact.CfnRepository(this, 'CodeArtifactRepository', {
      domainName: domain.domainName,
      repositoryName: 'cdkworkshop-repository',
    });

    repo.addDependency(domain);

    // Create internal instance of ConstructHub, register the new CodeArtifact repo
    new ConstructHub(this, 'ConstructHub', {
      packageSources: [
        new sources.CodeArtifact({ repository: repo })
      ],
    });
  }
}