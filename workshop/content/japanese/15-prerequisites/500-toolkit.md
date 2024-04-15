+++
title = "AWS CDK Toolkit"
weight = 500
+++

次に、AWS CDK Toolkit をインストールします。Toolkit は、CDK アプリを操作するためのコマンドラインユーティリティです。

ターミナルセッションを開き、以下のコマンドを実行します: 

- Windows: Administratorとして実行する必要があります
- POSIX: システムによっては `sudo` と共に実行する必要があります

```
npm install -g aws-cdk
```

Toolkit のバージョンを確認できます:

```
$ cdk --version
{{% cdkversion %}}
```

{{< nextprevlinks >}}