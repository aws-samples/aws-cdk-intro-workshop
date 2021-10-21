import {App} from '@aws-cdk/core';
import {WorkshopPipelineStack} from "../lib/pipeline-stack";

const app = new App();
new WorkshopPipelineStack(app, 'CdkWorkshopPipelineStack');
