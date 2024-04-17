+++
title = "Installing the library"
weight = 200
+++

## Install Package

Before you can use the table viewer in your application, you'll need to install
the Nuget package:

```
dotnet add package Cdklabs.DynamoTableViewer --version 0.2.488
```
During installation if you get package restore failed errors, kindly resolve the conflicts by updating packages to latest versions using command `dotnet add package <package-name>`.

Output should look similar to this:

```
info : Adding PackageReference for package 'Cdklabs.DynamoTableViewer' into project '~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj'.
info : Restoring packages for ~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj...
info : Package 'Cdklabs.DynamoTableViewer' is compatible with all the specified frameworks in project '~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj'.
info : PackageReference for package 'Cdklabs.DynamoTableViewer' version '0.2.488' added to file '~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj'.
info : Writing assets file to disk. Path: ~/cdk-workshop/src/CdkWorkshop/obj/project.assets.json
log  : Restored ~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj (in 104 ms).
```

{{% notice info %}}
**NOTE:** You must be in the same directory as the `*.csproj` file to install a Nuget package
{{% /notice %}}

----

Now we are ready to add a viewer to our app.

{{< nextprevlinks >}}