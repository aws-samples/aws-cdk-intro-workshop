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

## Website Infrastructure

The workshop is available at https://cdkworkshop.com. It's a static website
hosted on S3 and served through CloudFront.

It is implemented as a (_surprise_) CDK application under the `cdkworkshop.com`
directory.

* `npm install` - bootstrap.
* `npm run build` and `npm run watch`
* `npm run deploy` - build & deploy

## License Summary

This sample code is made available under a modified MIT license. See the LICENSE file.
