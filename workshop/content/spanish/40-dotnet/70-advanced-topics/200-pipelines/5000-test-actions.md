+++
title = "Mejorar la Canalización"
weight = 5000
+++

## Obtener Puntos de Conexión
Observando detenidamente, podemos ver que hay un problema ahora que la aplicación esta siendo desplegada por nuestra canalización. No hay una manera fácil de encontrar los puntos de conexión de nuestra aplicación (para `TableViewer` y `APIGateway`), así que no podemos acceder a ellos! Agreguemos un poco de código que nos permita exponerlos de una manera más obvia.

Primero editemos `CdkWorkshop/CdkWorkshopStack.cs` para obtener estos valores y exponerlos como propiedades de nuestra pila:

{{<highlight ts "hl_lines=11-12 40-48">}}
using Amazon.CDK;
using Amazon.CDK.AWS.APIGateway;
using Amazon.CDK.AWS.Lambda;
using Cdklabs.DynamoTableViewer;
using Constructs;

namespace CdkWorkshop
{
    public class CdkWorkshopStack : Stack
    {
        public readonly CfnOutput HCViewerUrl;
        public readonly CfnOutput HCEndpoint;

        // Defines a new lambda resource
        public CdkWorkshopStack(Construct parent, string id, IStackProps props = null) : base(parent, id, props)
        {
            var hello = new Function(this, "HelloHandler", new FunctionProps
            {
                Runtime = Runtime.NODEJS_14_X,
                Code = Code.FromAsset("lambda"),
                Handler = "hello.handler"
            });

            var helloWithCounter = new HitCounter(this, "HelloHitCounter", new HitCounterProps
            {
                Downstream = hello
            });

            var gateway = new LambdaRestApi(this, "Endpoint", new LambdaRestApiProps
            {
                Handler = helloWithCounter.Handler
            });

            var tv = new TableViewer(this, "ViewerHitCount", new TableViewerProps
            {
                Title = "Hello Hits",
                Table = helloWithCounter.MyTable
            });

            this.HCViewerUrl = new CfnOutput(this, "TableViewerUrl", new CfnOutputProps
            {
                Value = tv.Endpoint
            });

            this.HCEndpoint = new CfnOutput(this, "GatewayUrl", new CfnOutputProps
            {
                Value = gateway.Url
            });
        }
    }
}
{{</highlight>}}

Al agregar las salidas `HCViewerUrl` y `HCEndpoint`, estamos exponiendo los puntos de conexión necesarios para nuestra aplicación HitCounter. Estamos utilizando el constructo básico `CfnOutput` para declarar estas salidas como salidas de la pila de CloudFormation (explicaremos mas detalles en un minuto).

Confirmemos estos cambios a nuestro repositorio (`git commit -am "MESSAGE" && git push`), y naveguemos a la [consola de CloudFormation](https://console.aws.amazon.com/cloudformation). Allí usted puede ver que hay tres pilas.

* `CDKToolkit`: La primera es la pila integrada de CDK (ustede debe ver esta pila en todas las cuentas en donde haya configurado CDK). Puede ignorar esta pila.
* `WorkshopPipelineStack`: Esta es la pila que declara nuestra canalización. No es realmente la que necesitamos ahora.
* `Deploy-WebService`: Aquí está nuestra aplicación! Seleccione esta pila, y bajo sus detalles, seleccione el tab `Outputs`. Aquí ustede debe encontrar cuatro puntos de conexión (dos pares de valores duplicados).  Dos de ellos, `EndpointXXXXXX` y `ViewerHitCounterViewerEndpointXXXXXXX`, son los generados por Cloudformation, y los otros dos son los que nosotros mismos generamos.

![](./stack-outputs.png)

Si usted hace click en `TableViewerUrl`, usted debería ver nuestra bella tabla contadora de hits que creamos durante el workshop inicial.

## Adicionar una Prueba de Validación
Ahora ya hemos desplegado nuestra aplicación, pero una canalización de CD no es completa sin pruebas!

Comencemos con una simple prueba que le haga ping a nuestros puntos de conexión para confirmar que están vivos.
Volvamos a `CdkWorkshop/PipelineStack.cs` y agreguemos lo siguiente:

{{<highlight ts "hl_lines=7 19-34">}}
using Amazon.CDK;
using Amazon.CDK.AWS.CodeCommit;
using Amazon.CDK.AWS.CodePipeline;
using Amazon.CDK.AWS.CodePipeline.Actions;
using Amazon.CDK.Pipelines;
using Constructs;
using System.Collections.Generic;

namespace CdkWorkshop
{
    public class WorkshopPipelineStack : Stack
    {
        public WorkshopPipelineStack(Construct parent, string id, IStackProps props = null) : base(parent, id, props)
        {
            // PIPELINE CODE HERE...

            var deploy = new WorkshopPipelineStage(this, "Deploy");
            var deployStage = pipeline.AddStage(deploy);
            deployStage.AddPost(new ShellStep("TestViewerEndpoint", new ShellStepProps{
                EnvFromCfnOutputs = new Dictionary<string, CfnOutput> {
                    { "ENDPOINT_URL", /* TBD */ }
                },
                Commands = new string[] { "curl -Ssf $ENDPOINT_URL" }
            }));
            deployStage.AddPost(new ShellStep("TestAPIGatewayEndpoint", new ShellStepProps{
                EnvFromCfnOutputs = new Dictionary<string, CfnOutput> {
                    { "ENDPOINT_URL", /* TBD */ }
                },
                Commands = new string[] {
                    "curl -Ssf $ENDPOINT_URL/",
                    "curl -Ssf $ENDPOINT_URL/hello",
                    "curl -Ssf $ENDPOINT_URL/test"
                }
            }));
        }
    }
}
{{</highlight>}}

Adicionamos pasos post-implementación utilizando `deployStage.AddPost(...)` de Canalizaciones de CDK. Agregamos dos acciones a nuestra etapa de despliegue: para probar el punto de conexión de nuestro TableViewer y el punto de conexión de nuestro APIGateway, respectivamente.

> Nota: Enviamos varios requerimientos de `curl` al punto de conexión de APIGateway de tal forma que cuando accedamos a nuestro TableViewer, haya varios valores ya poblados.

Usted puede haber notado que aun no hemos asignado el valor de los URLs de estos puntos de conexión. Esto se debe a que aún no han sido expuestos a esta pila!

Con una pequeña modificación a `CdkWorkshop/PipelineStage.cs` los podemos exponer:

{{<highlight ts "hl_lines=9-10 15 17-18">}}
using Amazon.CDK;
using Amazon.CDK.Pipelines;
using Constructs;

namespace CdkWorkshop
{
    public class WorkshopPipelineStage : Stage
    {
        public readonly CfnOutput HCViewerUrl;
        public readonly CfnOutput HCEndpoint;

        public WorkshopPipelineStage(Construct scope, string id, StageProps props = null)
            : base(scope, id, props)
        {
            var service = new CdkWorkshopStack(this, "WebService");

            this.HCEndpoint = service.HCEndpoint;
            this.HCViewerUrl = service.HCViewerUrl;
        }
    }
}
{{</highlight>}}

Y ahora podemos agregar esos valores a nuestras acciones en `CdkWorkshop/PipelineStack.cs` obteniendo el `CfnOutput` de nuestra etapa de despliegue:
{{<highlight ts "hl_lines=5 11">}}
// CODE HERE...

deployStage.AddPost(new ShellStep("TestViewerEndpoint", new ShellStepProps{
    EnvFromCfnOutputs = new Dictionary<string, CfnOutput> {
        { "ENDPOINT_URL", deploy.HCViewerUrl }
    },
    Commands = new string[] { "curl -Ssf $ENDPOINT_URL" }
}));
deployStage.AddPost(new ShellStep("TestAPIGatewayEndpoint", new ShellStepProps{
    EnvFromCfnOutputs = new Dictionary<string, CfnOutput> {
        { "ENDPOINT_URL", deploy.HCEndpoint }
    },
    Commands = new string[] {
        "curl -Ssf $ENDPOINT_URL/",
        "curl -Ssf $ENDPOINT_URL/hello",
        "curl -Ssf $ENDPOINT_URL/test"
    }
}));
{{</highlight>}}

## Confirmar y Verificar!
Confirme estos cambios, espere a que la canalización haga el re-despliegue de la aplicación, navegue de nuevo a la [consola de CodePipeline](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) y allí usted podrá ver que hay dos acciones de prueba contenidas dentro de la etapa de despliegue (`Deploy`)!

![](./pipeline-tests.png)

Felicitaciones! Usted ha creado exitosamente una canalización de CD para su aplicación completa con pruebas y todo! Sientase libre de explorar la consola para ver los detalles de la pila creada, o dele un vistazo a la sección en la [Referencia del API](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html) acerca de Canalizaciones de CDK y construya una para su aplicación.
