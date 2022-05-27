+++
title = "cdk init"
weight = 100
+++

## プロジェクトディレクトリの作成

空のディレクトリを作成し、カレントディレクトリを変更します。

```
mkdir cdk-workshop && cd cdk-workshop
```

## cdk init

新しい TypeScript CDK プロジェクトを作成するために `cdk init` を使います。

```
cdk init sample-app --language typescript
```

次のように出力されます（gitがインストールされていない場合、Gitリポジトリの初期化に関する警告が表示されますが、無視しても問題ありません。）


```
Applying project template app for typescript
Initializing a new git repository...
Executing npm install...
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN tst@0.1.0 No repository field.
npm WARN tst@0.1.0 No license field.

# Welcome to your CDK TypeScript project!

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CdkWorkshopStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
```

ご覧のとおり、作業を開始するのに役立つコマンドがたくさん表示されています。

## 参考情報

- [AWS CDK Command Line Toolkit (cdk) in the AWS CDK User Guide](https://docs.aws.amazon.com/CDK/latest/userguide/tools.html)
