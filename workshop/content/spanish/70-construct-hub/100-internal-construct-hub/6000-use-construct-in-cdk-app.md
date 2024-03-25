+++
title = "Utilizar el Constructo en una Aplicación de CDK"
weight = 600
+++

## Crear una Aplicación de CDK para Consumir el Constructo
Necesitamos crear una nueva aplicación de CDK para demostrar como consumir el constructo que acabamos de crear. Para hacer las cosas simples, reutilizaremos la aplicación [Hola, CDK!](../../20-typescript/30-hello-cdk.html) del workshop de Typescript.  Para comenzar, ejecutaremos los siguientes comandos desde el directorio `construct-hub-workshop`:

{{<highlight bash>}}
mkdir hello-cdk-app
cd hello-cdk-app
cdk init app --language typescript
{{</highlight>}}

## Configurar npm para Utilizar CodeArtifact como el Repositorio de Paquetes

Para permitir a npm extraer paquetes de nuestro repositorio de CodeArtifact, primero tenemos que iniciar una sesión siguiendo los pasos descritos [aquí](https://docs.aws.amazon.com/codeartifact/latest/ug/npm-auth.html). El comando debería verse así:

{{<highlight bash>}}
aws codeartifact login --tool npm --domain cdkworkshop-domain  --repository cdkworkshop-repository --region [Insert Region]
{{</highlight>}}

## Utilizar NPM para Instalar la Dependencia de cdkworkshop-lib

Para utilizar la biblioteca publicada `cdkworkshop-lib` que contiene el constructo de CDK hitcounter, use `npm install` para agregarla a las dependencias de la aplicación `Hola, CDK!`:

{{<highlight bash>}}
npm install cdkworkshop-lib
{{</highlight>}}

Oh no! Parece que tenemos un error:
{{<highlight bash "hl_lines=5">}}
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! 
npm ERR! While resolving: hello-cdk-app@0.1.0
npm ERR! Found: aws-cdk-lib@undefined
npm ERR! node_modules/aws-cdk-lib
npm ERR!   aws-cdk-lib@"^2.73.0" from the root project
npm ERR! 
npm ERR! Could not resolve dependency:
npm ERR! peer aws-cdk-lib@"^2.73.0" from cdkworkshop-lib@1.0.1
npm ERR! node_modules/cdkworkshop-lib
npm ERR!   cdkworkshop-lib@"*" from the root project
{{</highlight>}}

En la línea 5, NPM está diciendo que la versión de `aws-cdk-lib` es indefinida.  Esto se debe a que nuestro repositorio de CodeArtifact no contiene el paquete `aws-cdk-lib`. Cuando ejecutamos el comando `npm install cdkworkshop-lib`, npm fue a nuestro repositorio de CodeArtifact buscando `aws-cdk-lib` pero no pudo encontrarlo, y de allí el error. Podemos resolver eso ya sea adicionando el paquete `aws-cdk-lib` a nuestro repositorio de CodeCommit o configurando un repositorio de npm ascendente que CodeArtifact pueda usar.

Para simplicidad, utilizaremos el repositorio de npm ascendente.  De esta forma, si NPM va a nuestro repositorio de CodeArtifact y no puede encontrar un paquete en particular, primero tratará de buscar el paquete en el repositorio ascendente antes de generar un error. Si el paquete es encontrado, el paquete será instalado por NPM tal como se esperaba.

Para asignar el repositorio de npm _upstream_, siga las instrucciones en <a href="https://docs.aws.amazon.com/codeartifact/latest/ug/repo-upstream-add.html#:~:text=external%20connection.-,Add%20or%20remove%20upstream%20repositories%20(console),-Perform%20the%20steps" target="_blank">Agregue o elimine repositorios ascendentes</a>.  Una vez que esto se haya hecho, podemos ejecutar el siguiente comando para verificar el cambio:

{{<highlight bash>}}
aws codeartifact update-repository --repository cdkworkshop-repository --domain cdkworkshop-domain --upstreams repositoryName=npm-store --region [Insert Region]
{{</highlight>}}

Si el comando ejecuta correctamente, un bloque de JSON debe ser retornado y debería verse así:

{{<highlight JSON>}}
{
  "repository": {
    "name": "cdkworkshop-repository",
    "administratorAccount": "[Account ID]",
    "domainName": "cdkworkshop-domain",
    "domainOwner": "[Account ID]",
    "arn": "arn:aws:codeartifact:us-east-1:[Account ID]:repository/cdkworkshop-domain/cdkworkshop-repository",
    "upstreams": [
      {
        "repositoryName": "npm-store"
      }
    ],
    "externalConnections": [],
    "createdTime": "[Timestamp]"
  }
}
{{</highlight>}}

Ahora intente instalar `cdkworkshop-lib` de nuevo:

{{<highlight bash>}}
npm install cdkworkshop-lib
{{</highlight>}}

Esta vez funcionó! Podemos verificar esto observando la sección `dependencies` del archivo `package.json` en `hello-cdk-app`.

## Código del Manejador Lambda
Ahora, crearemos el código del manejador de la función AWS Lambda.

Cree un directorio llamado `lambda` en la raíz de su proyecto (al lado de `bin` y `lib`).

{{<highlight bash>}}
mkdir lambda
{{</highlight>}}

Luego cree un archivo llamado `lambda/hello.js` con el siguiente contenido:

{{<highlight javascript>}}
exports.handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, CDK! You've hit ${event.path}\n`
  };
};
{{</highlight>}}

## Agregue una Función AES Lambda y un API Gateway

Reemplace el código en `hello-cdk-app-stack.ts` con lo siguiente: 

{{<highlight typescript >}}
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { HitCounter } from 'cdkworkshop-lib';

export class HelloCdkAppStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,    // execution environment
      code: lambda.Code.fromAsset('lambda'),  // code loaded from "lambda" directory
      handler: 'hello.handler'                // file is "hello", function is "handler"
    });

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello,
      hitcounterPath: 'node_modules/cdkworkshop-lib/lambda', // the path to the hitcounter.js file in the lambda directory
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    });
  }
}
{{</highlight>}}

Esta pila importa nuestro constructo Hitcounter desde `cdkworkshop-lib` que acabamos de instalar. También agrega una `lambda.Function`, y `apigw.LambdaRestApi`:

## Desplegar la Aplicación Hola, CDK!

Ejecute `cdk deploy` para desplegar la aplicación y probarla.

{{<highlight bash>}}
cdk deploy
{{</highlight>}}

Una vez que esta desplegada, veremos un punto de conexión de API Gateway al que podemos acceder con un mensaje. Para hacerlo, agregue una cadena al final del URL.  Por ejemplo, podemos agregar la cadena 'hola!':

{{<highlight bash>}}
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hola!
{{</highlight>}}

La respuesta deberia verse así:

{{<highlight bash>}}
Hello, CDK! You've hit /hola!
{{</highlight>}}

## Revisar los beneficios

Y eso es todo! Su aplicación de CDK ahora consume el constructo Hitcounter de `cdkworkshop-lib` en la biblioteca de Constructos de CDK. Múltiples aplicaciones de CDK pueden utilizar este constructo sin necesidad de copiar/pegar su código así que se elimina la duplicación y las mejores prácticas pueden ser reutilizadas. Usted puede ahora empezar a agregar Constructos de CDK a `cdkworkshop-lib` para construir una biblioteca que le ayude a acelerar sus equipos y establecer mejores prácticas!
