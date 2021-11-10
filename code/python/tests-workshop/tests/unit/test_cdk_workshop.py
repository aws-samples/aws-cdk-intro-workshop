from aws_cdk import core as cdk, aws_lambda as _lambda, assertions
from cdk_workshop.hitcounter import HitCounter
import pytest


def test_dynamodb_table_created():
    stack = cdk.Stack()
    HitCounter(
        stack,
        "HitCounter",
        downstream=_lambda.Function(
            stack,
            "TestFunction",
            runtime=_lambda.Runtime.NODEJS_14_X,
            handler="hello.handler",
            code=_lambda.Code.from_asset("lambda"),
        ),
    )
    template = assertions.Template.from_stack(stack)
    template.resource_count_is("AWS::DynamoDB::Table", 1)


def test_lambda_has_env_vars():
    stack = cdk.Stack()
    HitCounter(
        stack,
        "HitCounter",
        downstream=_lambda.Function(
            stack,
            "TestFunction",
            runtime=_lambda.Runtime.NODEJS_14_X,
            handler="hello.handler",
            code=_lambda.Code.from_asset("lambda"),
        ),
    )
    template = assertions.Template.from_stack(stack)
    envCapture = assertions.Capture()
    template.has_resource_properties(
        "AWS::Lambda::Function",
        {
            "Handler": "hitcount.handler",
            "Environment": envCapture,
        },
    )
    assert envCapture.as_object() == {
        "Variables": {
            "DOWNSTREAM_FUNCTION_NAME": {"Ref": "TestFunction22AD90FC"},
            "HITS_TABLE_NAME": {"Ref": "HitCounterHits079767E5"},
        },
    }


def test_dynamodb_with_encryption():
    stack = cdk.Stack()
    HitCounter(
        stack,
        "HitCounter",
        downstream=_lambda.Function(
            stack,
            "TestFunction",
            runtime=_lambda.Runtime.NODEJS_14_X,
            handler="hello.handler",
            code=_lambda.Code.from_asset("lambda"),
        ),
    )
    template = assertions.Template.from_stack(stack)
    template.has_resource_properties(
        "AWS::DynamoDB::Table",
        {
            "SSESpecification": {
                "SSEEnabled": True,
            },
        },
    )


def test_dynamodb_raises():
    stack = cdk.Stack()
    with pytest.raises(Exception):
        HitCounter(
            stack,
            "HitCounter",
            downstream=_lambda.Function(
                stack,
                "TestFunction",
                runtime=_lambda.Runtime.NODEJS_14_X,
                handler="hello.handler",
                code=_lambda.Code.from_asset("lambda"),
            ),
            read_capacity=1,
        )
