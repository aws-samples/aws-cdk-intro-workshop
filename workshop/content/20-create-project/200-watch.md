+++
title = "npm run watch"
weight = 200
+++

Since TypeScript sources need to be compiled to JavaScript, every time we make
a modification to our source files, we would want them to be compiled to `.js`.

Your project comes configured with a nice little npm script called `watch`.

Open a __new__ terminal session (or tab) and from your project directory run:

```s
$ cd cdk-workshop
$ npm run watch
Starting compilation in watch mode...
Found 0 errors. Watching for file changes.
...
```

This will start `tsc --watch` for you, which will monitor your project
directory and will automatically compile any changes to your `.ts` files to `.js`.

Keep this terminal window open and watch running for the duration of the workshop.

{{% notice info %}}
In case you wish to manually compile your project, you can always use `npm run build`
{{% /notice %}}

