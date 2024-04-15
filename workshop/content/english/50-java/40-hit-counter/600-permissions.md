+++
title = "Granting permissions"
weight = 600
+++

## Allow Lambda to read/write our DynamoDB table

Let's give our Lambda's execution role permissions to read/write from our table.

Go back to `~/HitCounter.java` and add the following highlighted lines:

{{<highlight java "hl_lines=40-41">}}
package com.myorg;

import java.util.HashMap;
import java.util.Map;

import software.constructs.Construct;

import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.AttributeType;
import software.amazon.awscdk.services.dynamodb.Table;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;

public class HitCounter extends Construct {
    private final Function handler;
    private final Table table;

    public HitCounter(final Construct scope, final String id, final HitCounterProps props) {
        super(scope, id);

        this.table = Table.Builder.create(this, "Hits")
            .partitionKey(Attribute.builder()
                .name("path")
                .type(AttributeType.STRING)
                .build())
            .build();

        final Map<String, String> environment = new HashMap<>();
        environment.put("DOWNSTREAM_FUNCTION_NAME", props.getDownstream().getFunctionName());
        environment.put("HITS_TABLE_NAME", this.table.getTableName());

        this.handler = Function.Builder.create(this, "HitCounterHandler")
            .runtime(Runtime.NODEJS_14_X)
            .handler("hitcounter.handler")
            .code(Code.fromAsset("lambda"))
            .environment(environment)
            .build();

        // Grants the lambda function read/write permissions to our table
        this.table.grantReadWriteData(this.handler);
    }

    /**
     * @return the counter definition
     */
    public Function getHandler() {
        return this.handler;
    }

    /**
     * @return the counter table
     */
    public Table getTable() {
        return this.table;
    }
}

{{</highlight>}}

## Deploy

Save & deploy:

```
mvn package
cdk deploy
```

## Test again

Okay, deployment is complete. Let's run our test again (either use `curl` or
your web browser):

```
curl -i https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

Again?

```
HTTP/1.1 502 Bad Gateway
...

{"message": "Internal server error"}
```

# 😢

Still getting this pesky 5xx error! Let's look at our CloudWatch logs again
(click "Refresh"):

```json
{
    "errorType": "AccessDeniedException",
    "errorMessage": "User: arn:aws:sts::XXXXXXXXXX:assumed-role/CdkWorkshopStack-HelloHitCounterHitCounterHandlerS-TU5M09L1UBID/CdkWorkshopStack-HelloHitCounterHitCounterHandlerD-144HVUNEWRWEO is not authorized to perform: lambda:InvokeFunction on resource: arn:aws:lambda:us-east-1:XXXXXXXXXXX:function:CdkWorkshopStack-HelloHandler2E4FBA4D-149MVAO4969O7",
    "stack": [
        "AccessDeniedException: User: arn:aws:sts::XXXXXXXXXX:assumed-role/CdkWorkshopStack-HelloHitCounterHitCounterHandlerS-TU5M09L1UBID/CdkWorkshopStack-HelloHitCounterHitCounterHandlerD-144HVUNEWRWEO is not authorized to perform: lambda:InvokeFunction on resource: arn:aws:lambda:us-east-1:XXXXXXXXXXX:function:CdkWorkshopStack-HelloHandler2E4FBA4D-149MVAO4969O7",
        "at Object.extractError (/var/runtime/node_modules/aws-sdk/lib/protocol/json.js:48:27)",
        "at Request.extractError (/var/runtime/node_modules/aws-sdk/lib/protocol/rest_json.js:52:8)",
        "at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:105:20)",
        "at Request.emit (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:77:10)",
        "at Request.emit (/var/runtime/node_modules/aws-sdk/lib/request.js:683:14)",
        "at Request.transition (/var/runtime/node_modules/aws-sdk/lib/request.js:22:10)",
        "at AcceptorStateMachine.runTo (/var/runtime/node_modules/aws-sdk/lib/state_machine.js:14:12)",
        "at /var/runtime/node_modules/aws-sdk/lib/state_machine.js:26:10",
        "at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:38:9)",
        "at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:685:12)"
    ]
}
```

Another access denied, but this time, if you take a close look:

```
User: <VERY-LONG-STRING> is not authorized to perform: lambda:InvokeFunction on resource: <VERY-LONG-STRING>"
```

So it seems like our hit counter actually managed to write to the database. We can confirm by
going to the [DynamoDB Console](https://console.aws.amazon.com/dynamodb/home):

![](./logs5.png)

But, we must also give our hit counter permissions to invoke the downstream lambda function.

## Grant invoke permissions

Add the highlighted lines to `src/CdkWorkshop/HitCounter.java`:

{{<highlight java "hl_lines=43-44">}}
package com.myorg;

import java.util.HashMap;
import java.util.Map;

import software.constructs.Construct;

import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.AttributeType;
import software.amazon.awscdk.services.dynamodb.Table;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;

public class HitCounter extends Construct {
    private final Function handler;
    private final Table table;

    public HitCounter(final Construct scope, final String id, final HitCounterProps props) {
        super(scope, id);

        this.table = Table.Builder.create(this, "Hits")
            .partitionKey(Attribute.builder()
                .name("path")
                .type(AttributeType.STRING)
                .build())
            .build();

        final Map<String, String> environment = new HashMap<>();
        environment.put("DOWNSTREAM_FUNCTION_NAME", props.getDownstream().getFunctionName());
        environment.put("HITS_TABLE_NAME", this.table.getTableName());

        this.handler = Function.Builder.create(this, "HitCounterHandler")
            .runtime(Runtime.NODEJS_14_X)
            .handler("hitcounter.handler")
            .code(Code.fromAsset("lambda"))
            .environment(environment)
            .build();

        // Grants the lambda function read/write permissions to our table
        this.table.grantReadWriteData(this.handler);

        // Grants the lambda function invoke permissions to the downstream function
        props.getDownstream().grantInvoke(this.handler);
    }

    /**
     * @return the counter definition
     */
    public Function getHandler() {
        return this.handler;
    }

    /**
     * @return the counter table
     */
    public Table getTable() {
        return this.table;
    }
}
{{</highlight>}}

## Diff

You can check what this did using `cdk diff`:

```
mvn package
cdk diff
```

The **Resource** section should look something like this,
which shows the IAM statement was added to the role:

```
IAM Statement Changes
┌───┬────────────────────────────────────────┬────────┬────────────────────────────────────────┬─────────────────────────────────────────┬───────────┐
│   │ Resource                               │ Effect │ Action                                 │ Principal                               │ Condition │
├───┼────────────────────────────────────────┼────────┼────────────────────────────────────────┼─────────────────────────────────────────┼───────────┤
│ + │ ${HelloHandler.Arn}                    │ Allow  │ lambda:InvokeFunction                  │ AWS:${HelloHitCounter/HitCounterHandler │           │
│   │                                        │        │                                        │ /ServiceRole}                           │           │
├───┼────────────────────────────────────────┼────────┼────────────────────────────────────────┼─────────────────────────────────────────┼───────────┤
│ + │ ${HelloHitCounter/Hits.Arn}            │ Allow  │ dynamodb:BatchGetItem                  │ AWS:${HelloHitCounter/HitCounterHandler │           │
│   │                                        │        │ dynamodb:BatchWriteItem                │ /ServiceRole}                           │           │
│   │                                        │        │ dynamodb:DeleteItem                    │                                         │           │
│   │                                        │        │ dynamodb:GetItem                       │                                         │           │
│   │                                        │        │ dynamodb:GetRecords                    │                                         │           │
│   │                                        │        │ dynamodb:GetShardIterator              │                                         │           │
│   │                                        │        │ dynamodb:PutItem                       │                                         │           │
│   │                                        │        │ dynamodb:Query                         │                                         │           │
│   │                                        │        │ dynamodb:Scan                          │                                         │           │
│   │                                        │        │ dynamodb:UpdateItem                    │                                         │           │
└───┴────────────────────────────────────────┴────────┴────────────────────────────────────────┴─────────────────────────────────────────┴───────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Resources
[+] AWS::IAM::Policy HelloHitCounter/HitCounterHandler/ServiceRole/DefaultPolicy HelloHitCounterHitCounterHandlerServiceRoleDefaultPolicy1487A60A
[~] AWS::Lambda::Function HelloHitCounter/HitCounterHandler HelloHitCounterHitCounterHandlerDAEA7B37
 └─ [~] DependsOn
     └─ @@ -1,3 +1,4 @@
        [ ] [
        [+]   "HelloHitCounterHitCounterHandlerServiceRoleDefaultPolicy1487A60A",
        [ ]   "HelloHitCounterHitCounterHandlerServiceRoleD45002B8"
        [ ] ]

```

Which is exactly what we wanted.

## Deploy

Okay... let's give this another shot:

```
cdk deploy
```

Then hit your endpoint with `curl` or with your web browser:

```
curl -i https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

Output should look like this:

```
HTTP/1.1 200 OK
...

Hello, CDK! You've hit /
```

> If you still get 5xx, give it a few seconds and try again. Sometimes API
Gateway takes a little bit to "flip" the endpoint to use the new deployment.

# 😲

{{< nextprevlinks >}}