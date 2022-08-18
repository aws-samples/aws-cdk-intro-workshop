+++
title = "ライブラリのインストール"
weight = 200
+++

## Install Package

アプリケーションで table viewer を使用するために、Nuget パッケージをインストールする必要があります。


```
dotnet add package Cdklabs.DynamoTableViewer --version 0.2.4
```

出力は次のようになります。

```
info : Adding PackageReference for package 'Eladb.DynamoTableViewer' into project '~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj'.
info : Restoring packages for ~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj...
info :   GET https://api.nuget.org/v3-flatcontainer/cdklabs.dynamotableviewer/index.json
info :   OK https://api.nuget.org/v3-flatcontainer/cdklabs.dynamotableviewer/index.json 240ms
info :   GET https://api.nuget.org/v3-flatcontainer/cdklabs.dynamotableviewer/0.2.4/cdklabs.dynamotableviewer.0.2.4.nupkg
info :   OK https://api.nuget.org/v3-flatcontainer/cdklabs.dynamotableviewer/0.2.4/cdklabs.dynamotableviewer.0.2.4.nupkg 241ms
info : Installing Cdklabs.DynamoTableViewer 0.2.4.
info : Package 'Cdklabs.DynamoTableViewer' is compatible with all the specified frameworks in project '~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj'.
info : PackageReference for package 'Cdklabs.DynamoTableViewer' version '0.2.4' added to file '~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj'.
info : Committing restore...
info : Writing assets file to disk. Path: ~/cdk-workshop/src/CdkWorkshop/obj/project.assets.json
log  : Restore completed in 1.31 sec for ~/cdk-workshop/src/CdkWorkshop/CdkWorkshop.csproj.
```

{{% notice info %}}
**NOTE:** You must be in the same directory as the `*.csproj` file to install a Nuget package
{{% /notice %}}
----

これで、アプリケーションに table viewer を追加する準備ができました。
