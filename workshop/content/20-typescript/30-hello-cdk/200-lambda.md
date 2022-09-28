+++
title = "Hello Lambda"
weight = 200
+++

## Lambda handler code

We'll start with the AWS Lambda handler code.

1. Create a directory `lambda` in the root of your project tree (next to `bin`
   and `lib`).
2. TS CDK projects created with `cdk init` ignore all `.js` files by default. 
   To track these files with git, add `!lambda/*.js` to your `.gitignore` file. 
   This ensures that your Lambda assets are discoverable during the Pipelines 
   section of this tutorial.
3. Add a file called `lambda/hello.js` with the following contents:

---
```js
exports.handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, CDK! You've hit ${event.path}\n`
  };
};
```

This is a simple Lambda function which returns the text __"Hello, CDK! You've
hit [url path]"__. The function's output also includes the HTTP status code and
HTTP headers. These are used by API Gateway to formulate the HTTP response to
the user.

{{% notice info %}} This lambda is provided in Javascript. For more information
on writing lambda functions in your language of choice, please refer to the AWS
Lambda documentation [here](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html).
{{% /notice %}}

## Install the AWS Lambda construct library

The AWS CDK is shipped with an extensive library of constructs called the __AWS
Construct Library__. The construct library is divided into __modules__, one for
each AWS service. For example, if you want to define an AWS Lambda function, we
will need to use the AWS Lambda construct library.

To discover and learn about AWS constructs, you can browse the [AWS Construct
Library reference](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html).

![](/images/apiref.png)

## A few words about copying & pasting in this workshop

In this workshop, we highly recommended to type CDK code instead of copying &
pasting (there's usually not much to type). This way, you'll be able to fully
experience what it's like to use the CDK. It's especially cool to see your IDE
help you with auto-complete, inline documentation and type safety.

![](./auto-complete.png)

## Add an AWS Lambda Function to your stack

Add an `import` statement at the beginning of `lib/cdk-workshop-stack.ts`, and a
`lambda.Function` to your stack.


{{<highlight ts "hl_lines=3 9-14">}}
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class CdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,    // execution environment
      code: lambda.Code.fromAsset('lambda'),  // code loaded from "lambda" directory
      handler: 'hello.handler'                // file is "hello", function is "handler"
    });

  }
}
{{</highlight>}}

A few things to notice:

- Our function uses the NodeJS (`NODEJS_14_X`) runtime
- The handler code is loaded from the `lambda` directory which we created
  earlier. Path is relative to where you execute `cdk` from, which is the
  project's root directory
- The name of the handler function is `hello.handler` ("hello" is the name of
  the file and "handler" is the exported function name)

## A word about constructs and constructors

As you can see, the class constructors of both `CdkWorkshopStack` and
`lambda.Function` (and many other classes in the CDK) have the signature
`(scope, id, props)`. This is because all of these classes are __constructs__.
Constructs are the basic building block of CDK apps. They represent abstract
"cloud components" which can be composed together into higher level abstractions
via scopes. Scopes can include constructs, which in turn can include other
constructs, etc.

Constructs are always created in the scope of another construct and must always
have an identifier which must be unique within the scope it's created.
Therefore, construct initializers (constructors) will always have the following
signature:

1. __`scope`__: the first argument is always the scope in which this construct
   is created. In almost all cases, you'll be defining constructs within the
   scope of _current_ construct, which means you'll usually just want to pass
   `this` for the first argument. Make a habit out of it.
2. __`id`__: the second argument is the __local identity__ of the construct.
   It's an ID that has to be unique amongst construct within the same scope. The
   CDK uses this identity to calculate the CloudFormation [Logical
   ID](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resources-section-structure.html)
   for each resource defined within this scope. *To read more about IDs in the
   CDK, see the* [CDK user manual](https://docs.aws.amazon.com/cdk/latest/guide/identifiers.html#identifiers_logical_ids).
3. __`props`__: the last (sometimes optional) argument is always a set of
   initialization properties. Those are specific to each construct. For example,
   the `lambda.Function` construct accepts properties like `runtime`, `code` and
   `handler`. You can explore the various options using your IDE's auto-complete
   or in the [online
   documentation](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-readme.html).

## Diff

Save your code, and let's take a quick look at the diff before we deploy:

```
cdk diff
```

Output would look like this:

```text
Stack CdkWorkshopStack
IAM Statement Changes
┌───┬────────────────┬────────┬────────────────┬──────────────────┬───────────┐
│   │ Resource       │ Effect │ Action         │ Principal        │ Condition │
├───┼────────────────┼────────┼────────────────┼──────────────────┼───────────┤
│ + │ ${HelloHandler │ Allow  │ sts:AssumeRole │ Service:lambda.a │           │
│   │ /ServiceRole.A │        │                │ mazonaws.com     │           │
│   │ rn}            │        │                │                  │           │
└───┴────────────────┴────────┴────────────────┴──────────────────┴───────────┘
IAM Policy Changes
┌───┬────────────────────────────────────┬────────────────────────────────────┐
│   │ Resource                           │ Managed Policy ARN                 │
├───┼────────────────────────────────────┼────────────────────────────────────┤
│ + │ ${HelloHandler/ServiceRole}        │ arn:${AWS::Partition}:iam::aws:pol │
│   │                                    │ icy/service-role/AWSLambdaBasicExe │
│   │                                    │ cutionRole                         │
└───┴────────────────────────────────────┴────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Resources
[+] AWS::IAM::Role HelloHandler/ServiceRole HelloHandlerServiceRole11EF7C63 
[+] AWS::Lambda::Function HelloHandler HelloHandler2E4FBA4D 
```

As you can see, this code synthesizes an __AWS::Lambda::Function__ resource. It
also synthesized a couple of [CloudFormation
parameters](https://docs.aws.amazon.com/cdk/latest/guide/get_cfn_param.html)
that are used by the toolkit to propagate the location of the handler code.

## Deploy

Let's deploy:

```
cdk deploy
```

You'll notice that `cdk deploy` not only deployed your CloudFormation stack, but
also archived and uploaded the `lambda` directory from your disk to the
bootstrap bucket.

## Testing our function

Let's go to the AWS Lambda Console and test our function.

1. Open the [AWS Lambda
   Console](https://console.aws.amazon.com/lambda/home#/functions) (make sure
   you are in the correct region).

    You should see our function:

    ![](./lambda-1.png)

2. Click on the function name to go to the console.

3. Click on the __Test__ button to open the __Configure test event__ dialog:

    ![](./lambda-2.png)

4. Enter `test` under __Event name__.

5. Select __apigateway-aws-proxy__ from the __Template__ list.

    ![](./lambda-3.png)

6. Hit __Save__.

7. Click __Test__ again and wait for the execution to complete.

8. Look at the __Execution results__ tab and you should see our expected output:

    ![](./lambda-4.png)

# 👏
