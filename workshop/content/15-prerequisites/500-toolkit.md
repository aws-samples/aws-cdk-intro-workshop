+++
title = "AWS CDK Toolkit"
weight = 500
+++

Next, we'll install the AWS CDK Toolkit. The toolkit is a command-line utility
which allows you to work with CDK apps.

Open a terminal session and run the following command:

- Windows: you'll need to run this as an Administrator
- POSIX: on some systems you may need to run this with `sudo`

```console
npm install -g aws-cdk@0.22.0
```

You can check the toolkit version:

```console
$ cdk --version
0.22.0
```

{{% notice info %}} __NOTE__: This workshop was tested with version __v0.22.0__ of the AWS CDK. Since the AWS
CDK is still in developer preview, new versions of the AWS CDK may include
breaking changes. Therefore, throughout the workshop, you will be instructed to
install version 0.22.0 by using `npm install module@0.22.0`. {{% /notice %}}
