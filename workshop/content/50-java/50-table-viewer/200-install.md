+++
title = "Installing the library"
weight = 200
+++

## Add Artifact

Before you can use the table viewer in your application, you'll need to add the artifact to your `pom.xml` file:

{{<highlight xml "hl_lines=27-38">}}
...
    <dependencies>
        <!-- AWS Cloud Development Kit -->
        <dependency>
            <groupId>software.amazon.awscdk</groupId>
            <artifactId>aws-cdk-lib</artifactId>
            <version>VERSION</version>
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

Now we are ready to add a viewer to our app.
