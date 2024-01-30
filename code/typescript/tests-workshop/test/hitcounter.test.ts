import { Template, Capture, Match } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter } from '../lib/hitcounter';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

test('DynamoDB Table Created', () => {
  const stack = new cdk.Stack();

  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new NodejsFunction(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambda/hello.ts'),
      handler: 'handler'
    })
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::DynamoDB::Table', 1);
});

test('Lambda Has Environment Variables', () => {
  const stack = new cdk.Stack();

  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new NodejsFunction(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambda/hello.ts'),
      handler: 'handler'
    })
  });

  const template = Template.fromStack(stack);
  console.log(template.findResources('AWS::Lambda::Function'));
  const envCapture = new Capture({
    Variables: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      DOWNSTREAM_FUNCTION_NAME: {
        Ref: Match.stringLikeRegexp('TestFunction*')
      },
      HITS_TABLE_NAME: {
        Ref: Match.stringLikeRegexp('MyTestConstructHits*')
      }
    }
  });

  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: envCapture
  });
  console.log(envCapture.asObject());

  expect(envCapture.asObject()).toEqual({
    Variables: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      DOWNSTREAM_FUNCTION_NAME: {
        Ref: 'TestFunction22AD90FC'
      },
      HITS_TABLE_NAME: {
        Ref: 'MyTestConstructHits24A357F0'
      }
    }
  });
});

test('DynamoDB Table Created With Encryption', () => {
  const stack = new cdk.Stack();

  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new NodejsFunction(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambda/hello.ts'),
      handler: 'handler'
    })
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    SSESpecification: {
      SSEEnabled: true
    }
  });
});

describe('Read Capacity can be configured', () => {
  test("can't set read capacity to 3", () => {
    const stack = new cdk.Stack();

    expect(() => {
      new HitCounter(stack, 'MyTestConstruct', {
        downstream: new NodejsFunction(stack, 'TestFunction', {
          runtime: lambda.Runtime.NODEJS_20_X,
          entry: path.join(__dirname, '../lambda/hello.ts'),
          handler: 'handler'
        }),
        readCapacity: 3
      });
    }).toThrowError('readCapacity must be greater than 5 and less than 20');
  });
  test("can't set read capacity to 25", () => {
    const stack2 = new cdk.Stack();
    expect(() => {
      new HitCounter(stack2, 'MyTestConstruct', {
        downstream: new NodejsFunction(stack2, 'TestFunction', {
          runtime: lambda.Runtime.NODEJS_20_X,
          entry: path.join(__dirname, '../lambda/hello.ts'),
          handler: 'handler'
        }),
        readCapacity: 25
      });
    }).toThrowError('readCapacity must be greater than 5 and less than 20');
  });
  test('can set read capacity to 12', () => {
    const stack3 = new cdk.Stack();
    expect(() => {
      new HitCounter(stack3, 'MyTestConstruct', {
        downstream: new NodejsFunction(stack3, 'TestFunction', {
          runtime: lambda.Runtime.NODEJS_20_X,
          entry: path.join(__dirname, '../lambda/hello.ts'),
          handler: 'handler'
        }),
        readCapacity: 12
      });
    }).not.toThrowError('readCapacity must be greater than 5 and less than 20');
  });
});
