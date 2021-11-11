from constructs import Construct
from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigw,
)
from cdk_dynamo_table_view import TableViewer
from .hitcounter import HitCounter


class CdkWorkshopStack(Stack):
    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Defines an AWS Lambda resource
        hello = _lambda.Function(
            self,
            "HelloHandler",
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.from_asset("lambda"),
            handler="hello.handler",
        )

        hello_with_counter = HitCounter(self, "HelloHitCounter", downstream=hello)

        apigw.LambdaRestApi(self, "Endpoint", handler=hello_with_counter._handler)

        TableViewer(
            self, "ViewHitCounter", title="Hello Hits", table=hello_with_counter.table
        )
