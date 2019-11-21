+++
title = "Define resources"
weight = 300
+++

## Add resources to the hit counter construct

Now, let's define the AWS Lambda function and the DynamoDB table in our
`HitCounter` construct.

As usual, we first need to install the DynamoDB construct library (we already
have the Lambda library installed):

{{<highlight xml "hl_lines=21-25">}}
...
    <dependencies>
        <!-- AWS Cloud Development Kit -->
        <dependency>
            <groupId>software.amazon.awscdk</groupId>
            <artifactId>core</artifactId>
            <version>*.*.*</version>
        </dependency>

        <!-- Respective AWS Construct Libraries -->
        <dependency>
            <groupId>software.amazon.awscdk</groupId>
            <artifactId>lambda</artifactId>
            <version>*.*.*</version>
        </dependency>
        <dependency>
            <groupId>software.amazon.awscdk</groupId>
            <artifactId>apigateway</artifactId>
            <version>*.*.*</version>
        </dependency>
        <dependency>
            <groupId>software.amazon.awscdk</groupId>
            <artifactId>dynamodb</artifactId>
            <version>*.*.*</version>
        </dependency>
    </dependencies>
...
{{</highlight>}}

Now, go back to `~/HitCounter.java` and add the following highlighted code:

{{<highlight java "hl_lines=3-4 7-14 17-55">}}
package com.myorg;

import java.util.HashMap;
import java.util.Map;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.AttributeType;
import software.amazon.awscdk.services.dynamodb.Table;
import software.amazon.awscdk.services.dynamodb.TableProps;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.FunctionProps;
import software.amazon.awscdk.services.lambda.Runtime;

public class HitCounter extends Construct {
    private final Function handler;
    private final Table table;

    public HitCounter(Construct scope, String id, HitCounterProps props) {
        super(scope, id);
        
        this.table = new Table(this, "Hits", TableProps.builder()
            .partitionKey(Attribute.builder()
                .name("path")
                .type(AttributeType.STRING)
                .build()
            )
            .build()
        );

        Map<String, String> environment = new HashMap<>();
        environment.put("DOWNSTREAM_FUNCTION_NAME", props.getDownstream().getFunctionName());
        environment.put("HITS_TABLE_NAME", this.table.getTableName());
        this.handler = new Function(this, "HitCounterHandler", FunctionProps.builder()
            .runtime(Runtime.NODEJS_10_X)
            .handler("hitcounter.handler")
            .code(Code.fromAsset("lambda"))
            .environment(environment)
            .build());
    }

    /**
    * @return the counter function
    */
    public Function getHandler() {
        return handler;
    }

    /**
    * @return the hit counter table
    */
    public Table getTable() {
        return this.table;
    }
}
{{</highlight>}}

## What did we do here?

This code is hopefully easy to understand:

 * We defined a DynamoDB table, `table`, with `path` as the partition key (every DynamoDB table must have a single partition key).
 * We defined a Lambda function which is bound to the `lambda/hitcounter.handler` code.
 * We __wired__ the Lambda's environment variables to the `FunctionName` and `TableName`
   of our resources via `environment.put(...)`.

## Late-bound values

The `FunctionName` and `TableName` properties are values that only resolve when
we deploy our stack (notice that we haven't configured these physical names when
we defined the table/function, only logical IDs). This means that if you print
their values during synthesis, you will get a "TOKEN", which is how the CDK
represents these late-bound values. You should treat tokens as _opaque strings_.
This means you can concatenate them together for example, but don't be tempted
to parse them in your code.
