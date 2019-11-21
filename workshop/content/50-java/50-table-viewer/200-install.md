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
            <version>1.17.1.DEVPREVIEW</version>
        </dependency>

        <!-- Respective AWS Construct Libraries -->
        <dependency>
            <groupId>software.amazon.awscdk</groupId>
            <artifactId>lambda</artifactId>
            <version>1.17.1.DEVPREVIEW</version>
        </dependency>
        <dependency>
            <groupId>software.amazon.awscdk</groupId>
            <artifactId>apigateway</artifactId>
            <version>1.17.1.DEVPREVIEW</version>
        </dependency>
        <dependency>
            <groupId>software.amazon.awscdk</groupId>
            <artifactId>dynamodb</artifactId>
            <version>1.17.1.DEVPREVIEW</version>
        </dependency>

        <!-- Additional Construct Libraries -->
        <dependency>
            <groupId>com.github.eladb</groupId>
            <artifactId>cdk-dynamo-table-viewer</artifactId>
            <version>3.0.6</version>
        </dependency>
    </dependencies>
...
{{</highlight>}}

----

Now we are ready to add a viewer to our app.
