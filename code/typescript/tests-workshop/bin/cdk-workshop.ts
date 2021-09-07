import { App } from '@aws-cdk/core';
import { CdkWorkshopStack } from '../lib/cdk-workshop-stack';

const app = new App();
new CdkWorkshopStack(app, 'CdkWorkshop');
