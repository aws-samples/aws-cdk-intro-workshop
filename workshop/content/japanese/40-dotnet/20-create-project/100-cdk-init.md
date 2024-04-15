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

新しい C# CDK プロジェクトを作成するために `cdk init` を使います。

```
cdk init sample-app --language csharp
```

次のように出力されます（gitがインストールされていない場合、Gitリポジトリの初期化に関する警告が表示されますが、無視しても問題ありません。）

```
Applying project template sample-app for csharp
Project 'CdkWorkshop/CdkWorkshop.csproj' ajouté à la solution.
Initializing a new git repository...
# Welcome to your CDK C# project!

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CdkWorkshopStack`)
which contains an Amazon SNS topic that is subscribed to an Amazon SQS queue.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

It uses the [.NET Core CLI](https://docs.microsoft.com/dotnet/articles/core/) to compile and execute your project.

## Useful commands

* `dotnet build src` compile this app
* `cdk ls`           list all stacks in the app
* `cdk synth`        emits the synthesized CloudFormation template
* `cdk deploy`       deploy this stack to your default AWS account/region
* `cdk diff`         compare deployed stack with current state
* `cdk docs`         open CDK documentation

Enjoy!

```

ご覧のとおり、作業を開始するのに役立つコマンドがたくさん表示されています。

## 参考情報

- [AWS CDK Command Line Toolkit (cdk) in the AWS CDK User Guide](https://docs.aws.amazon.com/CDK/latest/userguide/tools.html)

{{< nextprevlinks >}}