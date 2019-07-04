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

* __`lib/cdk-workshop-stack.ts`__ is where the your CDK application's main stack is defined.
  This is the file we'll be spending most of our time in.
* `bin/cdk-workshop.ts` is the entrypoint of the CDK application. It will load
  the stack defined in `lib/cdk-workshop-stack.ts`.
* `package.json` is your npm module manifest. It includes information like the
  name of your app, version, dependencies and build scripts like "watch" and
  "build" (`package-lock.json` is maintained by npm)
* `cdk.json` tells the toolkit how to run your app. In our case it will be
  `"node bin/cdk-workshop.js"`
* `tsconfig.json` your project's [typescript
  configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
* `.gitignore` and `.npmignore` tell git and npm which files to include/exclude
  from source control and when publishing this module to the package manager.
* `node_modules` is maintained by npm and includes all your project's
  dependencies.

## Your app's entry point

Let's have a quick look at `bin/cdk-workshop.ts`:

```ts
import cdk = require('@aws-cdk/core');
import { CdkWorkshopStack } from '../lib/cdk-workshop-stack';

const app = new cdk.App();
new CdkWorkshopStack(app, 'CdkWorkshopStack');
```

This code loads and instantiate the `CdkWorkshopStack` class from the
`lib/cdk-workshop-stack.ts` file. We won't need to look at this file anymore.

## The main stack

Open up `lib/cdk-workshop-stack.ts`. This is where the meat of our application
is:

```ts
import sns = require('@aws-cdk/aws-sns');
import subs = require('@aws-cdk/aws-sns-subscriptions');
import sqs = require('@aws-cdk/aws-sqs');
import cdk = require('@aws-cdk/core');

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'CdkWorkshopQueue', {
      visibilityTimeoutSec: cdk.Duration.seconds(300)
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
- SNS Topic (`new sns.Topic)`
- Subscribes the queue to receive any messages published to the topic (`subscribeQueue`).
