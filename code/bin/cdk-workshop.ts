#!/usr/bin/env node
import cdk = require('@aws-cdk/cdk');
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigateway');
import { HitCounter } from './hitcounter';

class CdkWorkshopStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
    super(parent, name, props);

    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NodeJS810,
      code: lambda.Code.directory('lambda'),
      handler: 'hello.handler'
    });

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    const api = new apigw.LambdaRestApi(this, 'Endpoint', { handler: helloWithCounter.handler, proxyPath: '/' });
    api.root.addMethod('ANY');
  }
}

const app = new cdk.App();
new CdkWorkshopStack(app, 'CdkWorkshopStack');
app.run();
