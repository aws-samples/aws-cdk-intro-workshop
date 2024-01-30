import { App } from 'aws-cdk-lib';
import { CdkWorkshopStack } from '../lib/cdk-workshop-stack';

const app = new App();
new CdkWorkshopStack(app, 'CdkWorkshop');
