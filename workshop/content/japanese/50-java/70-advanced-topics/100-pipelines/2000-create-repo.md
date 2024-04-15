+++
title = "リポジトリの作成"
weight = 120
+++

## パイプラインのスタックでリポジトリの作成

優れた CD パイプラインの最初のステップはソース管理です。
これから、プロジェクトコードを格納する [**CodeCommit**](https://aws.amazon.com/jp/codecommit/) リポジトリを作成します。

次のように `WorkshopPipelineStack.java` ファイルを編集します。

{{<highlight java "hl_lines=7 17-20">}}
package com.myorg;

import software.constructs.Construct;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;

import software.amazon.awscdk.services.codecommit.Repository;

public class WorkshopPipelineStack extends Stack {
    public WorkshopPipelineStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public WorkshopPipelineStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        // This creates a new CodeCommit repository called 'WorkshopRepo'
        final Repository repo = Repository.Builder.create(this, "WorkshopRepo")
            .repositoryName("WorkshopRepo")
            .build();

        // Pipeline code goes here
    }
}
{{</highlight>}}

## デプロイ

これで、アプリをデプロイして新しいリポジトリを確認できます。
以下のコマンドを実行してください。

```
mvn package
npx cdk deploy
```

## リポジトリ情報の取得とコミット
リポジトリで何かをする前に、ソースコードをリポジトリに追加する必要があります。

### Git 認証情報
先にリポジトリの Git 認証情報が必要です。
[IAM コンソール](https://console.aws.amazon.com/iam) を開き、`ユーザー` 画面で対象ユーザを開きます。
ユーザー管理画面で `認証情報` タブを開き、「AWS CodeCommit の HTTPS Git 認証情報」セクションまでスクロールします。
認証情報を生成 ボタンをクリックし、指示に従って認証情報をダウンロードします。すぐに利用します。

![](./git-cred.png)

### Git remote の追加
[CodeCommit コンソール](https://console.aws.amazon.com/codesuite/codecommit/repositories) に移動してリポジトリを特定します。「URL のクローン」列の「HTTPS」をクリックして https のリンクがコピーされます。その値をローカルリポジトリに追加します。

> 注意 : リポジトリが表示されない場合は、コンソールが表示する AWS リージョンが正しいことを確認してください。

![](./clone-repo.png)

> こちらの画面でリポジトリの内容を確認できます。現時点ではまだ空ですが、リポジトリの設定内容を参照できます。

最初は、ターミナルで `git status` を用いて、適用した変更が全てコミットされていることを確認します。
ステージングされていないことや、コミットされていない差分があれば、`git commit -am "SOME_COMMIT_MESSAGE_HERE"` で適用できます。これですべてのファイルがステージング、コミットされ、準備は完了です！

> 注意 : 最初からワークショップをたどるのではなく、リポジトリからソースコードをコピーした場合は、まずは `git init && git add -A && git commit -m "init"` を実行してください
> 
> 注意 : デフォルトでは、CDKの `.gitignore` ファイルには 通常 npm-ts によって生成される全ての `*.js` ファイルを無視する参照が含まれています。しかし、JavaScriptで書かれた Lambda のためのファイルがあれば、無視されないようにする必要があります。`.gitignore` ファイルを編集してファイルの末尾に `!lambda/*.js`を追加します。これによって、 `lambda` フォルダにある全ての `*.js` ファイルをgit に含めるように設定できました。

次に、Git config にリモートリポジトリーを追加します。以下のコマンドで追加できます (*XXXXX* は AWS コンソールからコピーしたクローン URL を表します)。

```
git remote add origin XXXXX
```

最後に、リポジトリにソースコードをプッシュするだけです (`--set-upstream` はリポジトリで空になっている main ブランチを上書きするためです)。

```
git push --set-upstream origin main
```

ここで CodeCommitの認証情報が求められます。**Git 認証情報** セクションで作成した認証情報を使います。入力するのは 1回目だけです。

### 結果の確認
CodeCommit のコンソールを見ると、コードがプッシュされたことを確認できます！

![](./repo-code.png)

{{< nextprevlinks >}}