+++
title = "Crear la Biblioteca de Constructos - Código del Constructo"
weight = 400
+++

## Crear la Biblioteca de Constructos - Constructo

Ahora, crearemos un proyecto para la biblioteca de constructos aprovechando Projen para sintetizar y administrar los archivos de configuración del mismo.  Luego, como un Productor del Construct Hub Interno, crearemos un constructo llamado `HitCounter`. Por último, editaremos la configuración para transpilar nuestros constructos a los objetivos de tiempo de ejecución/lenguaje seleccionados.

### Configurar un Proyecto de Projen

En el directorio `construct-lib-repo`, creemos un directorio llamado `constructs/`. Debería estar al mismo nivel del directorio `pipeline/`.

{{<highlight bash>}}
mkdir constructs
cd constructs
{{</highlight>}}

Ejecute el siguiente comando para montar un proyecto Projen de tipo awscdk-construct

{{<highlight javascript>}}
npx projen new awscdk-construct \
 --build-workflow false \
 --github false \
 --default-release-branch main \
 --no-git \
 --name "cdkworkshop-lib"
{{</highlight>}}

El archivo `.projenrc.js` contiene la configuración de Projen.

Abra el archivo `.projenrc.js` y haga los cambios siguientes.

1. Importe la clase ReleaseTrigger de la biblioteca de projen.
   {{<highlight javascript>}}
   const { ReleaseTrigger } = require('projen/lib/release');
   {{</highlight>}}

2. Después del atributo `repositoryUrl` agregue los siguientes atributos:

{{<highlight javascript>}}
description: 'CDK Construct Library by projen/jsii',
python: {
distName: 'hitcounter',
module: 'cdkworkshop-lib',
},
dotnet: {
dotNetNamespace: 'CDKWorkshopLib',
packageId: 'com.cdkworkshop.HitCounter',
},
publishToMaven: {
javaPackage: 'com.cdkworkshop.hitcounter',
mavenArtifactId: 'constructs',
mavenGroupId: 'cdkworkshop-lib',
},
majorVersion: 1,
releaseTrigger: ReleaseTrigger.manual(),
{{</highlight>}}

El archivo debe verse así:

{{<highlight javascript>}}
const { awscdk } = require('projen');
const { ReleaseTrigger } = require('projen/lib/release');

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'CDK Workshop',
  authorAddress: 'cdkworkshop@amazon.com',
  buildWorkflow: false,
  cdkVersion: '[Insert Latest CDK Version]', //Make sure to update this value to the latest version
  defaultReleaseBranch: 'main',
  github: false,
  name: 'cdkworkshop-lib',
  releaseTagPrefix: 'cdkworkshop-lib',
  repositoryUrl: 'codecommit::us-east-1://construct-lib-repo',
  description: 'CDK Construct Library by projen/jsii',
  python: {
    distName: 'hitcounter',
    module: 'cdkworkshop-lib',
  },
  dotnet: {
    dotNetNamespace: 'CDKWorkshopLib',
    packageId: 'com.cdkworkshop.HitCounter',
  },
  publishToMaven: {
    javaPackage: 'com.cdkworkshop.hitcounter',
    mavenArtifactId: 'constructs',
    mavenGroupId: 'cdkworkshop-lib',
  },
  releaseTrigger: ReleaseTrigger.manual(),
  majorVersion: 1,
});

project.synth();
{{</highlight>}}

Asegurese de reemplazar el valor de `cdkVersion` con la versión más reciente (Version 2), que usted puede encontrar aquí: <a href="https://docs.aws.amazon.com/cdk/api/versions.html" target="_blank">CDK Version</a>

Los atributos `python`, `dotnet` y `publishToMaven` le dicen a Projen que transpile el Constructo de CDK a esos tiempos de ejecución objetivo.

El atributo `majorVersion` es asignado a `1`, así que comenzamos con la versión `1.0.0` de los artefactos empaquetados.

El atributo `releaseTrigger` es asignado a `manual`. Para cada confirmación/envío al repositorio la canalización más tarde ejecutará un `projen release` que actualizará automáticamente la versión de los artefactos publicados.  Projen utiliza <a href="https://semver.org/" target="_blank">SEMVER</a> y <a href="https://www.conventionalcommits.org/en/v1.0.0/#specification" target="_blank">Conventional Commits</a> para decidir que parte de la versión incrementar, para detalles vea la <a href="https://projen.io/releases.html" target="_blank">documentación de Projen</a>.

#### Sintetizador Projen
Ejecute `projen` desde el directorio `constructs`. Esto hara que projen sintetice la configuración. Projen sintetiza los archivos de configuración del proyecto tales como package.json, tsconfig.json, .gitignore, GitHub Workflows, eslint, jest, etc. desde una definición correctamente-escrita en JavaScript:

{{<highlight bash>}}
npx projen
{{</highlight>}}

#### Crear el Directorio Lambda
Cree el directorio `lambda` en la raíz del directorio de constructos (al lado de `src` y `test`):

{{<highlight bash>}}
mkdir lambda
{{</highlight>}}

#### Controlador de Lambda para el Hit counter
Reutilizaremos el [Controlador del contador de solicitudes](../../20-typescript/40-hit-counter/200-handler.html) del workshop de TypeScript. Cree el archivo llamado `lambda/hitcounter.js`:

{{<highlight typescript>}}
const { DynamoDB, Lambda } = require('aws-sdk');

exports.handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // create AWS SDK clients
  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  // update dynamo entry for "path" with hits++
  await dynamo.updateItem({
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: { S: event.path } },
    UpdateExpression: 'ADD hits :incr',
    ExpressionAttributeValues: { ':incr': { N: '1' } }
  }).promise();

  // call downstream function and capture response
  const resp = await lambda.invoke({
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: JSON.stringify(event)
  }).promise();

  console.log('downstream response:', JSON.stringify(resp, undefined, 2));

  // return response back to upstream caller
  return JSON.parse(resp.Payload);
};
{{</highlight>}}

#### Agregue el Constructo Hit Counter

Cree un nuevo archivo `hitcounter.ts` en el directorio `constructs/src`. Use el siguiente código:

{{<highlight typescript>}}
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { Construct } from 'constructs';

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  readonly downstream: lambda.IFunction;

  /** the path to the hitcounter lambda directory. Doing it this way allows us to specify the path in the stack itself **/
  readonly hitcounterPath: string;
}

export class HitCounter extends Construct {
  /*_ allows accessing the counter function */
  public readonly handler: lambda.Function;

  /*_ the hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
    });
    this.table = table;

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hitcounter.handler',
      code: lambda.Code.fromAsset(props.hitcounterPath),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName,
      },
    });

    // grant the lambda role read/write permissions to our table
    table.grantReadWriteData(this.handler);

    // grant the lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler);

  }
}
{{</highlight>}}

Esto es muy similar al [constructo Hitcounter](../../20-typescript/40-hit-counter/300-resources.html) del workshop de Typescript con algunas modificaciones.

Ahora, actualice `index.ts` en `constructs/src` agregando el siguiente código en la línea 1:

{{<highlight typescript>}}
export * from './hitcounter';
{{</highlight>}}

{{% notice info %}} Nota: Projen solamente transpila archivos Typescript en el folder `src` {{% /notice %}}

Finalmente, agregemos una prueba sencilla para asegurar que el proceso de compilación de nuestro nuevo constructo sea exitoso. Renombre el archivo `hello.test.ts` que se encuentra en el directorio `constructs\test` a `hitcounter.test.ts` y reemplace el contenido con el siguiente código:

{{<highlight typescript>}}
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter } from '../src/hitcounter';

test('DynamoDB Table Created', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    hitcounterPath: 'lambda',
    downstream: new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`exports.handler = async function(event) {
          console.log("event: ", event);
        };
     `),
    }),

  });
  // THEN
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::DynamoDB::Table', 1);
});
{{</highlight>}}

#### Detección de Manipulaciones de Projen

Projen es _opinionado_ y exige que toda la configuración del proyecto sea hecha a través del archivo `.projenrc.js`. Por ejemplo, si usted hace un cambio directamente a `package.json` entonces Projen detectará esto durante la fase de liberación y el intento fallará. Por lo tanto, es una buena idea hacer un projen _synth_ ejecutando el comando `projen` en el directorio donde el archivo `.projenrc.js` se encuentra antes de enviar el código a nuestro repositorio de CodeCommit.

{{<highlight bash>}}
# This is to avoid Projen tamper related errors
npx projen
{{</highlight>}}

## Enviar la Confirmación Inicial al Repositorio de CodeCommit

Asegurese de enviar los cambios desde el directorio `construct-lib-repo`:
{{<highlight bash>}}
git add .
git commit -m 'Initial Commit'
git push
{{</highlight>}}

### Extra Crédito (Opcional)

#### Cómo Generar Paquetes Transpilados de JSSI Localmente?

El comando `compile` a continuación necesita ser ejecutado en el folder `constructs` en donde se encuentra el archivo `.projenrc.js`. Compilará los archivos en el folder `src/` y los almacenará en el folder `lib/`.
{{<highlight bash>}}
npx projen compile
{{</highlight>}}

El comando `package` hará la transpilación al lenguaje objetivo y almacenará el resultado en el directorio `dist/`.
{{<highlight bash>}}
npx projen package:js
{{</highlight>}}

Revise el contenido del directorio `dist/js/` para ver el artefacto generado.

## Resumen

<!-- Hay que revisar la primera frase, no le encuentro mucho sentido  -->
En esta sección, estructuramos el código de la biblioteca de constructos de la manera en la que es esperada por la canalización de la biblioteca de constructos. En la siguiente sección haremos el despliegue de la canalización para compilar, transpilar, y publicar los artefactos a nuestro Construct Hub Interno.
