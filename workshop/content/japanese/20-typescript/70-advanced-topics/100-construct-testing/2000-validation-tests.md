+++
title = "バリデーションテスト"
weight = 300
+++

### バリデーションテスト

場合によって、入力値を可変にする必要がありますが、その値に対して制約を設定したり、値の有効性を検証したりすることも必要です。

例えば、`HitCounter` コンストラクトに対して、 DynamoDB の `readCapacity` を指定できるようにします。
ユーザにリーズナブルな範囲で値を指定してもらいたいです。ひとまず、バリデーションロジックが正常に動作していることを確認するためのテストを書きます。
敢えて無効な値を指定して、結果を確認します。

まず、`HitCounterProps` インタフェースに、 `readCapacity` プロパティーを追加します。

{{<highlight ts "hl_lines=12">}}
export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;

  /**
   * The read capacity units for the table
   *
   * Must be greater than 5 and lower than 20
   *
   * @default 5
   */
  readCapacity?: number;
}
{{</highlight>}}

次は、DynamoDB テーブルのリソースに `readCapacity` プロパティを追加します。

{{<highlight ts "hl_lines=4">}}
const table = new dynamodb.Table(this, 'Hits', {
  partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
  encryption: dynamodb.TableEncryption.AWS_MANAGED,
  readCapacity: props.readCapacity ?? 5
});
{{</highlight>}}

以下のように、`readCapacity` が範囲外である時にエラーを渡すバリデーションを追加します。


{{<highlight ts "hl_lines=9-11">}}
export class HitCounter extends Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  /** the hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
      throw new Error('readCapacity must be greater than 5 and less than 20');
    }

    super(scope, id);
    // ...
  }
}
{{</highlight>}}

最後に、エラーが渡されることを確認するテストを追加します。

```typescript
test('read capacity can be configured', () => {
  const stack = new cdk.Stack();

  expect(() => {
    new HitCounter(stack, 'MyTestConstruct', {
      downstream:  new lambda.Function(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'hello.handler',
        code: lambda.Code.fromAsset('lambda')
      }),
      readCapacity: 3
    });
  }).toThrowError(/readCapacity must be greater than 5 and less than 20/);
});
```

テストを実行すると

```bash
$ npm run test
```

以下のような出力を確認できるはずです。

```bash
$ npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (206 ms)
  ✓ Lambda Has Environment Variables (61 ms)
  ✓ DynamoDB Table Created With Encryption (55 ms)
  ✓ Read Capacity can be configured (14 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        4.755 s, estimated 5 s
Ran all test suites.
```

{{< nextprevlinks >}}