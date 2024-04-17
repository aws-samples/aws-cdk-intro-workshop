+++
title = "ライブラリのインストール"
weight = 200
+++

## Install Package

アプリケーションで table viewer を使用するために、Nuget パッケージをインストールする必要があります。


```
dotnet add package Cdklabs.DynamoTableViewer --version 0.2.488
```

出力は次のようになります。

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

これで、アプリケーションに table viewer を追加する準備ができました。

{{< nextprevlinks >}}