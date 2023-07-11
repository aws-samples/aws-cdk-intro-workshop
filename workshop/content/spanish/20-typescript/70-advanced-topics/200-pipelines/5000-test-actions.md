+++
title = "Mejorar la Canalización"
weight = 150
+++

## Obtener Puntos de Conexión
Observando detenidamente, podemos ver que hay un problema ahora que la aplicación esta siendo desplegada por nuestra canalización. No hay una manera fácil de encontrar los puntos de conexión de nuestra aplicación (para `TableViewer` y `APIGateway`), así que no podemos acceder a ellos! Agreguemos un poco de código que nos permita exponerlos de una manera más obvia.

Primero editemos `lib/cdk-workshop-stack.ts` para obtener estos valores y exponerlos como propiedades de nuestra pila:

{{<highlight ts "hl_lines=9-10 26 30 36-42">}}
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends cdk.Stack {
  public readonly hcViewerUrl: cdk.CfnOutput;
  public readonly hcEndpoint: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'hello.handler',
    });

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    const gateway = new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    });

    const tv = new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello Hits',
      table: helloWithCounter.table,
      sortBy: '-hits'
    });

    this.hcEndpoint = new cdk.CfnOutput(this, 'GatewayUrl', {
      value: gateway.url
    });

    this.hcViewerUrl = new cdk.CfnOutput(this, 'TableViewerUrl', {
      value: tv.endpoint
    });
  }
}
{{</highlight>}}

Al agregar las salidas `hcViewerUrl` y `hcEnpoint`, estamos exponiendo los puntos de conexión necesarios para nuestra aplicación HitCounter. Estamos utilizando el constructo básico `CfnOutput` para declarar estas salidas como salidas de la pila de CloudFormation (explicaremos mas detalles en un minuto).

Confirmemos estos cambios a nuestro repositorio (`git commit -am "MESSAGE" && git push`), y naveguemos a la [consola de CloudFormation](https://console.aws.amazon.com/cloudformation). Allí usted puede ver que hay tres pilas.

* `CDKToolkit`: La primera es la pila integrada de CDK (ustede debe ver esta pila en todas las cuentas en donde haya configurado CDK). Puede ignorar esta pila.
* `WorkshopPipelineStack`: Esta es la pila que declara nuestra canalización. No es realmente la que necesitamos ahora.
* `Deploy-WebService`: Aquí está nuestra aplicación! Seleccione esta pila, y bajo sus detalles, seleccione el tab `Outputs`. Aquí ustede debe encontrar cuatro puntos de conexión (dos pares de valores duplicados).  Dos de ellos, `EndpointXXXXXX` y `ViewerHitCounterViewerEndpointXXXXXXX`, son los generados por Cloudformation, y los otros dos son los que nosotros mismos generamos.

![](./stack-outputs.png)

Si usted hace click en `TableViewerUrl`, usted debería ver nuestra bella tabla contadora de hits que creamos durante el workshop inicial.

## Adicionar una Prueba de Validación
Ahora ya hemos desplegado nuestra aplicación, pero una canalización de CD no es completa sin pruebas!

Comencemos con una simple prueba que le haga ping a nuestros puntos de conexión para confirmar que están vivos.
Volvamos a `lib/pipeline-stack.ts` y agreguemos lo siguiente:

{{<highlight ts "hl_lines=16-38">}}
import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';
import {WorkshopPipelineStage} from './pipeline-stage';
import {CodeBuildStep, CodePipeline, CodePipelineSource} from "aws-cdk-lib/pipelines";

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // PIPELINE CODE HERE...

        const deploy = new WorkshopPipelineStage(this, 'Deploy');
        const deployStage = pipeline.addStage(deploy);

        deployStage.addPost(
            new CodeBuildStep('TestViewerEndpoint', {
                projectName: 'TestViewerEndpoint',
                envFromCfnOutputs: {
                    ENDPOINT_URL: //TBD
                },
                commands: [
                    'curl -Ssf $ENDPOINT_URL'
                ]
            }),

            new CodeBuildStep('TestAPIGatewayEndpoint', {
                projectName: 'TestAPIGatewayEndpoint',
                envFromCfnOutputs: {
                    ENDPOINT_URL: //TBD
                },
                commands: [
                    'curl -Ssf $ENDPOINT_URL',
                    'curl -Ssf $ENDPOINT_URL/hello',
                    'curl -Ssf $ENDPOINT_URL/test'
                ]
            })
        )
    }
}
{{</highlight>}}

Adicionamos pasos post-implementación utilizando `deployStage.AddPost(...)` de Canalizaciones de CDK. Agregamos dos acciones a nuestra etapa de despliegue: para probar el punto de conexión de nuestro TableViewer y el punto de conexión de nuestro APIGateway, respectivamente.

> Nota: Enviamos varios requerimientos de `curl` al punto de conexión de APIGateway de tal forma que cuando accedamos a nuestro TableViewer, haya varios valores ya poblados.

Usted puede haber notado que aun no hemos asignado el valor de los URLs de estos puntos de conexión. Esto se debe a que aún no han sido expuestos a esta pila!

Con una pequeña modificación a `lib/pipeline-stage.ts` los podemos exponer:

{{<highlight ts "hl_lines=2 6-7 12 14-15">}}
import { CdkWorkshopStack } from './cdk-workshop-stack';
import { Stage, CfnOutput, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class WorkshopPipelineStage extends Stage {
    public readonly hcViewerUrl: CfnOutput;
    public readonly hcEndpoint: CfnOutput;

    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const service = new CdkWorkshopStack(this, 'WebService');

        this.hcEndpoint = service.hcEndpoint;
        this.hcViewerUrl = service.hcViewerUrl;
    }
}
{{</highlight>}}

Y ahora podemos agregar esos valores a nuestras acciones en `lib/pipeline-stack.ts` obteniendo el `stackOutput` de nuestra etapa de despliegue:
{{<highlight ts "hl_lines=6 15">}}
    // CODE HERE...
    deployStage.addPost(
            new CodeBuildStep('TestViewerEndpoint', {
                projectName: 'TestViewerEndpoint',
                envFromCfnOutputs: {
                    ENDPOINT_URL: deploy.hcViewerUrl
                },
                commands: [
                    'curl -Ssf $ENDPOINT_URL'
                ]
                }),
            new CodeBuildStep('TestAPIGatewayEndpoint', {
                projectName: 'TestAPIGatewayEndpoint',
                envFromCfnOutputs: {
                    ENDPOINT_URL: deploy.hcEndpoint
                },
                commands: [
                    'curl -Ssf $ENDPOINT_URL',
                    'curl -Ssf $ENDPOINT_URL/hello',
                    'curl -Ssf $ENDPOINT_URL/test'
                ]
            })
        )
{{</highlight>}}

## Confirmar y Verificar!
Confirme estos cambios, espere a que la canalización haga el re-despliegue de la aplicación, navegue de nuevo a la [consola de CodePipeline](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) y allí usted podrá ver que hay dos acciones de prueba contenidas dentro de la etapa de despliegue (`Deploy`)!

![](./pipeline-tests.png)

Felicitaciones! Usted ha creado exitosamente una canalización de CD para su aplicación completa con pruebas y todo! Sientase libre de explorar la consola para ver los detalles de la pila creada, o dele un vistazo a la sección en la [Referencia del API](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html) acerca de Canalizaciones de CDK y construya una para su aplicación.
