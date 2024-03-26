+++
title = "Installing the library"
weight = 200
+++

## pip install

Before you can use the table viewer in your application, you'll need to install
the python module. Add this code to `requirements.txt`:

{{<highlight python "hl_lines=3">}}
aws-cdk-lib==2.128.0
constructs>=10.0.0,<11.0.0
cdk-dynamo-table-view==0.2.488
{{</highlight>}}

Once the virtualenv is activated, you can install the required dependencies.

```
$ pip install -r requirements.txt
```

The last two lines of the output (there's a lot of it) should look like this:

```
Installing collected packages: cdk-dynamo-table-view
Successfully installed cdk-dynamo-table-view-0.2.0
```

----

Now we are ready to add a viewer to our app.
