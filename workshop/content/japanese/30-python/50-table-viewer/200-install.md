+++
title = "ライブラリのインストール"
weight = 200
+++

## pip install

アプリケーションで table viewer を使用するために、Python モジュールをインストールする必要があります。以下の内容を `requirements.txt` に追加してください。

{{<highlight python "hl_lines=3">}}
aws-cdk-lib==2.37.0
constructs>=10.0.0,<11.0.0
cdk-dynamo-table-view==0.2.488
{{</highlight>}}

virtualenv が有効であれば、次のコマンドで依存関係をインストールすることができます。

```
$ pip install -r requirements.txt
```

出力されるログの最後の2行（たくさんあるので省略します）は、次のようになります。

```
Installing collected packages: cdk-dynamo-table-view
Successfully installed cdk-dynamo-table-view-0.2.488
```

これで、アプリケーションに table viewer を追加する準備ができました。

{{< nextprevlinks >}}