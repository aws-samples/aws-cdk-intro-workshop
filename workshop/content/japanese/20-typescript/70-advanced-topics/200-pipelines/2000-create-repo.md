+++
title = "リポジトリの作成"
weight = 120
+++

## パイプラインのスタックでリポジトリの作成
優れた CD パイプラインの最初のステップはソース管理です。
これから、プロジェクトコードを格納する [**CodeCommit**](https://aws.amazon.com/jp/codecommit/) リポジトリを作成します。

次のように `lib/pipeline-stack.ts` ファイルを編集します。

{{<highlight ts "hl_lines=2 9-12">}}
import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Creates a CodeCommit repository called 'WorkshopRepo'
        new codecommit.Repository(this, 'WorkshopRepo', {
            repositoryName: "WorkshopRepo"
        });

        // Pipeline code goes here
    }
}
{{</highlight>}}

## デプロイメント

```
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

> こちらの画面でリポジトリの内容を確認できます。現時点ではまだ空です。さらに、リポジトリの設定内容を参照できます。


最初は、ターミナルで `git status` を用いて、適用した変更が全てコミットされていることを確認します。
ステージングされていないことや、コミットされていない内容があれば、`git commit -am "SOME_COMMIT_MESSAGE_HERE"` で適用できます。
このコマンドで全てのファイルをステージ又はコミットしてくれるので、準備が完了です。

> 注意 : 最初からワークショップをたどるのではなく、リポジトリからソースコードをコピーした場合は、まずは `git init && git add -A && git commit -m "init"` を実行してください

デフォルトでは、CDKの `.gitignore` ファイルには 通常 npm-ts によって生成される全ての `*.js` ファイルを無視する参照が含まれています。しかし、Lambda のためのファイルは js で書かれているため無視してはいけません。`.gitignore` ファイルを編集してファイルの末尾に `!lambda/*.js`を追加します。これは、git に `lambda` フォルダにある全ての `*.js` ファイルを含めるように指示します。

{{<highlight shell "hl_lines=9">}}
*.js
!jest.config.js
*.d.ts
node_modules

# CDK asset staging directory
.cdk.staging
cdk.out
!lambda/*.js
{{</highlight>}}

コードを CodeCommit にプッシュする前に、ローカル git に変更をコミットする必要があります。

```
git add -A && git commit -m "Updated .gitignore"
```

次に、Git config にリモートリポジトリーを追加します。以下のコマンドで追加できます (*XXXXX* は AWS コンソールからコピーしたクローン URL を表します)。

```
git remote add origin XXXXX
```

最後に、リポジトリにソースコードをプッシュするだけです (`--set-upstream` はリポジトリで空になっている master ブランチを上書きするためです)。

```
git push --set-upstream origin master
```

ここで CodeCommitの認証情報が求められます。**Git 認証情報** セクションで作成した認証情報を使います。入力するのは 1回目だけです。

### 結果の確認
CodeCommit のコンソールを見ると、コードがプッシュされたことを確認できます！

![](./repo-code.png)
