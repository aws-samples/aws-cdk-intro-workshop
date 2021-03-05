+++
title = "Queue Processing Stack Setup"
weight = 3000
+++

Under the root of the CDK project, create a directory called Docker and under the directory, create these 2 files `Dockerfile` and `queue_service.py`.

Write the following content into `Docker/queue_service.py` making sure to put replace your region in `#REGION`.

```python
#!/usr/bin/env python3

import os
from boto3 import resource
from os import getenv
from time import sleep
from random import randrange
from sys import argv

def get_queue_details():
    sqs = resource('sqs',region_name='#REGION')
    return sqs.get_queue_by_name(QueueName=getenv('QUEUE_NAME'))

def receive():
    queue = get_queue_details()
    while True:
        for message in queue.receive_messages():
            print("MESSAGE CONSUMED: {}".format(message.body))
            print(message.delete())
            sleep(1)
        
def send(num_messages=100):
    queue = get_queue_details()
    for _num in range(num_messages):
        _rand = randrange(1000)
        print(queue.send_message(MessageBody=str(_rand)))
        
if __name__ == '__main__':
    try:
        if argv[1] == 'send':
            send()
        if argv[1] == 'receive':
            receive()
    except IndexError as i:
        print("Please pass either send or receive.\n./queue_service.py <send> <receive>")
        exit(200)
```


Let us see what this code snippet does:


1. This single script represents our containerised application. 
2. It’s a python script that is written to handle reading/writing to an SQS queue
3. The script takes the queue name from the environment parameter name called QUEUE_NAME
4. The script sends messages in batches of 100 to the SQS queue on every invocation
5. Once the message is processed successfully by the application, it is deleted from the queue


Add the following content to Docker/Dockerfile

```docker
FROM public.ecr.aws/amazonlinux/amazonlinux:latest
RUN yum install python3 -y && pip3 install awscli boto3
COPY ./queue_service.py /queue_service.py
RUN ["chmod","+x","/queue_service.py"]

CMD ["/queue_service.py","receive"]
```

This instantiates a Docker container using Amazon Linux image, sets up python3 , aws-cli and copies the queue processor script into the entry point

From the root of the CDK project still, create a file called `queue-processor.java` under myorg directory

Add the following content to `cdkworkshop/src/main/java/com/myorg/queue-processor.java`

```java
package com.myorg;
 
import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;
import software.amazon.awscdk.services.ecs.ContainerImage;
import software.amazon.awscdk.services.ecs.patterns.QueueProcessingFargateService;
 
 
public class QueueProcessor extends Stack {
    public QueueProcessor(final Construct parent, final String id) {
        this(parent, id, null);
    }
 
    public QueueProcessor(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);
 
        final QueueProcessingFargateService queueProcessingFargateService = QueueProcessingFargateService.Builder.create(this, "QueueProcessingFargateService")
                .cpu(512)
                .memoryLimitMiB(2048)
                .image(ContainerImage.fromAsset("Docker"))
                .desiredTaskCount(1)
                .build();
    }
}
```

Let us look at what this stack is doing:

1. It imports ecs-patterns and ecs constructs
2. It uses the high level construct called [QueueProcessingFargateService](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-ecs-patterns.QueueProcessingFargateService.html) and initialises it with the following behavior:
    * Build and upload a docker image reading from the local asset folder called Docker under root of the CDK project
    * Sets up the desired task count to 1
    * Uses default values for other characteristics
3. The advantage of CDK is that where the defaults do not handle a business requirement, you can always choose to override with a value that fits your needs


We are also going to create an ECR repository to store the image that will be created, in your command line type in the following, making sure to swap out your `#ACCOUNT_NUMBER` and `#REGION`.

```bash
aws ecr create-repository --repository-name cdk-hnb659fds-container-assets-#ACCOUNT_NUMBER-#REGION
```


Create a new file in `CdkWorkshop` called `QueueProcessorStage.java` with the code below which will contain the stage holding the queue processor application:

```java
package com.myorg;

import software.amazon.awscdk.core.Stage;
import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.StageProps;

public class QueueProcessorStage extends Stage {
    public QueueProcessorStage(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public QueueProcessorStage(final Construct scope, final String id, final StageProps props) {
        super(scope, id, props);

        new queueprocessor = QueueProcessor(this,'QueueProcessor');   
    }
}
```