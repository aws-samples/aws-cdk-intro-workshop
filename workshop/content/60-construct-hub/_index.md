+++
title = "Construct Hub"
weight = 60
chapter = true
+++

# The Construct Hub

The [CDK Construct Hub](https://constructs.dev/) is a one-stop destination for finding, reusing and sharing constructs authored by AWS, [AWS Partner Network partners](https://aws.amazon.com/partners/), third parties, and the developer community. The site currently lists constructs for our supported programming languages Typescript, Java, Python, and .NET. CDK constructs are cloud architecture building blocks and patterns that you can use to stand up complete production-ready cloud applications. The constructs listed in the Construct Hub are authored using the [AWS Cloud Development Kit](https://aws.amazon.com/cdk/) (AWS CDK), [CDK for Kubernetes](https://cdk8s.io/) (CDK8s) and [CDK for Terraform](https://github.com/hashicorp/terraform-cdk) (CDKtf).

We define constructs as classes, which define a “piece of system state”. Constructs can be composed together to form higher-level building blocks which represent more complex state. AWS, enterprises, start-ups, and individual developers use CDK constructs to share proven architecture patterns as reusable code libraries, so that everyone can benefit from the collective wisdom of the community.

The Construct Hub is the central location where CDK users can find a comprehensive collection of constructs to help them build their applications. The Construct Hub makes it easier for developers to find the high-level building blocks they need to build their applications by listing publicly released construct libraries.

## Discovering and Using Constructs
Browse to https://constructs.dev and search for constructs based on keywords such as names of AWS services used (e.g., “eks”, “dynamodb”), the library’s author (e.g., “pahud”), or the target provisioning engine (e.g., “cdktf”, “cdk8s”). Examples of constructs you can find include datadog-cdk-constructs that instruments Python and Node.js Lambda functions with Datadog, cdk-gitlab-runner that creates a GitLab Runner and executes a pipeline job, cdk-k3s-cluster that deploys a K3s cluster, and many more. The Construct Hub website also includes links to Getting Started resources. Below is an example of search results for constructs that include the “bucket” keyword and support the Python programming language:

Construct libraries listed on the Construct Hub include a detail page with instructions on how to install the package (click “Use Construct”) and an API reference that describes all the classes, interfaces, enums and data types in this library. The API reference and code samples are displayed in the selected programming language and are automatically generated from type information produced by the JSII compiler (JSII is a TypeScript-based programming language for creating multi-language libraries).

## Listing Constructs on the Hub
In order for your construct to be listed on the Construct Hub, you need to make sure it is authored with the following criteria:

* Published to the [npmjs.com](https://npmjs.com/) registry
* Uses a permissive license (Apache, BSD, MIT)
* Annotated with one of the supported keywords (awscdk, cdk8s or cdktf)
* Compiled with [JSII](https://aws.github.io/jsii/)

As a construct library publisher, you can improve the presentation of your construct library on the Construct Hub by:

* Adding links to the construct source code and documentation
* Including a README file with usage instructions
* Adding relevant keywords that will be displayed on the package page and can be used for search

All constructs are owned by the publishers of the packages. Constructs are user-generated content that are governed by their own license terms which is displayed in the search results and can be accessed directly through the hyperlinked package page


## Internal Use
If you are interested in using an instance of the Construct Hub for internal purposes, we are [developing a library](https://github.com/cdklabs/construct-hub) to allow anyone to deploy their own instance. This library is currently pre-GA and may experience some instability.