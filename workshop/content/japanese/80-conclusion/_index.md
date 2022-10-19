+++
title = "まとめ"
weight = 80
chapter = true
+++

# お疲れ様でした！

無事に __AWS CDK イントロワークショップ__ を完了することができました。

このワークショップでは、以下のやり方を学びました。

- `cdk init` を使って新しい TypeScript の CDK プロジェクトの作成
- CDK アプリケーションのスタックへのにリソースの追加
- `cdk diff` と `cdk deploy` を使ってアプリケーションを AWS の環境へのデプロイ
- 独自のコンストラクト (`HitCounter`) の作成と使用
- 別の npm モジュールからコンストラクト (`cdk-dynamo-table-viewer`) の利用
- AWS Lambda、API Gateway、および DynamoDB の AWS コンストラクトライブラリの使用
## 次は？

AWS CDK はまだ開発中です。現在、開発者プレビュー中です。このフレームワークについて思ったことを聞かせていただければ幸いです。

ここからできることはいくつかあります。

* __何かを作る__ : CDKでリアルなものを作って、どうだったか教えてください。うまくいったこと？直感的だったのは何ですか？誤解を招くところがありましたか？
* __コンストラクトライブラリの公開__ : インフラはモノリシックなテンプレートではなく、再利用可能なモジュールとして考え始めてみてください。構築された素敵な部品を選んで、API化してみてください。コミュニティに共有したら、教えてください。公開なコンストラクトのリストを提供しているので、あなたのコンストラクトもリストに追加させたいただければと思っています。
* [Hello World チュートリアル](https://docs.aws.amazon.com/CDK/latest/userguide/hello_world_tutorial.html) で簡単なアプリケーションを好きな言語 Java、.NET、JavaScript または TypeScript で作ってみてください。
* [CDK コンセプト](https://docs.aws.amazon.com/cdk/latest/guide/core_concepts.html) の深堀 :
  [コンストラクト](https://docs.aws.amazon.com/CDK/latest/userguide/constructs.html)、
  [アプリケーション](https://docs.aws.amazon.com/CDK/latest/userguide/apps.html) と [スタック](https://docs.aws.amazon.com/CDK/latest/userguide/stacks.html)、
  [ロジカル IDs](https://docs.aws.amazon.com/cdk/latest/guide/identifiers.html#identifiers_logical_ids)、
  [環境](https://docs.aws.amazon.com/cdk/latest/guide/environments.html)、
  [コンテキスト](https://docs.aws.amazon.com/cdk/latest/guide/context.html)、
  [アセット](https://docs.aws.amazon.com/CDK/latest/userguide/assets.html)
* [AWS コンストラクトライブラリ](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html#constructs_lib) と
  [リファレンスドキュメンテーション](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html) を探索して、
  [EC2](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2-readme.html)、
  [AutoScaling](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_autoscaling-readme.html)、
  [S3](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3-readme.html)、
  [SNS](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_sns-readme.html)、
  [SQS](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_sqs-readme.html)、
  [CodePipeline](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_codepipeline-readme.html)、
  [Step Functions](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_stepfunctions-readme.html)
  のような AWS リソースに対応したコンストラクトが多数提供されています。
* [コンストラクトの書き方](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html#constructs_author) のガイドラインを読んでください。
* CDK のマルチ言語対応の裏にある [__jsii__](https://github.com/aws/jsii) について学べます。
* GitHub リポジトリで [サンプル](https://github.com/aws-samples/aws-cdk-examples) を参考できます。

-----

* [Gitter チャンネル](https://gitter.im/awslabs/aws-cdk) に参加
* [Stack Overflow](https://stackoverflow.com/questions/tagged/aws-cdk) で質問
* GitHub で [issue](https://github.com/aws/aws-cdk/issues/new) を作成
* プロジェクトに [コントリビュート](https://github.com/aws/aws-cdk/blob/v1-main/CONTRIBUTING.md)

-----

___ありがとうございました！___

AWS CDK チームより
