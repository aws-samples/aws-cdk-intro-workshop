from aws_cdk import (
    core,
    aws_lambda as _lambda,
    aws_apigateway as apigw,
)
from cdk_dynamo_table_viewer import TableViewer
from hitcounter import HitCounter

class CdkWorkshopStack(core.Stack):

    @property
    def hc_endpoint(self):
        return self._hc_endpoint

    @property
    def hc_viewer_url(self):
        return self._hc_viewer_url

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Defines an AWS Lambda resource
        my_lambda = _lambda.Function(
            self, 'HelloHandler',
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.asset('lambda'),
            handler='hello.handler',
        )

        hello_with_counter = HitCounter(
            self, 'HelloHitCounter',
            downstream=my_lambda
        )

        gateway = apigw.LambdaRestApi(
            self, 'Endpoint',
            handler=hello_with_counter._handler
        )

        tv = TableViewer(
            self, 'ViewHitCounter',
            title='Hello Hits',
            table=hello_with_counter.table
        )

        self._hc_endpoint = core.CfnOutput(
            self, 'GatewayUrl',
            value=gateway.url
        )

        self._hc_viewer_url = core.CfnOutput(
            self, 'TableViewerUrl',
            value=tv.endpoint
        )
