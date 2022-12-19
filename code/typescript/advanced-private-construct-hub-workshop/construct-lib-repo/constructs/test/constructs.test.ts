import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter } from '../src/hitcounter';

test('DynamoDB Table Created', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async function(event) {
          console.log("event: ", event);
        };
      `),
    }),
  });
  // THEN

  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::DynamoDB::Table', 1);
});