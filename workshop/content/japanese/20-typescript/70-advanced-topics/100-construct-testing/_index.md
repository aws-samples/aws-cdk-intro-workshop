+++
title = "コンストラクトのテスト"
weight = 100
bookCollapseSection = true
+++

## コンストラクトのテスト (オプション)

[CDK デベロッパーガイド](https://docs.aws.amazon.com/cdk/latest/guide/testing.html) には、コンストラクトのテストについてのガイドがあります。
このワークショップのセクションでは [きめ細かな(fine-grained) アサーション](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_fine_grained) と [検証(validation)](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_validation) の種類のテストを利用します。

#### CDK アサートライブラリ

このセクションでは CDK の `assertions` (`aws-cdk-lib/assertions`) ライブラリを利用します。
このライブラリはユニットテストとインテグレーションテストを書くためのヘルパー関数を持っています。


このワークショップでは主に `hasResourceProperties` 関数を使います。
このヘルパー関数は特定のタイプのリソースの存在 (論理IDに関係なく) と、_特定_ のプロパティの値を検証する時に使います。

例:

```ts
template.hasResourceProperties('AWS::CertificateManager::Certificate', {
    DomainName: 'test.example.com',

    ShouldNotExist: Match.absent(),
    // Note: some properties omitted here
});
```

`Match.absent()` はオブジェクトの特定のキーが設定*されていない* (或いは `undefined` に設定されている) ことのアサートに使えます。

詳しい説明は、[こちら](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.assertions-readme.html)のドキュメントを参照してください。
