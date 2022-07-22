+++
title = "cdk init"
weight = 100
+++

## プロジェクトディレクトリの作成

空のディレクトリを作成し、カレントディレクトリを変更します。

```
mkdir cdk_workshop && cd cdk_workshop
```

## cdk init

新しい Java CDK プロジェクトを作成するために `cdk init` を使います。

```
cdk init sample-app --language java
```

次のように出力されます（Gitがインストールされていない場合、Gitリポジトリの初期化に関する警告が表示されますが、無視しても問題ありません。）

```
Applying project template sample-app for java
# Welcome to your CDK Java project!

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CdkWorkshopStack`)
which contains an Amazon SNS topic that is subscribed to an Amazon SQS queue.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

It is a [Maven](https://maven.apache.org/) based project, so you can open this project with any Maven compatible Java IDE to build and run tests.

## Tutorial
See [this useful workshop](https://cdkworkshop.com/50-java.html) on working with the AWS CDK for Java projects.

## Useful commands

 * `mvn package`     compile and run tests
 * `cdk ls`          list all stacks in the app
 * `cdk synth`       emits the synthesized CloudFormation template
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk docs`        open CDK documentation

Enjoy!

Initializing a new git repository...
Executing 'mvn package'

✅ All done!
```

ご覧のとおり、作業を開始するのに役立つコマンドがたくさん表示されています。

## 参考情報

- [AWS CDK Command Line Toolkit (cdk) in the AWS CDK User Guide](https://docs.aws.amazon.com/CDK/latest/userguide/tools.html)
