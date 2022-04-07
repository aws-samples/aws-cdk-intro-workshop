+++
title = "Table viewer コンストラクト"
weight = 100
+++

## ドキュメンテーションの確認

pypi.org の [cdk-dynamo-table-view のページ](https://pypi.org/project/cdk-dynamo-table-view/)
にアクセスして、モジュールのドキュメンテーションを確認しましょう。

README には table viewer の使い方に関するドキュメントがありますが、Python ではなく TypeScript 中心の内容です。そのため、Python のためにサードパーティのコンストラクトを使用するプロセスを見ていきましょう。

{{% notice warning %}}
ライブラリの README に記載されているように、本番環境での使用を意図したものではありません。ユーザを認証せずに、テーブルへのアクセスを可能にするからです。
{{% /notice %}}

![](./table-viewer-pypi.png)
