+++
title = "Desplegando nuestra aplicación"
weight = 500
+++

## cdk diff

Antes de este despliegue, miremos que pasará cuando despleguemos la aplicación 
(esta es sólo la sección `Resources` de la respuesta):

```
$ cdk diff
Resources
[+] AWS::IAM::Role ViewHitCounter/Rendered/ServiceRole ViewHitCounterRenderedServiceRole254DB4EA
[+] AWS::IAM::Policy ViewHitCounter/Rendered/ServiceRole/DefaultPolicy ViewHitCounterRenderedServiceRoleDefaultPolicy9ADB8C83
[+] AWS::Lambda::Function ViewHitCounter/Rendered ViewHitCounterRendered9C783E45
[+] AWS::Lambda::Permission ViewHitCounter/Rendered/ApiPermission.ANY.. ViewHitCounterRenderedApiPermissionANY72263B1A
[+] AWS::Lambda::Permission ViewHitCounter/Rendered/ApiPermission.Test.ANY.. ViewHitCounterRenderedApiPermissionTestANYA4794B81
[+] AWS::Lambda::Permission ViewHitCounter/Rendered/ApiPermission.ANY..{proxy+} ViewHitCounterRenderedApiPermissionANYproxy42B9E676
[+] AWS::Lambda::Permission ViewHitCounter/Rendered/ApiPermission.Test.ANY..{proxy+} ViewHitCounterRenderedApiPermissionTestANYproxy104CA88E
[+] AWS::ApiGateway::RestApi ViewHitCounter/ViewerEndpoint ViewHitCounterViewerEndpoint5A0EF326
[+] AWS::ApiGateway::Deployment ViewHitCounter/ViewerEndpoint/Deployment ViewHitCounterViewerEndpointDeployment1CE7C5761d44312e8424c23ba090a70e0962c36f
[+] AWS::ApiGateway::Stage ViewHitCounter/ViewerEndpoint/DeploymentStage.prod ViewHitCounterViewerEndpointDeploymentStageprodF3901FC7
[+] AWS::IAM::Role ViewHitCounter/ViewerEndpoint/CloudWatchRole ViewHitCounterViewerEndpointCloudWatchRole87B94D6A
[+] AWS::ApiGateway::Account ViewHitCounter/ViewerEndpoint/Account ViewHitCounterViewerEndpointAccount0B75E76A
[+] AWS::ApiGateway::Resource ViewHitCounter/ViewerEndpoint/Default/{proxy+} ViewHitCounterViewerEndpointproxy2F4C239F
[+] AWS::ApiGateway::Method ViewHitCounter/ViewerEndpoint/Default/{proxy+}/ANY ViewHitCounterViewerEndpointproxyANYFF4B8F5B
[+] AWS::ApiGateway::Method ViewHitCounter/ViewerEndpoint/Default/ANY ViewHitCounterViewerEndpointANY66F2285B
```

Se pueden fijar que el _table viewer_ agrega otro endpoint de API Gateway, una 
función Lambda, permisos y outputs, entre otros.

{{% notice warning %}} 
Las bibliotecas de constructos son un concepto muy poderoso. Permiten agregar
capacidades complejas a aplicaciones con mínimo esfuerzo. Sin embargo, debemos 
entender que un gran poder conlleva una gran responsabilidad. Los constructos pueden agregar 
permisos de IAM, exponer data al público o causar que su aplicación pare de funcionar.
Estamos trabajando en herramientas para protejer sus aplicaciones, e identificar potenciales 
riesgos de seguridad con sus stacks, pero es su responsabilidad entender como los constructos
que usan impactan su aplicación, y asegurarse de usar librerías de constructs de proveedores
en los que confían.
{{% /notice %}}

### cdk deploy

```
$ cdk deploy
...
cdk-workshop.ViewHitCounterViewerEndpointCA1B1E4B = https://6i4udz9wb2.execute-api.us-east-2.amazonaws.com/prod/
```

Veremos el endpoint del visualizador como un ouput.

### Viendo la tabla del contador

Abriremos nuestro navegador y navegaremos hacia la URL del endpoint del visualizador. 
Deberíamos ver algo así:

![](./viewer1.png)

### Enviando solicitudes

Enviaremos unas solicitudes más a nuestro endpoint "hello" y monitoreamos nuestro 
visualizador. Deberíamos ver a los valores actualizarse en tiempo real.

Usamos `curl` o nuestro navegador para producir más consultas:

```
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hoooot
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hoooot
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hoooot
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hoooot
$ curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hit1
```

{{% notice tip %}}

**Interesado en cómo funciona el Table Viewer?** Es fácil averiguarlo!
Mantén **Ctrl** (o **Command**) y haz click en el nombre `TableViewer` 
para navegar a su código fuente. También puedes navegar al repositorio
de Github [aquí](https://github.com/eladb/cdk-dynamo-table-viewer)

{{% /notice %}}
