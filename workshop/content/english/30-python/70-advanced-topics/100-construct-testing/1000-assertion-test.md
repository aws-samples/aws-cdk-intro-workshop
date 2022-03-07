+++
title = "Assertion Tests"
weight = 200
+++

### Fine-Grained Assertion Tests

#### Create a test for the DynamoDB table

{{% notice info %}} This section assumes that you have [created the hit counter construct](/30-python/40-hit-counter.html) {{% /notice %}}

Our `HitCounter` construct creates a simple DynamoDB table. Lets create a test that
validates that the table is getting created.

If you have create the project with `cdk init` then you should already have a `tests` directory. In that case you will need to remove
the existing `test_cdk_workshop_stack.py` file.

If you do not already have a `tests` directory (usually created automatically when you run `cdk init`), then create a `tests` directory at the
root of the project and then create the following files:

```
mkdir -p tests/unit
touch tests/__init__.py
touch tests/unit/__init__.py
touch tests/unit/test_cdk_workshop.py
```

In the file called `test_cdk_workshop.py` create your first test using the following code.

```python
from aws_cdk import (
        Stack,
        aws_lambda as _lambda,
        assertions
    )
from cdk_workshop.hitcounter import HitCounter
import pytest


def test_dynamodb_table_created():
    stack = Stack()
    HitCounter(stack, "HitCounter",
            downstream=_lambda.Function(stack, "TestFunction",
                runtime=_lambda.Runtime.NODEJS_14_X,
                handler='hello.handler',
                code=_lambda.Code.from_asset('lambda')),
    )
    template = assertions.Template.from_stack(stack)
    template.resource_count_is("AWS::DynamoDB::Table", 1)
```

This test is simply testing to ensure that the synthesized stack includes a DynamoDB table.

Run the test.

```bash
$ pytest
```

You should see output like this:

```bash
$ pytest
================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 1 item

tests/unit/test_cdk_workshop.py .                                                                                                                                                                               [100%]

================================================================================================== 1 passed in 1.49s ==================================================================================================
```

#### Create a test for the Lambda function

Now lets add another test, this time for the Lambda function that the `HitCounter` construct creates.
This time in addition to testing that the Lambda function is created, we also want to test that
it is created with the two environment variables `DOWNSTREAM_FUNCTION_NAME` & `HITS_TABLE_NAME`.

Add another test below the DynamoDB test. If you remember, when we created the lambda function the
environment variable values were references to other constructs.

{{<highlight python "hl_lines=7-8">}}
self._handler = _lambda.Function(
    self, 'HitCounterHandler',
    runtime=_lambda.Runtime.PYTHON_3_7,
    handler='hitcount.handler',
    code=_lambda.Code.from_asset('lambda'),
    environment={
        'DOWNSTREAM_FUNCTION_NAME': downstream.function_name,
        'HITS_TABLE_NAME': self._table.table_name
    }
)
{{</highlight>}}

At this point we don't really know what the value of the `function_name` or `table_name` will be since the
CDK will calculate a hash to append to the end of the name of the constructs, so we will just use a
dummy value for now. Once we run the test it will fail and show us the expected value.

Create a new test in `test_cdk_workshop.py` with the below code:

```python
def test_lambda_has_env_vars():
    stack = Stack()
    HitCounter(stack, "HitCounter",
            downstream=_lambda.Function(stack, "TestFunction",
                runtime=_lambda.Runtime.NODEJS_14_X,
                handler='hello.handler',
                code=_lambda.Code.from_asset('lambda')))

    template = assertions.Template.from_stack(stack)
    envCapture = assertions.Capture()

    template.has_resource_properties("AWS::Lambda::Function", {
        "Handler": "hitcount.handler",
        "Environment": envCapture,
        })

    assert envCapture.as_object() == {
            "Variables": {
                "DOWNSTREAM_FUNCTION_NAME": {"Ref": "TestFunctionXXXXX"},
                "HITS_TABLE_NAME": {"Ref": "HitCounterHitsXXXXXX"},
                },
            }
```

Save the file and run the test again.

```bash
pytest
```

This time the test should fail and you should be able to grab the correct value for the
variables from the expected output.

{{<highlight bash "hl_lines=17">}}
$ pytest
================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 2 items

tests/unit/test_cdk_workshop.py .F                                                                                                                                                                              [100%]

====================================================================================================== FAILURES =======================================================================================================
______________________________________________________________________________________________ test_lambda_has_env_vars _______________________________________________________________________________________________

    ...


E       AssertionError: assert {'Variables':...ts079767E5'}}} == {'Variables':...tsXXXXXXXX'}}}
E         Differing items:
E         {'Variables': {'DOWNSTREAM_FUNCTION_NAME': {'Ref': 'TestFunction22AD90FC'}, 'HITS_TABLE_NAME': {'Ref': 'HitCounterHits079767E5'}}} != {'Variables': {'DOWNSTREAM_FUNCTION_NAME': {'Ref': 'TestFunctionXXXXXXXX'}, 'HITS_TABLE_NAME': {'Ref': 'HitCounterHitsXXXXXXXX'}}}
E         Use -v to get the full diff

tests/unit/test_cdk_workshop.py:35: AssertionError
=============================================================================================== short test summary info ===============================================================================================
FAILED tests/unit/test_cdk_workshop.py::test_lambda_has_env_vars - AssertionError: assert {'Variables':...ts079767E5'}}} == {'Variables':...tsXXXXXXXX'}}}
============================================================================================= 1 failed, 1 passed in 1.60s =============================================================================================
{{</highlight>}}

Grab the real values for the environment variables and update your test

{{<highlight python "hl_lines=16-17">}}
def test_lambda_has_env_vars():
    stack = Stack()
    HitCounter(stack, "HitCounter",
            downstream=_lambda.Function(stack, "TestFunction",
                runtime=_lambda.Runtime.NODEJS_14_X,
                handler='hello.handler',
                code=_lambda.Code.from_asset('lambda')))
    template = assertions.Template.from_stack(stack)
    envCapture = assertions.Capture()
    template.has_resource_properties("AWS::Lambda::Function", {
        "Handler": "hitcount.handler",
        "Environment": envCapture,
        })
    assert envCapture.as_object() == {
            "Variables": {
                "DOWNSTREAM_FUNCTION_NAME": {"Ref": "REPLACE_VALUE_HERE"},
                "HITS_TABLE_NAME": {"Ref": "REPLACE_VALUE_HERE"},
                },
            }

{{</highlight>}}

Now run the test again. This time is should pass.

```bash
$ pytest
```

You should see output like this:

```bash
$ pytest

================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 2 items

tests/unit/test_cdk_workshop.py ..                                                                                                                                                                              [100%]

================================================================================================== 2 passed in 1.58s ==================================================================================================
```

You can also apply TDD (Test Driven Development) to developing CDK Constructs. For a very simple example, lets add a new
requirement that our DynamoDB table be encrypted.

First we'll update the test to reflect this new requirement.

{{<highlight python>}}
def test_dynamodb_with_encryption():
    stack = Stack()
    HitCounter(stack, "HitCounter",
            downstream=_lambda.Function(stack, "TestFunction",
                runtime=_lambda.Runtime.NODEJS_14_X,
                handler='hello.handler',
                code=_lambda.Code.from_asset('lambda')))

    template = assertions.Template.from_stack(stack)
    template.has_resource_properties("AWS::DynamoDB::Table", {
        "SSESpecification": {
            "SSEEnabled": True,
            },
        })
{{</highlight>}}

Now run the test, which should fail.

```bash
$ pytest
================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 3 items

tests/unit/test_cdk_workshop.py ..F                                                                                                                                                                             [100%]

====================================================================================================== FAILURES =======================================================================================================
____________________________________________________________________________________________ test_dynamodb_with_encryption ____________________________________________________________________________________________
jsii.errors.JavaScriptError:
  Error: Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.
  The closest result is:
    {
      "Type": "AWS::DynamoDB::Table",
      "Properties": {
        "KeySchema": [
          {
            "AttributeName": "path",
            "KeyType": "HASH"
          }
        ],
        "AttributeDefinitions": [
          {
            "AttributeName": "path",
            "AttributeType": "S"
          }
        ],
        "ProvisionedThroughput": {
          "ReadCapacityUnits": 5,
          "WriteCapacityUnits": 5
        }
      },
      "UpdateReplacePolicy": "Retain",
      "DeletionPolicy": "Retain"
    }
  with the following mismatches:
        Missing key at /Properties/SSESpecification (using objectLike matcher)
      at Template.hasResourceProperties (/tmp/jsii-kernel-4Be5Dy/node_modules/@aws-cdk/assertions/lib/template.js:85:19)
      at /tmp/tmpdj0kczj7/lib/program.js:8248:134
      at Kernel._wrapSandboxCode (/tmp/tmpdj0kczj7/lib/program.js:8860:24)
      at /tmp/tmpdj0kczj7/lib/program.js:8248:107
      at Kernel._ensureSync (/tmp/tmpdj0kczj7/lib/program.js:8841:28)
      at Kernel.invoke (/tmp/tmpdj0kczj7/lib/program.js:8248:34)
      at KernelHost.processRequest (/tmp/tmpdj0kczj7/lib/program.js:9757:36)
      at KernelHost.run (/tmp/tmpdj0kczj7/lib/program.js:9720:22)
      at Immediate._onImmediate (/tmp/tmpdj0kczj7/lib/program.js:9721:46)
      at processImmediate (internal/timers.js:464:21)

The above exception was the direct cause of the following exception:

    ...more error info...

=============================================================================================== short test summary info ===============================================================================================
FAILED tests/unit/test_cdk_workshop.py::test_dynamodb_with_encryption - jsii.errors.JSIIError: Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.
============================================================================================= 1 failed, 2 passed in 1.65s =============================================================================================
```

Now lets fix the broken test. Update the hitcounter code to enable encryption by default.

Edit `hitcounter.py`
{{<highlight python "hl_lines=4">}}
self._table = ddb.Table(
    self, 'Hits',
    partition_key={'name': 'path', 'type': ddb.AttributeType.STRING},
    encryption=ddb.TableEncryption.AWS_MANAGED,
)
{{</highlight>}}

Now run the test again, which should now pass.

```bash
$ pytest

================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 3 items

tests/unit/test_cdk_workshop.py ...                                                                                                                                                                             [100%]

================================================================================================== 3 passed in 1.59s ==================================================================================================
```
