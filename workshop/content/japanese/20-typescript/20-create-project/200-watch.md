+++
title = "npm run watch"
weight = 200
+++

## TypeScriptコードのコンパイル

TypeScriptソースはJavaScriptにコンパイルする必要があるため、ソースファイルに変更を加えるたびに、ソースファイルを.jsにコンパイルする必要があります

{{% notice info %}}
このステップの最後に実行する、`npm run watch` コマンドを実行したターミナルのセッションは残したままにしてください。
{{% /notice %}}

`npm run watch` コマンドで呼ばれるスクリプトについては、既に設定されています。



## 新しいターミナルウィンドウを開く

__新しい__ ターミナルセッション（またはタブ）を開きます。ワークショップの間、このウィンドウをバックグラウンドで開いたままにします。

## 変更を監視する

プロジェクトディレクトリで次のコマンドを実行します。

```
cd cdk-workshop
```

続けて、次を実行します。

```
npm run watch
```

次に、画面がクリアされ、以下が表示されます。

```
Starting compilation in watch mode...
Found 0 errors. Watching for file changes.
...
```

これにより、TypeScriptコンパイラ（`tsc`）が"watch"モードで起動し、プロジェクトディレクトリが監視され、`.ts` ファイルを変更すると自動的に `.js` へコンパイルされます。

----

{{% notice info %}}
ワークショップ中は、`watch` コマンドが実行されているターミナルウィンドウを開いたままにしてください。
{{% /notice %}}

----
