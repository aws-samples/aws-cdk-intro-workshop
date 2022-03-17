+++
title = "virtualenvのアクティベート"
weight = 200
+++

## virtualenvのアクティベート

前のステップで実行した init スクリプトは、作業を開始するのに役立つ一連のコードを作成しましたが、ディレクトリ内に仮想環境も作成しています。 virtualenv によってシステムの Python を汚すことなく任意のパッケージをインストールできる隔離された個別の環境を持つことができます。virtualenv の詳しい説明は[こちら](https://docs.python.org/3/tutorial/venv.html)をご参照ください。

作成された仮想環境を利用するには、仮想環境をアクティベートする必要があります。生成された README ファイルに書かれているとおりですが、肝心なアクティベートの方法は次のとおりです。

Linux または macOS プラットフォームで virtualenv をアクティベートするには、こちらを使用します。

```
source .venv/bin/activate
```

Windowsプラットフォームでは、こちらを使用します。

```
.venv\Scripts\activate.bat
```

これで仮想環境がアクティブになったので、必要な python モジュールを安全にインストールできます。

```
pip install -r requirements.txt
```
