+++
title = "HitCounter のテスト"
weight = 700
+++

## いくつかのテストリクエストを実行してみる

いくつかのリクエストを実行して、HitCounter が動作するかどうかを確認しましょう。ウェブブラウザでもできます。

```
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hello
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hello/world
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hello/world
```

## DynamoDB コンソールを開く

1. [DynamoDB console](https://console.aws.amazon.com/dynamodb/home) にアクセスする。
2. テーブルを作成したリージョンにいることを確認してください。
3. ナビゲーションペインから `テーブル` を選択し、`cdkworkshop-HelloHitCounterHits` で始まるテーブルを選択します。
4. テーブルを開き、`テーブルアイテムの探索` ボタンをクリックします。
5. パス毎のアクセス回数を確認できます。

    ![](./dynamo1.png)

6. 新しいパスにアクセスして、 テーブルの項目の表示を更新すると、新しいアイテムには `hits` カウントが設定されています。

## Good job!

`HitCounter` は大変便利だということがご理解いただけたと思います。基本的に、誰でも API Gateway
のプロキシバックエンドとして機能する Lambda 関数にアタッチでき、この API のアクセスを記録できます。

HitCounter はシンプルな Python クラスであるため、pip モジュールとしてパッケージ化して、Python のパッケージマネージャーである [PyPi](http://pypi.org/) に公開できます。公開後は、pip install で誰でもインストールでき、CDK アプリケーションに追加できます。

-----

次の章では、HitCounter テーブルの内容をブラウザで表示することを可能とする、PyPi に公開されたコンストラクトライブラリを使用します。
