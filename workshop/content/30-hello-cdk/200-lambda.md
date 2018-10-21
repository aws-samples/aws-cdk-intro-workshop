+++
title = "Hello Lambda"
weight = 200
+++

## Write handler runtime code

We'll start with the AWS Lambda handler code.

1. Create a directory `lambda` in the root of your project tree (next to `bin`).
2. Add a file called `lambda/hello.js` with the following contents:

```js
exports.handler = async function(event) {
  console.log('request:', JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: `Hello, CDK! You've hit ${event.path}\n`
  };
};
```

This is a simple Lambda function which returns the text __"Hello, CDK! You've
hit [url path]"__. The function's output also includes the HTTP status code and
HTTP headers. These are used by API Gateway to formulate the HTTP response to
the user.

## Install the AWS Lambda construct library

The AWS CDK is shipped with an extensive library of constructs called the __AWS
Construct Library__. The construct library is divided into __modules__, one for
each AWS service. For example, if you want to define an AWS Lambda function, we
will need to use the AWS Lambda construct library.

{{% notice info %}}

Construct libraries are code modules that contain
"constructs", which are the basic building block of CDK apps. Apps, Stacks, Resources are all
constructs. Later on, we'll even define our own construct. To discover and learn about AWS constructs, you can browse the [AWS Construct
Library reference](https://awslabs.github.io/aws-cdk/reference.html).

{{% /notice %}}

Use `npm install` to install the module (and all it's dependencies) in your project:

```s
npm i @aws-cdk/aws-lambda
```

Output should look like this:

```
+ @aws-cdk/aws-lambda@0.12.0
updated 1 package and audited 1571 packages in 5.098s
```

> You can safely ignore any warnings from npm about your package.json file.

## Add an AWS Lambda Function to your stack

Add an `import` statement at the beginning of `bin/cdk-workshop.ts`, and a
`lambda.Function` to your stack:

{{<highlight ts "hl_lines=2 8-13">}}
import cdk = require('@aws-cdk/cdk');
import lambda = require('@aws-cdk/aws-lambda');

class CdkWorkshopStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
    super(parent, name, props);

    // defines an AWS Lambda resource
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NodeJS810,      // execution environment
      code: lambda.Code.directory('lambda'),  // code loaded from the "lambda" directory
      handler: 'hello.handler'                // file is "hello", function is "handler"
    });

  }
}

const app = new cdk.App();
new CdkWorkshopStack(app, 'CdkWorkshopStack');
app.run();
{{</highlight>}}

A few things to notice:

- Our function uses NodeJS 8.10 runtime
- The name of the handler function is `hello.handler` ("hello" is the name of
  the file and "handler" is the exported function name)
- The code is bundled from the `lambda` directory which we created earlier (path
  is relative to where you execute `cdk` from, which is you project root)

## A word about constructs and constructors

As you can see, the class constructors of both `CdkWorkshopStack` and
`lambda.Function` (and many other classes in the CDK) have similar function
signatures: `(parent, id, props)`. This is because all of these classes are
__constructs__. Constructs are the basic building block of CDK apps. They
represent abstract "cloud components" which can be composed together into higher
level abstractions as a tree. A construct can have child constructs, and they
can have children, etc.

When you instantiate a construct object, you always pass the following
arguments:

1. __`parent`__: the first argument is always the parent of the construct. This
   allows the construct to attach itself to the parent so it can consume it's
   context. In almost all cases, you'll be defining construct as children of the
   current context, in which you'll just want to pass `this` for this argument.
2. __`id`__: the second argument is a __local logical identity__ of the
   construct. It is used to calculate a unique global logical ID for every
   resource defined within the the scope of this construct. To read more about
   logical IDs, see the [CDK user
   manual](https://awslabs.github.io/aws-cdk/versions/0.8.1/logical-ids.html).
3. __`props`__: the last (optional) argument is always a set of initialization
   properties. You can explore the various options using your IDE's
   auto-complete.

    ![](./auto-complete.png)

## Deploy

Save your code, and let's take a quick look at the diff before we deploy:

```s
cdk diff
```

Output would look like this:

```
[+] Added HelloHandlerCodeS3Bucket4359A483: {"Type":"String","Description":"S3 bucket for asset \"CdkWorkshopStack/HelloHandler/Code\""}
[+] Added HelloHandlerCodeS3VersionKey07D12610: {"Type":"String","Description":"S3 key for asset version \"CdkWorkshopStack/HelloHandler/Code\""}
[+] 🆕 Creating HelloHandler2E4FBA4D (type: AWS::Lambda::Function)
```

As you can see, this code synthesizes an __AWS::Lambda::Function__ resource. It
also synthesized a couple of [CloudFormation
parameters](https://awslabs.github.io/aws-cdk/cloudformation.html#parameters)
that are used by the toolkit to propagate the location of the runtime code for
this function.

Let's deploy:

```s
cdk deploy
```

You'll notice that `cdk deploy` not only deployed your CloudFormation stack, but
also archived and uploaded the `lambda` directory from your disk to the
bootstrap bucket.

## Testing our function

Let's go to the AWS Lambda Console and test our function.

1. Open the [AWS Lambda
   Console](https://console.aws.amazon.com/lambda/home#/functions) (make sure
   you are in the correct region). You should see our function:
    ![](./lambda-1.png)
2. Click on the function name to go to the console.
3. Click on the __Test__ button to open the __Configure test event__ dialog:
    ![](./lambda-2.png)
4. Select __Amazon API Gateway AWS Proxy__ from the __Event template__ list.
5. Enter `test` under __Event name__.
    ![](./lambda-3.png)
6. Hit __Create__.
7. Click __Test__ again and wait for the execution to complete.
8. Expand __Details__ in the __Execution result__ pane and you should see our expected output:
    ![](./lambda-4.png)

# 👏
