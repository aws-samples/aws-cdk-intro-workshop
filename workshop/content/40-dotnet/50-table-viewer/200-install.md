+++
title = "Installing the library"
weight = 200
+++

## Install Package

Before you can use the table viewer in your application, you'll need to install
the Nuget package:

```sh
dotnet add package Eladb.DynamoTableViewer --version 3.1.2
```

Output should look like this:

```log
info : Adding PackageReference for package 'Eladb.DynamoTableViewer' into project '~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj'.
info : Restoring packages for ~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj...
info :   GET https://api.nuget.org/v3-flatcontainer/eladb.dynamotableviewer/index.json
info :   OK https://api.nuget.org/v3-flatcontainer/eladb.dynamotableviewer/index.json 240ms
info :   GET https://api.nuget.org/v3-flatcontainer/eladb.dynamotableviewer/3.1.2/eladb.dynamotableviewer.3.1.2.nupkg
info :   OK https://api.nuget.org/v3-flatcontainer/eladb.dynamotableviewer/3.1.2/eladb.dynamotableviewer.3.1.2.nupkg 241ms
info : Installing Eladb.DynamoTableViewer 3.1.2.
info : Package 'Eladb.DynamoTableViewer' is compatible with all the specified frameworks in project '~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj'.
info : PackageReference for package 'Eladb.DynamoTableViewer' version '3.1.2' added to file '~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj'.
info : Committing restore...
info : Writing assets file to disk. Path: ~/cdk-workshop/src/CdkWorkshop/obj/project.assets.json
log  : Restore completed in 1.31 sec for ~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj.
```

----

Now we are ready to add a viewer to our app.
