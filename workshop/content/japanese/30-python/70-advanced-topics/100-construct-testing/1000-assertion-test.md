+++
title = "アサーションテスト"
weight = 200
+++

### きめ細かな(fine-grained) アサーションテスト

#### DynamoDB テーブルのためのテストの作成

{{% notice info %}} このセクションでは、[hit counter コンストラクトの作成](/30-python/40-hit-counter.html) が完了していることを前提としています。 {{% /notice %}}

`HitCounter` コンストラクトはシンプルな DynamoDB テーブルを作成します。テーブルが作成されていることを検証するテストを作りましょう。

`cdk init` でプロジェクトを作成した場合は `tests` フォルダが既に作成されているはずです。
その場合は、既存の `test_cdk_workshop_stack.py` ファイルを削除する必要があります。

`tests` フォルダがない場合は (通常は `cdk init` の実行時に自動的に作成されます)、
プロジェクトのルートに `tests` フォルダを作成し、次のようにファイルを作成します。

```
mkdir -p tests/unit
touch tests/__init__.py
touch tests/unit/__init__.py
touch tests/unit/test_cdk_workshop.py
```

`test_cdk_workshop.py` というファイルで、以下のコードのように最初のテストを作成します。

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

このテストは、生成 (synthesize) されたスタックに DynamoDB テーブルが含まれていることを確認します。

テストを実行します。

```bash
$ pytest
```

以下のような出力が表示されるはずです。

```bash
$ pytest
================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 1 item

tests/unit/test_cdk_workshop.py .                                                                                                                                                                               [100%]

================================================================================================== 1 passed in 1.49s ==================================================================================================
```

#### Lambda 関数のためのテストの作成

次は、`HitCounter` コンストラクトが作成する Lambda 関数のためのテストを追加します。
今回は、Lambda 関数が作成されたことのテストに加えて、その関数には
`DOWNSTREAM_FUNCTION_NAME` と `HITS_TABLE_NAME` の2つの環境変数があることをテストします。

DynamoDB のテストの下に新規のテストを追加します。
Lambda 関数を作成した時に、環境変数の値は他のコンストラクトへの参照だったことを覚えていますか？

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

この時点では、`function_name` と `table_name` の値がわかりません。
CDK はハッシュを計算して、コンストラクトの名前の末尾に追加するからです。
そのため、一旦ダミーな値をセットして、最初のテストの実行が失敗し、実際の期待値が明らかになります。

`test_cdk_workshop.py` に以下のコードを追加し、新しいテストを作成します。

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

ファイルを保存して、テストをもう一度実行します。

```bash
$ pytest
```

今回のテストは失敗しますが、期待値の出力から環境変数の正しい値を入手できるはずです。

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

環境変数の実際の値を取得し、テストの内容を更新します。

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

ここで、テストをもう一度実行します。今回は成功するはずです。

```bash
$ pytest
```

次のような出力が表示されるはずです。

```bash
$ pytest

================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 2 items

tests/unit/test_cdk_workshop.py ..                                                                                                                                                                              [100%]

================================================================================================== 2 passed in 1.58s ==================================================================================================
```

CDK コンストラクトの開発をテスト駆動開発手法 (Test Driven Development) でできます。
単純な例として、DynamoDB テーブルを暗号化する要件を追加しましょう。

まず、この新しい要件を反映するために、テストを更新します。

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

ここでテストを実行すると、失敗するはずです。

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

次に、壊れたテストを直しましょう。hitcounter のコードを更新して、デフォルトで暗号化を有効にします。

`hitcounter.py` を編集します。
{{<highlight python "hl_lines=4">}}
self._table = ddb.Table(
    self, 'Hits',
    partition_key={'name': 'path', 'type': ddb.AttributeType.STRING},
    encryption=ddb.TableEncryption.AWS_MANAGED,
)
{{</highlight>}}

次にテストを実行します。成功するはずです。

```bash
$ pytest

================================================================================================= test session starts =================================================================================================
platform linux -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: ...
collected 3 items

tests/unit/test_cdk_workshop.py ...                                                                                                                                                                             [100%]

================================================================================================== 3 passed in 1.59s ==================================================================================================
```

{{< nextprevlinks >}}