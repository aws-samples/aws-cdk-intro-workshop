+++
title = "Clean up"
weight = 60
chapter = true
+++

# Clean up your stack

When destroying a stack, resources may be deleted, retained, or snapshotted according to their deletion policy.
By default, most resources will get deleted upon stack deletion, however that's not the case for all resources.
The DynamoDB table will be retained by default. If you don't want to retain this table, we can set this in CDK
code by using `RemovalPolicy`.

We have already set this policy during the workshop but if it was not set you will need to manually remove the table after running the destroy commands.

Additionally, the Lambda function created will generate CloudWatch logs that are
permanently retained. These will not be tracked by CloudFormation since they are
not part of the stack, so the logs will still persist. You will have to manually
delete these in the console if desired.

Now that we know which resources will be deleted we can proceed with deleting the 
stack. You can either delete the stack through the AWS CloudFormation console or 
use `cdk destroy`:

```
cdk destroy
```

You'll be asked:

```
Are you sure you want to delete: CdkWorkshopStack (y/n)?
```

Hit "y" and you'll see your stack being destroyed.

The bootstrapping stack created through `cdk bootstrap` still exists. If you plan
on using the CDK in the future (we hope you do!) do not delete this stack.

If you would like to delete this stack, it will have to be done through the CloudFormation
console. Head over to the CloudFormation console and delete the `CDKToolkit` stack. The S3
bucket created will be retained by default, so if you want to avoid any unexpected charges,
be sure to head to the S3 console and empty + delete the bucket generated from bootstrapping.
