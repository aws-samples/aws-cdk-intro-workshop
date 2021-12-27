+++
title = "CDK Watch"
weight = 300
+++

## Faster Personal Deployments

{{% notice info %}} This section is not necessary to complete the workshop, but we
recommend that you take the time to see how `cdk watch` can speed up your personal
deployments.
{{% /notice %}}

It's great that we have a working lambda! But what if you want to tweak the lambda
code to get it just right? Let's say that we have now decided that we want our
lambda function to respond with `"Good Morning, CDK!"` instead of `"Hello, CDK"`.

So far, it seems like the only tool we have at our disposal to update our stack is
`cdk deploy`. But `cdk deploy` takes time; it has to deploy your CloudFormation stack and upload the `lambda` directory from your disk to the boostrap bucket. If
we're just changing our lambda code, we don't actually need to update the
CloudFormation stack, so that part of `cdk deploy` is wasted effort.

We really only need to update our lambda code. It would be great if we had
some other mechanism for doing only that...

## See how long 'CDK Deploy' takes

First, as an exercise, change your lambda code in `lambda/hello.js` slightly and 
time how long it takes to run `cdk deploy`. It will help us get a baseline for how 
long `cdk deploy` takes:

```bash
time cdk deploy
```

The output will look something like this:

```
INSERT OUTPUT HERE
```

## CDK Watch

{{% notice info %}} This command deliberately introduces drift in CloudFormation 
stacks in order to speed up deployments. For this reason, only use it for 
development purposes. Never use CDK Watch for your production deployments!
{{% /notice %}}

We can speed up that deployment time with `cdk watch`, which watches your
CDK application and looks for hotswappable changes. Which `cdk watch` finds a
change that can be hotswapped, it bypasses the CloudFormation deployment entirely
and instead makes the necessary SDK call to update your code for you. Changes to 
your AWS Lambda asset code, AWS Step Function State Machine definition, and other
non-resource changes have the potential to be hotswapped. Here, we will try
`cdk watch` with your AWS Lambda asset code.

## Modify your `cdk.json` file

When the `cdk watch` command runs, the files that it observes is determined by the
`"watch"` setting in the `cdk.json` file. It has two sub-keys, `"include"` and
`"exclude"`, each of which can be either a single string or an array of strings.
Each entry is interpreted as a path relative to the location of the `cdk.json` file. Globs, both `*` and `**`, are allowed to be used.

Your `cdk.json` file should look like this:

```json
{
  "app": "npx ts-node --prefer-ts-exts bin/workshop.ts",
  "watch": {
    "include": [
      "**"
    ],
    "exclude": [
      "README.md",
      "cdk*.json",
      "**/*.d.ts",
      "**/*.js",
      "tsconfig.json",
      "package*.json",
      "yarn.lock",
      "node_modules",
      "test"
    ]
  },
  "context": {
    ...
  }
}
```

As you can see, the sample app comes with a suggested `"watch"` setting. We do in
fact want to observe our `.js` files in the `lambda` folder, so let's remove
`"**/*.js"` from the `"exclude"` list:

```json
{
  "app": "npx ts-node --prefer-ts-exts bin/workshop.ts",
  "watch": {
    "include": [
      "**"
    ],
    "exclude": [
      "README.md",
      "cdk*.json",
      "**/*.d.ts",
      "tsconfig.json",
      "package*.json",
      "yarn.lock",
      "node_modules",
      "test"
    ]
  },
  "context": {
    ...
  }
}
```

Now you're all set to start watching!

## See how long 'CDK Watch' takes

First, call `cdk watch`: 

```bash
cdk watch
```

This will trigger an initial deployment and immediately begin observing the files
you've specified in `cdk.json`.

For the purposes of this exercise, make sure that the initial deployment is
finished before proceeding. Otherwise, the changes you make will be queued for
deployment and released _after_ the first deployment finishes.

Let's change our lambda asset code in `lambda/hello.js` one more time. It doesn't
matter what you change it to, but let's say we want it to say
`"Good Afternoon, CDK"` now.

Once you click save or hit `CTRL+s`, `cdk watch` will recognize that your file has
changed and trigger a new deployment. In this case, it will recognize that we can
hotswap the lambda asset code, so it will bypass a CloudFormation deployment and
deploy directly to the Lambda service instead.

How fast did deployment take?

```
INSERT PHOTO HERE
```

Wow!

## Did the code actually change?

Let's go to the AWS Lambda Console and double check!

1. Open the [AWS Lambda
   Console](https://console.aws.amazon.com/lambda/home#/functions) (make sure
   you are in the correct region).

    You should see our function:

    INSERT PHOTO HERE

2. Click on the function name to go to the console.

3. The code should be loaded onto the screen. Did your change show up?

    INSERT PHOTO HERE

## Wrap Up

The rest of this tutorial will continue using `cdk deploy` instead of `cdk watch`.
But if you want to, you can simply keep `cdk watch` on. If you need to make a full
deployment, `cdk watch` will call `cdk deploy` for you.

For a deeper dive on `cdk watch` use cases, read
[Increasing Development Speed with CDK Watch](https://aws.amazon.com/blogs/developer/increasing-development-speed-with-cdk-watch/).