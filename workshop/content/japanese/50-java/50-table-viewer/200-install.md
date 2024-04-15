+++
title = "ライブラリのインストール"
weight = 200
+++

## アーティファクトの追加

アプリケーションでテーブルビューアを使用する前に、アーティファクトを `pom.xml` ファイルに追加する必要があります。

{{<highlight xml "hl_lines=27-38">}}
...
    <dependencies>
        <!-- AWS Cloud Development Kit -->
        <dependency>
            <groupId>software.amazon.awscdk</groupId>
            <artifactId>aws-cdk-lib</artifactId>
            <version>${cdk.version}</version>
        </dependency>

        <!-- Additional Construct Libraries -->
        <dependency>
            <groupId>io.github.cdklabs</groupId>
            <artifactId>cdk-dynamo-table-view</artifactId>
            <version>0.2.0</version>
            <exclusions>
                <exclusion>
                    <groupId> software.amazon.jsii</groupId>
                    <artifactId>jsii-runtime</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
    </dependencies>
...
{{</highlight>}}

----

これで、アプリケーションに table viewer を追加する準備ができました。

{{< nextprevlinks >}}