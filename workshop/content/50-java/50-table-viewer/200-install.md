+++
title = "Installing the library"
weight = 200
+++

## Add Artifact

Before you can use the table viewer in your application, you'll need to add the artifact to your `pom.xml` file:

{{<highlight xml "hl_lines=27-32">}}
...
    <dependencies>
        <!-- AWS Cloud Development Kit -->
        <dependency>
            <groupId>software.amazon.awscdk</groupId>
            <artifactId>core</artifactId>
            <version>VERSION</version>
        </dependency>

        <!-- Respective AWS Construct Libraries -->
        <dependency>
            <groupId>software.amazon.awscdk</groupId>
            <artifactId>apigateway</artifactId>
            <version>VERSION</version>
        </dependency>
        <dependency>
            <groupId>software.amazon.awscdk</groupId>
            <artifactId>dynamodb</artifactId>
            <version>VERSION</version>
        </dependency>
        <dependency>
            <groupId>software.amazon.awscdk</groupId>
            <artifactId>lambda</artifactId>
            <version>VERSION</version>
        </dependency>

        <!-- Additional Construct Libraries -->
        <dependency>
            <groupId>com.github.eladb</groupId>
            <artifactId>cdk-dynamo-table-viewer</artifactId>
            <version>[3.0.6,4)</version>
        </dependency>
    </dependencies>
...
{{</highlight>}}

----

Now we are ready to add a viewer to our app.
