+++
title = "コンストラクトのテスト"
weight = 100
+++

## コンストラクトのテスト (オプション)

[CDK デベロッパーガイド](https://docs.aws.amazon.com/ja_jp/cdk/v2/guide/testing.html) には、コンストラクトのテストについてのガイドがあります。
このワークショップのセクションでは [きめ細かな(fine-grained) アサーション](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_fine_grained) と [検証(validation)](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_validation) の種類のテストを利用します。

### 前提条件

1. 必要なテスト用のパッケージをインストールします。

```bash
$ pip install -r requirements-dev.txt
```

#### CDK アサートライブラリ

このセクションでは CDK の `assertions` (`aws_cdk.assertions`) ライブラリを利用します。
このライブラリはユニットテストとインテグレーションテストを書くためのヘルパー関数を持っています。


このワークショップでは主に `has_resource_properties` 関数を使います。
このヘルパー関数は特定のタイプのリソースの存在 (論理IDに関係なく) と、_特定_ のプロパティの値を検証する時に使います。

例:

```python
template.has_resource_properties("AWS::CertificateManager::Certificate", {
    "DomainName": "test.example.com",
    "ShouldNotExist": Match.absent(),
})
```

`Match.absent()` はオブジェクトの特定のキーが設定*されていない* (或いは `undefined` に設定されている) ことのアサートに使えます。

詳しい説明は、[こちら](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.assertions/README.html)のドキュメントを参照してください。
