+++
title = "npm run watch"
weight = 200
+++

## Compiling your TypeScript code

Since TypeScript sources need to be compiled to JavaScript, every time we make a
modification to our source files, we would want them to be compiled to `.js`.

{{% notice info %}} This is an important step. Make sure you leave the "watch"
terminal session open at the end of this step. {{% /notice %}}

Your project is already configured with a nice little npm script called `watch`.

## Open new terminal window

Open a __new__ terminal session (or tab). You will keep this window open in the
background for the duration of the workshop.

## Start watching for changes

From your project directory run:

```
cd cdk-workshop
```

And:

```
npm run watch
```

Then, screen will be cleared and you'll see:

```
Starting compilation in watch mode...
Found 0 errors. Watching for file changes.
...
```

This will start the TypeScript compiler (`tsc`) in "watch" mode, which will
monitor your project directory and will automatically compile any changes to
your `.ts` files to `.js`.

----

{{% notice info %}} Keep this terminal window open with `watch` running for the duration of the workshop.

----
