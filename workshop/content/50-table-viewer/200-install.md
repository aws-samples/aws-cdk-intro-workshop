+++
title = "Installing the library"
weight = 200
+++

## npm install

Before you can use the table viewer in your application, you'll need to install
the npm module:

```shell
$ npm i cdk-dynamo-table-viewer
+ cdk-dynamo-table-viewer@0.1.2
added 26 packages from 8 contributors and audited 3282 packages in 8.225s
found 0 vulnerabilities
```

This will update your `package.json` file with the following entry:

```json
{
  "dependencies": {
    "cdk-dynamo-table-viewer": "^0.1.2"
  }
}
```

----

Now we are ready to add a viewer to our app.