+++
title = "CDK Watch"
weight = 300
+++

## Faster personal deployments

{{% notice info %}} This section is not necessary to complete the workshop, but we
recommend that you take the time to see how `cdk deploy --hotswap` and `cdk watch` 
can speed up your personal deployments.
{{% /notice %}}

It's great that we have a working lambda! But what if you want to tweak the lambda
code to get it just right? Let's say that we have now decided that we want our
lambda function to respond with `"Good Morning, CDK!"` instead of `"Hello, CDK"`.

So far, it seems like the only tool we have at our disposal to update our stack is
`cdk deploy`. But `cdk deploy` takes time; it has to deploy your CloudFormation
stack and upload the `lambda` directory from your disk to the boostrap bucket. If
we're just changing our lambda code, we don't actually need to update the
CloudFormation stack, so that part of `cdk deploy` is wasted effort.

We really only need to update our lambda code. It would be great if we had
some other mechanism for doing only that...

## Timing `cdk deploy`

First, as an exercise, change your lambda code in `lambda/hello.js` slightly and 
time how long it takes to run `cdk deploy`. It will help us get a baseline for how 
long `cdk deploy` takes:

```bash
cdk deploy
```

The output will look something like this:

```
INSERT OUTPUT HERE
```

## Hotswap deployments

{{% notice info %}} This command deliberately introduces drift in CloudFormation 
stacks in order to speed up deployments. For this reason, only use it for 
development purposes. Never use hotswap for your production deployments!
{{% /notice %}}

We can speed up that deployment time with `cdk deploy --hotswap`, which will
assess whether a hotswap deployment can be performed instead of a CloudFormation
deployment. If possible, the CDK CLI will use AWS service APIs to directly make
the changes; otherwise it will fall back to performing a full CloudFormation
deployment.

Here, we will use `cdk deploy --hotswap` to deploy a hotswappable change to your 
AWS Lambda asset code.

## Timing `cdk deploy --hotswap`

Let's change the lambda code in `lambda/hello.js` another time. What you change
is not important for this exercise.

```bash
cdk deploy --hotswap
```

The output will look something like this:

```
INSERT OUTPUT HERE
```

As you can see, hotswapping a change is much faster! But take a look and read the
warning message thoroughly:

```bash
⚠️ The --hotswap flag deliberately introduces CloudFormation drift to speed up deployments
⚠️ It should only be used for development - never use it for your production Stacks!
```

We're deliberately introducing drift for the faster deployment, so make sure you
don't use this feature in production.

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

## CDK Watch

We can do better than calling `cdk deploy` or `cdk deploy --hotswap` each time.
`cdk watch` is similar to `cdk deploy` except that instead of being a one-shot
operation, it monitors your code and assets for changes and attempts to perform a 
deployment automatically when a change is detected. By default, `cdk watch` will 
use the `--hotswap` flag, which inspects the changes and determines if those 
changes can be hotswapped. To disable this behavior, you can call
`cdk watch --no-hotswap`.

Once we set it up, we can use `cdk watch` to detect both hotswappable changes and
changes that require full CloudFormation deployment.

## Modify your `cdk.json` file

When the `cdk watch` command runs, the files that it observes is determined by the
`"watch"` setting in the `cdk.json` file. It has two sub-keys, `"include"` and
`"exclude"`, each of which can be either a single string or an array of strings.
Each entry is interpreted as a path relative to the location of the `cdk.json`
file. Globs, both `*` and `**`, are allowed to be used.

Your `cdk.json` file should look like this:

```json
{
  "app": "npx ts-node --prefer-ts-exts bin/cdk-workshop.ts",
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
    // ...
  }
}
```

As you can see, the sample app comes with a suggested `"watch"` setting. We do in
fact want to observe our `.js` files in the `lambda` folder, so let's remove
`"**/*.js"` from the `"exclude"` list:

```json
{
  "app": "npx ts-node --prefer-ts-exts bin/cdk-workshop.ts",
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
    // ...
  }
}
```

Now you're all set to start watching!

## Timing `cdk watch`

First, call `cdk watch`: 

```bash
cdk watch
```

This will trigger an initial deployment and immediately begin observing the files
you've specified in `cdk.json`.

Let's change our lambda asset code in `lambda/hello.js` one more time. It doesn't
matter what you change it to, but let's say we want it to say
`"Good Afternoon, CDK"` now.

Once you save the changes to your Lambda code file, `cdk watch` will recognize that
your file has changed and trigger a new deployment. In this case, it will recognize
that we can hotswap the lambda asset code, so it will bypass a CloudFormation
deployment and deploy directly to the Lambda service instead.

How fast did deployment take?

```
INSERT PHOTO HERE
```

## Wrap Up

The rest of this tutorial will continue using `cdk deploy` instead of `cdk watch`.
But if you want to, you can simply keep `cdk watch` on. If you need to make a full
deployment, `cdk watch` will call `cdk deploy` for you.

For a deeper dive on `cdk watch` use cases, read
[Increasing Development Speed with CDK Watch](https://aws.amazon.com/blogs/developer/increasing-development-speed-with-cdk-watch/).