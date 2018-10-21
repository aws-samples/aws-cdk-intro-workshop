+++
title = "CloudWatch Logs"
weight = 500
+++

## Viewing CloudWatch logs for our Lambda function

The first thing to do is to go and look at the logs of your AWS Lambda function.
There are many tools that help you do that like [SAM
CLI](https://github.com/awslabs/aws-sam-cli) and
[awslogs](https://github.com/jorgebastida/awslogs). In this workshop, we'll show you how
to find your logs through the AWS console.

1. Open the [AWS Lambda console](https://console.aws.amazon.com/lambda/home) (make sure you
   are connected to the correct region).
2. Click on the __HitCounter__ Lambda function:

    ![](./logs1.png)

3. Click on __Monitoring__

    ![](./logs2.png)

4. Click on __View on CloudWatch Logs__. This will open the AWS CloudWatch console.

    ![](./logs3.png)

5. Click __Search Log Group__

    ![](./logs4.png)

6. Scroll all the way down, and look for an error. You'll likely see something like this:


    ```json
    {
        "errorMessage": "User: arn:aws:sts::585695036304:assumed-role/CdkWorkshopStack-HelloHitCounterHitCounterHandlerS-TU5M09L1UBID/CdkWorkshopStack-HelloHitCounterHitCounterHandlerD-144HVUNEWRWEO is not authorized to perform: dynamodb:UpdateItem on resource: arn:aws:dynamodb:us-east-1:585695036304:table/CdkWorkshopStack-HelloHitCounterHits7AAEBF80-1DZVT3W84LJKB",
        "errorType": "AccessDeniedException",
        "stackTrace": [
            "Request.extractError (/var/runtime/node_modules/aws-sdk/lib/protocol/json.js:48:27)",
            "Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:105:20)",
            "Request.emit (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:77:10)",
            "Request.emit (/var/runtime/node_modules/aws-sdk/lib/request.js:683:14)",
            "Request.transition (/var/runtime/node_modules/aws-sdk/lib/request.js:22:10)",
            "AcceptorStateMachine.runTo (/var/runtime/node_modules/aws-sdk/lib/state_machine.js:14:12)",
            "/var/runtime/node_modules/aws-sdk/lib/state_machine.js:26:10",
            "Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:38:9)",
            "Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:685:12)",
            "Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:115:18)"
        ]
    }
    ```

---

Okay, this is starting to make sense. It seems like our Lambda function can't
write to our DynamoDB table. Which, kind of makes sense. We didn't actually
grant it those permissions. Let's do that now.

