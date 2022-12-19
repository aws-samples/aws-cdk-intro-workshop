#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import {ConstructHubStack} from '../lib/construct-hub-stack'

const app = new cdk.App()
new ConstructHubStack(app, 'ConstructHubStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
})
