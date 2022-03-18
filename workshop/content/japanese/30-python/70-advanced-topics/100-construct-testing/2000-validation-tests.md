+++
title = "バリデーションテスト"
weight = 300
+++

### バリデーションテスト

場合によって、入力値を可変にする必要がありますが、その値に対して制約を設定したり、値の有効性を検証したりすることも必要です。

例えば、`HitCounter` コンストラクトに対して、 DynamoDB の `read_capacity` を指定できるようにします。
ユーザにリーズナブルな範囲で値を指定してもらいたいです。ひとまず、バリデーションロジックが正常に動作していることを確認するためのテストを書きます。
敢えて無効な値を指定して、結果を確認します。

まず、`HitCounter` コンストラクトに `read_capacity` プロパティーを追加します。

{{<highlight python "hl_lines=11">}}
class HitCounter(Construct):

    @property
    def handler(self):
        return self._handler

    @property
    def table(self):
        return self._table

    def __init__(self, scope: Construct, id: str, downstream: _lambda.IFunction, read_capacity: int = 5, **kwargs):

    ...
{{</highlight>}}

次は、DynamoDB テーブルのリソースに `read_capacity` プロパティを追加します。

{{<highlight python "hl_lines=5">}}
self._table = ddb.Table(
    self, 'Hits',
    partition_key={'name': 'path', 'type': ddb.AttributeType.STRING},
    encryption=ddb.TableEncryption.AWS_MANAGED,
    read_capacity=read_capacity,
)
{{</highlight>}}

以下のように、`read_capacity` が範囲外である時にエラーを渡すバリデーションを追加します。

{{<highlight python "hl_lines=12-13">}}
class HitCounter(Construct):

    @property
    def handler(self):
        return self._handler

    @property
    def table(self):
        return self._table

    def __init__(self, scope: Construct, id: str, downstream: _lambda.IFunction, read_capacity: int = 5, **kwargs):
        if read_capacity < 5 or read_capacity > 20:
                raise ValueError("readCapacity must be greater than 5 or less than 20")

        super().__init__(scope, id, **kwargs)

        ...
{{</highlight>}}

最後に、エラーが渡されることを確認するテストを追加します。

```python
def test_dynamodb_raises():
    stack = Stack()
    with pytest.raises(Exception):
        HitCounter(stack, "HitCounter",
                downstream=_lambda.Function(stack, "TestFunction",
                    runtime=_lambda.Runtime.NODEJS_14_X,
                    handler='hello.handler',
                    code=_lambda.Code.from_asset('lambda')),
                read_capacity=1,
                )
```

テストを実行すると

```bash
$ pytest
```

以下のような出力を確認できるはずです。

```bash
$ pytest

================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 4 items

tests/unit/test_cdk_workshop.py ....                                                                                                                                                                            [100%]

================================================================================================== 4 passed in 1.59s ==================================================================================================
```
