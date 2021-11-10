from constructs import Construct
from aws_cdk import (
    core as cdk,
    aws_lambda as _lambda,
    aws_apigateway as apigw,
)
from cdk_dynamo_table_viewer import TableViewer
from cdk_workshop.hitcounter import HitCounter


class CdkWorkshopStack(cdk.Stack):
    @property
    def hc_endpoint(self):
        return self._hc_endpoint

    @property
    def hc_viewer_url(self):
        return self._hc_viewer_url

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Defines an AWS Lambda resource
        my_lambda = _lambda.Function(
            self,
            "HelloHandler",
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.from_asset("lambda"),
            handler="hello.handler",
        )

        hello_with_counter = HitCounter(self, "HelloHitCounter", downstream=my_lambda)

        gateway = apigw.LambdaRestApi(
            self, "Endpoint", handler=hello_with_counter._handler
        )

        tv = TableViewer(
            self, "ViewHitCounter", title="Hello Hits", table=hello_with_counter.table
        )

        self._hc_endpoint = cdk.CfnOutput(self, "GatewayUrl", value=gateway.url)

        self._hc_viewer_url = cdk.CfnOutput(self, "TableViewerUrl", value=tv.endpoint)
