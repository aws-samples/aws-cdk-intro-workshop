+++
title = "クリーンアップ"
weight = 60
chapter = true
+++

# スタックのクリーンアップ

AWS アカウントへの予期しない請求を防ぐために、必ず CDK スタックを削除してください。

AWS CloudFormation コンソールで削除するか、`cdk destroy` を実行してください。

```
cdk destroy
```

以下のように質問が表示されます。

```text
Are you sure you want to delete: cdk-workshop (y/n)?
```

"y" を入力すれば、スタックが削除されていくことを確認できます。
