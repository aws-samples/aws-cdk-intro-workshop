+++
title = "Instalando la librería"
weight = 200
+++

## Agregando el artefacto

Antes de que podamos usar el _table viewer_ en nuestra aplicación, tendremos que agregar el artefacto a nuestro archivo `pom.xml`:

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

Ahora estamos listos para agregar el _table viewer_ a nuestra aplicación.
