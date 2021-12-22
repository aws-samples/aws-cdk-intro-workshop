+++
title = "CDK Watch"
weight = 300
+++

## Faster Personal Deployments

It's great that we have a working lambda! But what if you want to tweak the lambda
code to get it just right? Let's say that we have now decided that we want our
lambda function to respond with `Good Morning, CDK!` instead of `Hello, CDK`.

So far, it seems like the only tool we have at our disposal to update our stack is
`cdk deploy`. But `cdk deploy` takes time; it has to deploy your CloudFormation stack and upload the `lambda` directory from your disk to the boostrap bucket. If
we're just changing our lambda code, we don't actually need to update the
CloudFormation stack, so that part of `cdk deploy` is wasted effort.

We really only need to update our lambda code. It would be great if we had
some other mechanism for doing only that...

## See how long 'CDK Deploy' takes

First, as an exercise, change your lambda code slightly and time how long it takes 
to run `cdk deploy`. It will help us get a baseline for how long `cdk deploy` takes:

```bash
time cdk deploy
```

The output will look something like this:

```
INSERT OUTPUT HERE
```

## CDK Watch