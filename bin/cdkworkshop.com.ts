#!/usr/bin/env node
import cdk = require('@aws-cdk/cdk');

class CdkworkshopComStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
    super(parent, name, props);

  }
}

const app = new cdk.App();

new CdkworkshopComStack(app, 'CdkworkshopComStack');

app.run();
