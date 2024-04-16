+++
title = "アサーションテスト"
weight = 200
+++

### きめ細かな(fine-grained) アサーションテスト

#### DynamoDB テーブルのためのテストの作成

{{% notice info %}} このセクションでは、[hit counter コンストラクトの作成](/20-typescript/40-hit-counter.html) が完了していることを前提としています。 {{% /notice %}}

`HitCounter` コンストラクトはシンプルな DynamoDB テーブルを作成します。テーブルが作成されていることを検証するテストを作りましょう。

`cdk init` でプロジェクトを作成した場合は `tests` フォルダが既に作成されているはずです。
その場合は、既存の `cdk-workshop.test.ts` ファイルを削除する必要があります。

`tests` フォルダがない場合は (通常は `cdk init` の実行時に自動的に作成されます)、
`bin` や `lib` フォルダと同じ階層に `tests` フォルダを作成し、`hitcounter.test.ts` ファイルを次の内容で作成します。

```typescript
import { Template, Capture } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter }  from '../lib/hitcounter';

test('DynamoDB Table Created', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    })
  });
  // THEN

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});
```

このテストは、生成 (synthesize) されたスタックに DynamoDB テーブルが含まれていることを確認します。

テストを実行します。


```bash
$ npm run test
```

以下のような出力が表示されるはずです。

```bash
$ npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (182ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        3.273s
Ran all test suites.
```

#### Lambda 関数のためのテストの作成

次は、`HitCounter` コンストラクトが作成する Lambda 関数のためのテストを追加します。
今回は、Lambda 関数が作成されたことのテストに加えて、その関数には
`DOWNSTREAM_FUNCTION_NAME` と `HITS_TABLE_NAME` の2つの環境変数があることをテストします。

DynamoDB のテストの下に新規のテストを追加します。
Lambda 関数を作成した時に、環境変数の値は他のコンストラクトへの参照だったことを覚えていますか？

{{<highlight ts "hl_lines=6-7">}}
this.handler = new lambda.Function(this, 'HitCounterHandler', {
  runtime: lambda.Runtime.NODEJS_14_X,
  handler: 'hitcounter.handler',
  code: lambda.Code.fromAsset('lambda'),
  environment: {
    DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
    HITS_TABLE_NAME: table.tableName
  }
});
{{</highlight>}}

この時点では、`functionName` と `tableName` の値がわかりません。
CDK はハッシュを計算して、コンストラクトの名前の末尾に追加するからです。
そのため、一旦ダミーな値をセットして、最初のテストの実行が失敗し、実際の期待値が明らかになります。

`hitcounter.test.ts` に以下のコードを追加し、新しいテストを作成します。


```typescript
test('Lambda Has Environment Variables', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    })
  });
  // THEN
  const template = Template.fromStack(stack);
  const envCapture = new Capture();
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual(
    {
      Variables: {
        DOWNSTREAM_FUNCTION_NAME: {
          Ref: "TestFunctionXXXXX",
        },
        HITS_TABLE_NAME: {
          Ref: "MyTestConstructHitsXXXXX",
        },
      },
    }
  );
});
```

ファイルを保存して、テストをもう一度実行します。

```bash
$ npm run test
```

今回のテストは失敗しますが、期待値の出力から環境変数の正しい値を入手できるはずです。


{{<highlight bash "hl_lines=20-21 24-25">}}
$ npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 FAIL  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (184ms)
  ✕ Lambda Has Environment Variables (53ms)

  ● Lambda Has Environment Variables

    expect(received).toEqual(expected) // deep equality

    - Expected  - 2
    + Received  + 2

      Object {
        "Variables": Object {
          "DOWNSTREAM_FUNCTION_NAME": Object {
    -       "Ref": "TestFunctionXXXXX",
    +       "Ref": "TestFunction22AD90FC",
          },
          "HITS_TABLE_NAME": Object {
    -       "Ref": "MyTestConstructHitsXXXXX",
    +       "Ref": "MyTestConstructHits24A357F0",
          },
        },
      }

      37 |     Environment: envCapture,
      38 |   });
    > 39 |   expect(envCapture.asObject()).toEqual(
         |                                 ^
      40 |     {
      41 |       Variables: {
      42 |         DOWNSTREAM_FUNCTION_NAME: {

      at Object.<anonymous> (test/hitcounter.test.ts:39:33)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        3.971 s, estimated 4 s
Ran all test suites.
{{</highlight>}}

環境変数の実際の値を取得し、テストの内容を更新します。

{{<highlight ts "hl_lines=22 25">}}
test('Lambda Has Environment Variables', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    })
  });
  // THEN
  const template = Template.fromStack(stack);
  const envCapture = new Capture();
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual(
    {
      Variables: {
        DOWNSTREAM_FUNCTION_NAME: {
          Ref: "VALUE_GOES_HERE",
        },
        HITS_TABLE_NAME: {
          Ref: "VALUE_GOES_HERE",
        },
      },
    }
  );
});
{{</highlight>}}

ここで、テストをもう一度実行します。今回は成功するはずです。

```bash
$ npm run test
```

次のような出力が表示されるはずです。

```bash
$ npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (182ms)
  ✓ Lambda Has Environment Variables (50ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        3.294s
Ran all test suites.
```

CDK コンストラクトの開発をテスト駆動開発手法 (Test Driven Development) でできます。
単純な例として、DynamoDB テーブルを暗号化する要件を追加しましょう。

まず、この新しい要件を反映するために、テストを更新します。


{{<highlight ts "hl_lines=6-23">}}
import { Template, Capture } from 'aws-cdk-lib/assertions';
import cdk = require('aws-cdk-lib');
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter }  from '../lib/hitcounter';

test('DynamoDB Table Created With Encryption', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    })
  });
  // THEN
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    SSESpecification: {
      SSEEnabled: true
    }
  });
});
{{</highlight>}}

ここでテストを実行すると、失敗するはずです。

```bash
$ npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 FAIL  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (170ms)
  ✓ Lambda Has Environment Variables (50ms)
  ✕ DynamoDB Table Created With Encryption (49ms)

  ● DynamoDB Table Created With Encryption

    Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.
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

      63 |
      64 |   const template = Template.fromStack(stack);
    > 65 |   template.hasResourceProperties("AWS::DynamoDB::Table", {
         |            ^
      66 |     SSESpecification: {
      67 |       SSEEnabled: true
      68 |     }

      at Template.hasResourceProperties (node_modules/aws-cdk-lib/assertions/lib/template.ts:50:13)
      at Object.<anonymous> (test/hitcounter.test.ts:65:12)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 3 passed, 4 total
Snapshots:   0 total
Time:        3.947 s, estimated 4 s
Ran all test suites.
```

次に、壊れたテストを直しましょう。hitcounter のコードを更新して、デフォルトで暗号化を有効にします。

{{<highlight ts "hl_lines=13">}}
export class HitCounter extends Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  /** the hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
      encryption: dynamodb.TableEncryption.AWS_MANAGED
    });
    ...
  }
}
{{</highlight>}}

次にテストを実行します。成功するはずです。

```bash
npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (171ms)
  ✓ Lambda Has Environment Variables (52ms)
  ✓ DynamoDB Table Created With Encryption (47ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        3.913s
Ran all test suites.
```

{{< nextprevlinks >}}