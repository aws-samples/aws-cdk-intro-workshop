+++
title = "クリーンアップ"
weight = 60
chapter = true
+++

# スタックのクリーンアップ

AWS アカウントでの予期せぬ費用を防ぐために、必ず CDK スタックを削除してください。

AWS CloudFormation コンソールで削除するか、`cdk destroy` でスタックを削除できます。

```
cdk destroy
```

以下のように質問が表示されます。

```
Are you sure you want to delete: cdk-workshop (y/n)?
```

"y" を入力すれば、スタックが削除されていくことを確認できます。
