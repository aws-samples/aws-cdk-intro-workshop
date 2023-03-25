+++
title = "Create Construct Hub"
weight = 100
+++

## Create Construct Hub Infrastructure

{{% notice warning %}} Please note that the <a href="https://github.com/cdklabs/construct-hub" target="_blank">Construct Hub library</a> is currently in active development and should be considered _experimental_. We welcome any feedback (good or bad) from your experience in using that repo! {{% /notice %}}

{{% notice warning %}} Please note that the Construct Hub web interface is delivered through a publicly accessible CloudFront distribution. Restricting access to specific users and groups is beyond the scope of this workshop. However, you may consider the following best practices to implement it:
- Use signed URLs or signed cookies to grant temporary access to the content in your CloudFront distribution.
- Use AWS Web Application Firewall (WAF) to protect your CloudFront distribution from common web attacks and unwanted traffic. You can create custom rules to block or allow access based on specific criteria, such as IP addresses, user agents, or geographic locations.
- Use Lambda@Edge to add custom logic to your CloudFront distribution. You can use Lambda@Edge to perform authorization checks and allow or deny access to your content based on specific criteria.
- For access inside of an Intranet or private networks, disable your CloudFront distribution and provide access to the origin S3 bucket through an internal Application Load Balancer using interface endpoints on AWS PrivateLink for Amazon S3.
{{% /notice %}}

### Create Construct Hub Stack

The first step is to create an instance of Construct Hub in our AWS Account. Before you can use the Construct Hub library in your stack, you need to install the npm module:

{{<highlight bash>}}
npm install construct-hub
{{</highlight>}}

By default, Construct Hub has a single package source configured, which is the public npmjs.com registry. However, it also supports CodeArtifact repositories and custom package source implementations. For our purposes, we will create a CodeArtifact domain and repository to add as a package source to our private Construct Hub.

Create a new file under `lib` called `lib/private-construct-hub-stack.ts` and add the following code:

{{<highlight ts>}}
import * as cdk from 'aws-cdk-lib';
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

    const repo = new codeartifact.CfnRepository(this, 'CodeArtifactRepository', {
      domainName: domain.domainName,
      repositoryName: 'cdkworkshop-repository',
    });

    repo.addDependency(domain);

    // Create private instance of ConstructHub, register the new CodeArtifact repo
    new ConstructHub(this, 'ConstructHub', {
      packageSources: [
        new sources.CodeArtifact({ repository: repo })
      ],
    });
  }
}
{{</highlight>}}

### Update CDK Deploy Entrypoint

Next, modify the main CDK application to deploy the new Construct Hub stack. Edit the code in `bin/cdk-workshop.ts` as follows:

{{<highlight ts "hl_lines=2 5">}}
import * as cdk from 'aws-cdk-lib';
import { ConstructHubStack } from '../lib/private-construct-hub-stack';

const app = new cdk.App();
new ConstructHubStack(app, 'ConstructHubStack');
{{</highlight>}}

### Deploy

```
npx cdk deploy
```

{{% notice info %}} Deploying Construct Hub stack for the first time may take up to 10-12 minutes. {{% /notice %}}
