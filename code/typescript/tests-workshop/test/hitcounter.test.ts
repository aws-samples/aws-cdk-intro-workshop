import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { HitCounter } from '../lib/hitcounter';

test('DynamoDB Table Created', () => {
    const stack = new cdk.Stack();

    const tableCreateLambda = new lambda.Function(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'hello.handler',
        code: lambda.Code.fromAsset('lambda')
    });

    new HitCounter(stack, 'MyTestConstruct', {
        downstream: tableCreateLambda
    });
    // THEN

    expectCDK(stack).to(haveResource("AWS::DynamoDB::Table", {
        SSESpecification: {
            SSEEnabled: true
        }
    }));
});

test('Lambda Has Environment Variables', () => {
    const stack = new cdk.Stack();

    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hello.handler',
            code: lambda.Code.fromAsset('lambda')
        })
    });

    expectCDK(stack).to(haveResource("AWS::Lambda::Function", {
        Environment: {
            Variables: {
                DOWNSTREAM_FUNCTION_NAME: {
                    "Ref": "TestFunction22AD90FC"
                },
                HITS_TABLE_NAME: {
                    "Ref": "MyTestConstructHits24A357F0"
                }
            }
        }
    }));
});
