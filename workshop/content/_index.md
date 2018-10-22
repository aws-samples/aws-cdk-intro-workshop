---
title: "AWS CDK Intro Workshop"
chapter: true
weight: 1
---

# Welcome Developers!

## Oh, hey there!

Thanks for joining us! Hope you can't wait to play a little bit with this new
thing we call the "AWS Cloud Development Kit" or in short, the AWS CDK.

The AWS CDK is a new software development framework from AWS with the sole
purpose of making it is fun and easy to define cloud infrastructure in your
favorite programming language and deploy it using AWS CloudFormation.

{{% notice info %}}

In this workshop we are going to use TypeScript and JavaScript as our
programming languages, but the AWS CDK is currently supported in JavaScript,
TypeScript, Java and .NET and more languages are coming soon.

{{% /notice %}}

So what are we going to build? Nothing too fancy...

We'll spend some time setting up your development environment and learning a
little about how to work with the CDK Toolkit to deploy your app to an AWS
environment.

Then, you'll write a little "Hello, world" Lambda function and front it with an
API Gateway endpoint so users can call it via an HTTP request.

Next, we'll introduce the very powerful concept of __CDK constructs__.
Constructs allow you to bundle up a bunch of infrastructure into reusable
components which anyone can compose into their apps. We'll walk you through
writing your own construct.

Finally, we'll show you how to use a construct from an npm library in your
stack.

By the end of this workshop, you'll be able to:

- Create new CDK applications.<br/>
- Define your app's infrastructure using the AWS Construct Library<br/>
- Deploy your CDK apps to your AWS account<br/>
- Define your own reusable constructs<br/>
- Consume constructs published by other people<br/>

![](images/cdk-logo.png)
