+++
title = "ライブラリのインストール"
weight = 200
+++

## npm install

アプリケーションで table viewer を使用するために、npm モジュールをインストールする必要があります。

```
npm install cdk-dynamo-table-viewer@0.2.0
```

{{% notice info %}}

**Windowsユーザーへの注意** : Windowsでは、バックグラウンドで動いている、`npm run watch` コマンドを停止する必要があります。 停止後、`npm install` を実行し、再度 `npm run watch` を実行します。そうしなければ、使用中のファイルに関するエラーが発生します。

{{% /notice %}}

出力は次のようになります。

```text
+ cdk-dynamo-table-viewer@0.2.0
added 1 package from 1 contributor and audited 886517 packages in 6.704s
found 0 vulnerabilities
```

----

これで、アプリケーションに table viewer を追加する準備ができました。