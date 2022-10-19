+++
title = "CDK Pipelines"
weight = 200
chapter = true
+++

# CDK Pipelines

この章では、前の章で開発したアプリの継続的デプロイメントパイプライン (CD パイプライン) を作成します。

継続的デプロイメントはほとんどのウェブプロジェクトにとって重要なコンポーネントですが、網羅的にテストを行うのは難しい場合があります。[CDK Pipelines](https://docs.aws.amazon.com/ja_jp/cdk/v2/guide/cdk_pipeline.html) コンストラクトは、既存の CDK インフラストラクチャ設計からそのプロセスを容易かつ合理的に実現します。

それぞれのパイプラインは、ソースコードの管理方法から、ビルドされた全てのアーティファクトのデプロイ方法まで、デプロイプロセスのフェーズを表す「ステージ」で構成されます。

![](./pipeline-stages.png)
