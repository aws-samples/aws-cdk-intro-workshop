+++
title = "コンストラクトのテスト"
weight = 100
+++

## コンストラクトのテスト (オプション)

[CDK デベロッパーガイド](https://docs.aws.amazon.com/ja_jp/cdk/v2/guide/testing.html) には、コンストラクトのテストについてのガイドがあります。
このワークショップのセクションでは [きめ細かな(fine-grained) アサーション](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_fine_grained) と [検証(validation)](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_validation) の種類のテストを利用します。

### 前提条件

1. 必要なテストパッケージをインストールします

`pom.xml` を編集して、次の依存ライブラリを追加します

{{<highlight xml "hl_lines=8-13">}}
<?xml version="1.0" encoding="UTF-8"?>
<project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd"
         xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dependencies>

        ...

        <dependency>
            <groupId>org.assertj</groupId>
            <artifactId>assertj-core</artifactId>
            <version>3.18.1</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
{{</highlight>}}

#### CDK アサートライブラリ

このセクションでは CDK の `assertions` (`software.amazon.awscdk.assertions`) ライブラリを利用します。
このライブラリはユニットテストとインテグレーションテストを書くためのヘルパー関数が含まれています。

このワークショップでは主に `hasResourceProperties` 関数を使います。
このヘルパー関数は特定のタイプのリソースの存在 (論理IDに関係なく) と、_特定_ のプロパティの値を検証する時に使います。

例:

```java
Map<String, Object> expected = Map.of(
    "DomainName", "test.example.com",
)
template.hasResourceProperties("AWS::CertificateManager::Certificate", expected);
```

詳しい説明は、[こちら](https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/assertions/README.md)のドキュメントを参照してください。
