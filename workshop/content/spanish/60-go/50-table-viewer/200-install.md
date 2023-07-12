+++
title = "Instalando la librería"
weight = 200
+++

## go install

Antes de que podamos usar el _table viewer_ en nuestra aplicación, tendremos que 
instalar su módulo de go:

```
go get github.com/cdklabs/cdk-dynamo-table-viewer-go/dynamotableviewer
```

La respuesta debería verse así:

```
go: upgraded github.com/aws/jsii-runtime-go v1.63.2 => v1.65.0
go: added github.com/cdklabs/cdk-dynamo-table-viewer-go/dynamotableviewer v0.2.248
```

----

Ahora estamos listos para agregar el _table viewer_ a nuestra aplicación.
