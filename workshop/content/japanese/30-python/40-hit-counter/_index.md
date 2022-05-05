+++
title = "コンストラクトを書く"
chapter = true
weight = 40
+++

# コンストラクトを書く

この章では、`HitCounter` という新しいコンストラクトを定義します。このコンストラクトは
API Gateway のバックエンドで利用する Lambda 関数にアタッチすれば、各 URL
のパス毎に何回のアクセスがあったかをカウントできます。その情報を DynamoDB のテーブルに格納します。

![](/images/hit-counter.png)

## 参考情報

- [AWS CDK ユーザガイド - コンストラクトの書き方](https://docs.aws.amazon.com/ja_jp/cdk/v1/guide/constructs.html#constructs_author)