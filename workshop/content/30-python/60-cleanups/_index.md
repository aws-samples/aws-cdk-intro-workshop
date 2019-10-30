+++
title = "Clean up"
weight = 60
chapter = true
+++

# Clean up your stack

To avoid unexpected charges to your account, make sure you clean up your CDK
stack.

You can either delete the stack through the AWS CloudFormation console or use
`cdk destroy`:

```
cdk destroy hello-cdk-1
```

You'll be asked:

```
Are you sure you want to delete: hello-cdk-1 (y/n)?
```

Hit "y" and you'll see your stack being destroyed.
