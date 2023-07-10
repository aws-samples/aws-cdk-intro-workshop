+++
title = "API Gateway"
weight = 400
+++

El siguiente paso es añadir API Gateway delante de nuestra función. API Gateway mostrará un endpoint HTTP público al que cualquier usuario de internet puede acceder con un cliente HTTP, como [curl](https://curl.haxx.se/) o un navegador web.

Usaremos la [integración de proxy Lambda](https://docs.aws.amazon.com/es_es/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html) montada en la raíz de la API. Esto significa que cualquier solicitud a cualquier ruta URL se enviará directamente a nuestra función de Lambda y la respuesta de la función se devolverá al usuario.

## Agregue una construcción LambdaRestAPI a su pila

Definamos un endpoint para la API y asociémoslo a nuestra función Lambda. Añada este código a `cdk_workshop_stack.py` (que debería seguir abierto desde el último paso):

{{<highlight python "hl_lines=5 21-24">}}
from constructs import Construct
from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigw,
)


class CdkWorkshopStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        my_lambda = _lambda.Function(
            self, 'HelloHandler',
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.from_asset('lambda'),
            handler='hello.handler',
        )

        apigw.LambdaRestApi(
            self, 'Endpoint',
            handler=my_lambda,
        )
{{</highlight>}}

Eso es todo. Esto es todo lo que necesita hacer para definir una pasarela de API que redirija todas las solicitudes a una función de AWS Lambda.

## cdk diff

Veamos qué pasará cuando implementemos esto:

```
cdk diff
```

La salida debería verse así:


```
The cdk-workshop stack uses assets, which are currently not accounted for in the diff output! See https://github.com/awslabs/aws-cdk/issues/395
IAM Statement Changes
┌───┬────────────────────┬────────┬────────────────────┬────────────────────┬───────────────────────┐
│   │ Resource           │ Effect │ Action             │ Principal          │ Condition             │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ + │ ${Endpoint/CloudWa │ Allow  │ sts:AssumeRole     │ Service:apigateway │                       │
│   │ tchRole.Arn}       │        │                    │ .${AWS::URLSuffix} │                       │
├───┼────────────────────┼────────┼────────────────────┼────────────────────┼───────────────────────┤
│ + │ ${HelloHandler.Arn │ Allow  │ lambda:InvokeFunct │ Service:apigateway │ "ArnLike": {          │
│   │ }                  │        │ ion                │ .amazonaws.com     │   "AWS:SourceArn": "a │
│   │                    │        │                    │                    │ rn:${AWS::Partition}: │
│   │                    │        │                    │                    │ execute-api:us-east-2 │
│   │                    │        │                    │                    │ :${AWS::AccountId}:${ │
│   │                    │        │                    │                    │ Endpoint}/${EndpointD │
│   │                    │        │                    │                    │ eploymentStageprodB78 │
│   │                    │        │                    │                    │ BEEA0}/*/"            │
│   │                    │        │                    │                    │ }                     │
│ + │ ${HelloHandler.Arn │ Allow  │ lambda:InvokeFunct │ Service:apigateway │ "ArnLike": {          │
│   │ }                  │        │ ion                │ .amazonaws.com     │   "AWS:SourceArn": "a │
│   │                    │        │                    │                    │ rn:${AWS::Partition}: │
│   │                    │        │                    │                    │ execute-api:us-east-2 │
│   │                    │        │                    │                    │ :${AWS::AccountId}:${ │
│   │                    │        │                    │                    │ Endpoint}/test-invoke │
│   │                    │        │                    │                    │ -stage/*/"            │
│   │                    │        │                    │                    │ }                     │
│ + │ ${HelloHandler.Arn │ Allow  │ lambda:InvokeFunct │ Service:apigateway │ "ArnLike": {          │
│   │ }                  │        │ ion                │ .amazonaws.com     │   "AWS:SourceArn": "a │
│   │                    │        │                    │                    │ rn:${AWS::Partition}: │
│   │                    │        │                    │                    │ execute-api:us-east-2 │
│   │                    │        │                    │                    │ :${AWS::AccountId}:${ │
│   │                    │        │                    │                    │ Endpoint}/${EndpointD │
│   │                    │        │                    │                    │ eploymentStageprodB78 │
│   │                    │        │                    │                    │ BEEA0}/*/{proxy+}"    │
│   │                    │        │                    │                    │ }                     │
│ + │ ${HelloHandler.Arn │ Allow  │ lambda:InvokeFunct │ Service:apigateway │ "ArnLike": {          │
│   │ }                  │        │ ion                │ .amazonaws.com     │   "AWS:SourceArn": "a │
│   │                    │        │                    │                    │ rn:${AWS::Partition}: │
│   │                    │        │                    │                    │ execute-api:us-east-2 │
│   │                    │        │                    │                    │ :${AWS::AccountId}:${ │
│   │                    │        │                    │                    │ Endpoint}/test-invoke │
│   │                    │        │                    │                    │ -stage/*/{proxy+}"    │
│   │                    │        │                    │                    │ }                     │
└───┴────────────────────┴────────┴────────────────────┴────────────────────┴───────────────────────┘
IAM Policy Changes
┌───┬────────────────────────────┬──────────────────────────────────────────────────────────────────┐
│   │ Resource                   │ Managed Policy ARN                                               │
├───┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ + │ ${Endpoint/CloudWatchRole} │ arn:${AWS::Partition}:iam::aws:policy/service-role/AmazonAPIGate │
│   │                            │ wayPushToCloudWatchLogs                                          │
└───┴────────────────────────────┴──────────────────────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See http://bit.ly/cdk-2EhF7Np)

Resources
[+] AWS::Lambda::Permission HelloHandler/ApiPermission.ANY.. HelloHandlerApiPermissionANYAC4E141E
[+] AWS::Lambda::Permission HelloHandler/ApiPermission.Test.ANY.. HelloHandlerApiPermissionTestANYDDD56D72
[+] AWS::Lambda::Permission HelloHandler/ApiPermission.ANY..{proxy+} HelloHandlerApiPermissionANYproxy90E90CD6
[+] AWS::Lambda::Permission HelloHandler/ApiPermission.Test.ANY..{proxy+} HelloHandlerApiPermissionTestANYproxy9803526C
[+] AWS::ApiGateway::RestApi Endpoint EndpointEEF1FD8F
[+] AWS::ApiGateway::Deployment Endpoint/Deployment EndpointDeployment318525DAb462c597ccb914d9fc1c10f664ed81ca
[+] AWS::ApiGateway::Stage Endpoint/DeploymentStage.prod EndpointDeploymentStageprodB78BEEA0
[+] AWS::IAM::Role Endpoint/CloudWatchRole EndpointCloudWatchRoleC3C64E0F
[+] AWS::ApiGateway::Account Endpoint/Account EndpointAccountB8304247
[+] AWS::ApiGateway::Resource Endpoint/Default/{proxy+} Endpointproxy39E2174E
[+] AWS::ApiGateway::Method Endpoint/Default/{proxy+}/ANY EndpointproxyANYC09721C5
[+] AWS::ApiGateway::Method Endpoint/Default/ANY EndpointANY485C938B

Outputs
[+] Output Endpoint/Endpoint Endpoint8024A810: {"Value":{"Fn::Join":["",["https://",{"Ref":"EndpointEEF1FD8F"},".execute-api.us-east-2.",{"Ref":"AWS::URLSuffix"},"/",{"Ref":"EndpointDeploymentStageprodB78BEEA0"},"/"]]}}
```

Eso está bien. Esta línea de código agregó 12 recursos nuevos a nuestra pila.

## cdk deploy

Bueno, estamos listos para desplegar?

```
cdk deploy
```

## Salidas de la pila

Cuando la implementación esté completa, verás esta linea:

```
CdkWorkshopStack.Endpoint8024A810 = https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

Esta es una[salida de pila](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html) que la construcción de API Gateway agrega automáticamente e incluye la URL del endpoint de API Gateway.

## Probando la aplicación

Intentemos alcanzar este endpoint con `curl`. Copia la URL y ejecútala (es probable que tu prefijo y región sean diferentes).

{{% notice info %}}
Si no tienes [curl](https://curl.haxx.se/) instalado, siempre puedes usar tu navegador web favorito para acceder a esta URL.
{{% /notice %}}

```
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

La salida se verá así:

```
Hello, CDK! You've hit /
```

También podemos verlo desde el navegador:

![](./browser.png)

Si esta es la salida recibida, entonces nuestra aplicación funciona!

## ¿Qué pasa si no funciona?

Si recibiste un error 5xx de API Gateway, es probable que se deba a uno de estos dos problemas:

1. La respuesta que ha devuelto tu función no es la que espera API Gateway. Vuelva atrás y asegúrese de que su `handler` devuelva una respuesta que incluya los campos de `statusCode`, `body` y `header` (consulte [Escribir el código de ejecución del controlador](./200-lambda.html)).
2. La función falló por algún motivo. Para depurarlo, puedes ir rápidamente a [esta sección](../40-hit-counter/500-logs.html) para aprender a ver tus registros de Lambda.

* * *
¡Buen trabajo! En el próximo capítulo, escribiremos nuestra propia construcción reutilizable.