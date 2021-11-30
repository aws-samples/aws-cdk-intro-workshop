+++
title = "Validation Tests"
weight = 300
+++

### Validation Tests

Sometimes we want the inputs to be configurable, but we also want to put constraints on those inputs or validate
that the input is valid.

Suppose for the `HitCounter` construct we want to allow the user to specify the `read_capacity` on the DynamoDB
table, but we also want to ensure the value is within a reasonable range. We can write a test to make sure
that the validation logic works: pass in invalid values and see what happens.

First, add a `read_capacity` property to `HitCounter`:

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

Then update the DynamoDB table resource to add the `read_capacity` property.

{{<highlight python "hl_lines=5">}}
self._table = ddb.Table(
    self, 'Hits',
    partition_key={'name': 'path', 'type': ddb.AttributeType.STRING},
    encryption=ddb.TableEncryption.AWS_MANAGED,
    read_capacity=read_capacity,
)
{{</highlight>}}

Now add a validation which will throw an error if the `read_capacity` is not in the allowed range.

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

Now lets add a test that validates the error is thrown.

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

Run the test.

```bash
$ pytest
```

You should see an output like this:

```bash
$ pytest

================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 4 items

tests/unit/test_cdk_workshop.py ....                                                                                                                                                                            [100%]

================================================================================================== 4 passed in 1.59s ==================================================================================================
```
