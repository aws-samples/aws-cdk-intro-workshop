+++
title = "Learning about the Table Viewer construct"
weight = 100
+++

## Reading documentation

Browse to the [cdk-dynamo-table-view
page](https://pypi.org/project/cdk-dynamo-table-view/) on pypi.org and
read the module documentation.

There is some documentation about how to use the table viewer in the README but it is all focused on TypeScript rather than Python.  So, we will walk through the process of using a third-party construct in Python.

{{% notice warning %}}
As mentioned in the README page of this library, it is not intended for production use. Namely because
it will expose contents from your DynamoDB table to anyone without authentication.
{{% /notice %}}

![](./table-viewer-pypi.png)
