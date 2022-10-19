+++
title = "HitCounter テーブルを公開"
weight = 400
+++

## HitCounter にテーブルのプロパティを追加

`hitcounter.py` を編集して、`table` をパブリックプロパティとして公開されるように設定します。

{{<highlight python "hl_lines=13-15 20 32 36">}}
from constructs import Construct
from aws_cdk import (
    aws_lambda as _lambda,
    aws_dynamodb as ddb,
)

class HitCounter(Construct):

    @property
    def handler(self):
        return self._handler

    @property
    def table(self):
        return self._table

    def __init__(self, scope: Construct, id: str, downstream: _lambda.IFunction, **kwargs):
        super().__init__(scope, id, **kwargs)

        self._table = ddb.Table(
            self, 'Hits',
            partition_key={'name': 'path', 'type': ddb.AttributeType.STRING}
        )

        self._handler = _lambda.Function(
            self, 'HitCountHandler',
            runtime=_lambda.Runtime.PYTHON_3_7,
            handler='hitcount.handler',
            code=_lambda.Code.from_asset('lambda'),
            environment={
                'DOWNSTREAM_FUNCTION_NAME': downstream.function_name,
                'HITS_TABLE_NAME': self._table.table_name,
            }
        )

        self._table.grant_read_write_data(self.handler)
        downstream.grant_invoke(self.handler)
{{</highlight>}}

## これでスタックからテーブルにアクセスできるようになりました

`cdk_workshop_stack.py` に戻り、`table` プロパティを指定します。

{{<highlight python "hl_lines=38">}}
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
            self, 'HelloHandler',
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.from_asset('lambda'),
            handler='hello.handler',
        )

        hello_with_counter = HitCounter(
            self, 'HelloHitCounter',
            downstream=hello,
        )

        apigw.LambdaRestApi(
            self, 'Endpoint',
            handler=hello_with_counter._handler,
        )

        TableViewer(
            self, 'ViewHitCounter',
            title='Hello Hits',
            table=hello_with_counter.table,
        )
{{</highlight>}}
