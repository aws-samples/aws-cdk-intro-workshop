+++
title = "Project structure"
weight = 300
+++

## Open your IDE

Now's a good time to open the project in your favorite IDE and explore.

> If you use VSCode, you can just type `code .` within the project directory.

## Explore your project directory

You'll see something like this:

![](./structure.png)

* __`lib/cdk_workshop-stack.ts`__ is where your CDK application's main stack is defined.
  This is the file we'll be spending most of our time in.
* `bin/cdk_workshop.ts` is the entrypoint of the CDK application. It will load
  the stack defined in `lib/cdk_workshop-stack.ts`.
* `package.json` is your npm module manifest. It includes information like the
  name of your app, version, dependencies and build scripts like "watch" and
  "build" (`package-lock.json` is maintained by npm)
* `cdk.json` tells the toolkit how to run your app. In our case it will be
  `"npx ts-node bin/cdk_workshop.ts"`
* `tsconfig.json` your project's [typescript
  configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
* `.gitignore` and `.npmignore` tell git and npm which files to include/exclude
  from source control and when publishing this module to the package manager.
* `node_modules` is maintained by npm and includes all your project's
  dependencies.

## Your app's entry point

Let's have a quick look at `bin/cdk_workshop.ts`:

```js
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkWorkshopStack } from '../lib/cdk_workshop-stack';

const app = new cdk.App();
new CdkWorkshopStack(app, 'CdkWorkshopStack');
```

This code loads and instantiates the `CdkWorkshopStack` class from the
`lib/cdk_workshop-stack.ts` file. We won't need to look at this file anymore.

## The main stack

Open up `lib/cdk_workshop-stack.ts`. This is where the meat of our application
is:

```ts
import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'CdkWorkshopQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    const topic = new sns.Topic(this, 'CdkWorkshopTopic');

    topic.addSubscription(new subs.SqsSubscription(queue));
  }
}
```

As you can see, our app was created with a sample CDK stack
(`CdkWorkshopStack`).

The stack includes:

- SQS Queue (`new sqs.Queue`)
- SNS Topic (`new sns.Topic`)
- Subscribes the queue to receive any messages published to the topic (`topic.addSubscription`)
