+++
title = "Installing the library"
weight = 200
+++

## npm install

Before you can use the table viewer in your application, you'll need to install
the npm module:

```
npm install cdk-dynamo-table-viewer
```

{{% notice info %}}

**Windows users**: on Windows, you will have to stop the `npm run watch` command
that is running in the background, then run `npm install`, then start
`npm run watch` again. Otherwise you will get an error about files being
in use.

{{% /notice %}}

Output should look like this:

```
+ cdk-dynamo-table-viewer@3.1.2
added 1 package from 1 contributor and audited 886517 packages in 6.704s
found 0 vulnerabilities
```

----

Now we are ready to add a viewer to our app.
