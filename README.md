## Introduction to the AWS Cloud Development Kit (CDK) - Workshop

## Developer Guide

This workshop is built with markdown as a static HTML site using [hugo](http://gohugo.io).

```bash
$ brew install hugo
```

You'll find the content of the workshop in the [workshop/](workshop/) directory.

You can start up a local development server by running:

```bash
$ cd workshop
$ hugo server -D
$ open http://localhost:1313/
```

## Deployment

Technically you just need to run `npm run deploy` and it will build you website, build the
CDK app that manages the S3/CloudFront distribution and deploy it via "cdk deploy", This will
also take care of syncing your newly built website to the S3 bucket.


## License Summary

This sample code is made available under a modified MIT license. See the LICENSE file.
