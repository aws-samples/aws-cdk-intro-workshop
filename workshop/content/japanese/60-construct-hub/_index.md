+++
title = "Construct Hub"
weight = 60
chapter = true
+++

# The Construct Hub

[Construct Hub](https://constructs.dev/) では、AWS や  [AWS パートナーネットワーク](https://aws.amazon.com/partners/)、サードパーティ、および開発者コミュニティによって作成されたコンストラクトを、ワンストップで検索、再利用、共有することが出来ます。 このサイトには、現在サポートされているプログラミング言語 Typescript、Java、Python、.NET のコンストラクトがリストされています（Go のリストは近日公開予定）。CDK コンストラクトは、本番環境のクラウドアプリケーションを立ち上げるためにも使用できるクラウドアーキテクチャのビルディングブロックおよびパターンです。 Construct Hubにリストされているコンストラクトは、[AWS Cloud Development Kit](https://aws.amazon.com/cdk/) (AWS CDK)、[CDK for Kubernetes](https://cdk8s.io/) (CDK8s)、および [CDK for Terraform](https://github.com/hashicorp/terraform-cdk) (CDKtf)を使用して作成されています。これらの各CDKライブラリの詳細については、個々のサイト/リポジトリを参照してください。

私たちは [コンストラクト](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html) を「システム状態の一部」を定義するクラスとして定めています。コンストラクトは、より複雑な状態を表す上位レベルのビルディングブロックを形成するために一緒に構成できます。AWS、エンタープライズ企業、スタートアップ企業、および個々の開発者は、CDK コンストラクトを使用して、実証済みのアーキテクチャパターンを再利用可能なコードライブラリとして共有します。これにより、誰もがコミュニティの集合知から恩恵を受けることができます。

AWS のクラウドサービスに加えて、Twitter や Slack などのクラウドサービスプロバイダーやユーティリティ、製品、テクノロジーとの何百ものインテグレーションを見つけることができます。その他にも、Grafana, Prometheus, Next.js, Gitlab などがあります。

Construct Hubは、CDKユーザーがアプリケーションを構築するのに役立つ包括的なコンストラクトのコレクションを見つけることができる中心的な場所です。Construct Hub は、公開されているコンストラクトライブラリを一覧表示することで、開発者がアプリケーションを構築するために必要なハイレベルのビルディングブロックを簡単に見つけられるようにします。


## コンストラクトを探して利用する
https://constructs.dev を参照し、使用されている AWS サービスの名前 (例えば "eks" や "dynamodb")、ライブラリの作成者 (例えば "pahud")、または CDK タイプ (例えば "cdktf" や "cdk8s") などのキーワードに基づいてコンストラクトを検索します。

見つけることができるコンストラクトの例としては、Datadog で Python と Node.js の Lambda 関数を計測する datadog-cdk-constructs、GitLab ランナーを作成してパイプラインジョブを実行する cdk-gitlab-runner、K3s クラスターをデプロイする cdk-k3s-cluster などがあります。Construct Hub の Web サイトには、入門リソースへのリンクも含まれています。以下は、「bucket」キーワードを含み、Python言語をサポートするコンストラクトの検索結果の例です。

![](./60-construct-hub/construct-hub-1.png)

Construct Hub にリストされているコンストラクトライブラリには、パッケージのインストール方法 ("Use Construct" をクリック) の説明が記載された詳細ページと、このライブラリのすべてのクラス、インターフェイス、列挙型、およびデータ型を記述した API リファレンスが含まれています。APIリファレンスとコードサンプルは、選択したプログラミング言語で表示され、jsiiコンパイラによって生成された型情報から自動的に生成されます（jsiiは、多言語ライブラリを作成するためのTypeScriptベースのプログラミング言語です）。


## Construct Hubにコントラクトを表示するには
あなたが作成したコンストラクトを Construct Hubに表示するには、次の基準で作成されている必要があります。

* [npmjs.com](https://npmjs.com/) に公開されていること
* 次のライセンスのいずれかを使用していること: _Apache, BSD, EPL, MPL-2.0, ISC and CDDL or MIT_
* サポートしているキーワード (awscdk, cdk8s or cdktf) のいずれかで注釈がつけられていること
* [jsii](https://aws.github.io/jsii/) でコンパイルされていること

コンストラクトライブラリを公開するパブリッシャーは、次の方法で Construct Hub 上の コンストラクトライブラリ の表示を改善できます。

* コンストラクトのソースコードとドキュメントへのリンクを追加する
* READMEファイルに使用方法を含める
* パッケージページに表示され、検索に使用できる関連キーワードを追加する

各パッケージはパブリッシャーが所有しているため、バグレポートやプルリクエストなどのコントリビューションは、パブリッシャーが提供するリポジトリリンクを介して行う必要があります。パッケージページの ‘Provide feedback’ リンクを押して、パッケージのリポジトリで新しい Issue を開くことができます。

追加情報および独自のコンストラクトを提出するには、[Contributeのページ](https://constructs.dev/contribute) を参照してください。


## 内部利用
Construct Hub のインスタンスを内部目的で使用することに興味がある場合は、誰でも自分のインスタンスをデプロイできるように [ライブラリ](https://github.com/cdklabs/construct-hub) を開発中です。このライブラリは現在概念実証段階にあり、そのリポジトリに関するフィードバックや支援をいただければ幸いです。
