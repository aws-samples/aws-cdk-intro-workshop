+++
title = "Hello, CDK!"
chapter = true
weight = 30
+++

# Hello, CDK!

In this chapter, we will finally write some CDK code. Instead of the SNS/SQS
code that we have in our app now, we'll add a Lambda function with an API
Gateway endpoint in front of it.

Users will be able to hit any URL in the endpoint and they'll receive a
heartwarming greeting from our function.

![](images/hello-arch.png)

First, let's clean up the sample code.