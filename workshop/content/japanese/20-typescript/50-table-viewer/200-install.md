+++
title = "ライブラリのインストール"
weight = 200
+++

## npm install

アプリケーションで table viewer を使用するために、npm モジュールをインストールする必要があります。

```
npm install cdk-dynamo-table-viewer@0.2.488
```

{{% notice info %}}

**Windowsユーザーへの注意** : Windowsでは、バックグラウンドで動いている、`npm run watch` コマンドを停止する必要があります。 停止後、`npm install` を実行し、再度 `npm run watch` を実行します。そうしなければ、使用中のファイルに関するエラーが発生します。

{{% /notice %}}

出力は次のようになります。

```text
added 1 package, and audited 392 packages in 377ms

49 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

----

これで、アプリケーションに table viewer を追加する準備ができました。

{{< nextprevlinks >}}