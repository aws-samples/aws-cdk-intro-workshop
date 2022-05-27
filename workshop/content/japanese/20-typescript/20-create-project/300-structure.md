+++
title = "プロジェクトの構造"
weight = 300
+++

## IDEを開く

使い慣れたIDEでプロジェクトを開いてみましょう。

> VSCodeを使用する場合は、プロジェクトディレクトリ内で `code .` と入力するだけです。


## プロジェクトディレクトリを探索する

次のような内容が表示されます。


![](./structure.png)

* __`lib/cdk-workshop-stack.ts`__ CDKアプリケーションのメインスタックが定義されます。今回のワークショップでほとんどの時間を費やすことになるファイルです。
* `bin/cdk-workshop.ts` CDKアプリケーションのエントリポイントです。lib/cdk-workshop-stack.ts で定義されたスタックをロードします。
* `package.json` npmモジュールのマニフェストです。アプリの名前、バージョン、依存関係、"watch" や "build" 用のビルドスクリプトなどの情報が含まれます（package-lock.json はnpmによって管理されます）
* `cdk.json` アプリの実行方法をツールキットに指示させるためのファイルです。今回の場合は、 `"npx ts-node bin/cdk-workshop.ts"` です。
* `tsconfig.json` プロジェクトの [TypeScript 設定](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) です。
* `.gitignore` と `.npmignore` Gitとnpm用のファイルです。ソースコードの管理に含める/除外するファイルと、パッケージマネージャーへの公開用設定が含まれています。
* `node_modules` npmによって管理され、プロジェクトのすべての依存関係が含まれます。

## エントリーポイント

`bin/cdk-workshop.ts` ファイルを簡単に見てみましょう。

```js
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkWorkshopStack } from '../lib/cdk-workshop-stack';

const app = new cdk.App();
new CdkWorkshopStack(app, 'CdkWorkshopStack');
```

このコードは、`lib/cdk-workshop-stack.ts` から `CdkWorkshopStack` クラス をロードしてインスタンス化するものです。

## メインスタック

`lib/cdk-workshop-stack.ts` を開いてください。これがアプリケーションの要のファイルです。

```ts
import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'CdkWorkshopQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    const topic = new sns.Topic(this, 'CdkWorkshopTopic');

    topic.addSubscription(new subs.SqsSubscription(queue));
  }
}
```

ご覧のとおり、CDK スタック(`CdkWorkshopStack`)によってアプリケーションが作成されます。

このスタックは次のリソースを含んでいます。

- SQS キュー (`new sqs.Queue`)
- SNS トピック (`new sns.Topic`)
- SNS トピックにパブリッシュされたメッセージを受信するように SQS キューをサブスクライブします。 (`topic.addSubscription`)
