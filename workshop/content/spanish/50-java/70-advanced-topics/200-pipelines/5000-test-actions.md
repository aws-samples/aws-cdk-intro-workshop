+++
title = "Mejorar la Canalización"
weight = 150
+++

## Obtener Puntos de Conexión
Observando detenidamente, podemos ver que hay un problema ahora que la aplicación esta siendo desplegada por nuestra canalización. No hay una manera fácil de encontrar los puntos de conexión de nuestra aplicación (para `TableViewer` y `APIGateway`), así que no podemos acceder a ellos! Agreguemos un poco de código que nos permita exponerlos de una manera más obvia.

Primero editemos `CdkWorkshopStack.java` para obtener estos valores y exponerlos como propiedades de nuestra pila:

{{<highlight java "hl_lines=8 17-18 50-56">}}
package com.myorg;

import io.github.cdklabs.dynamotableviewer.TableViewer;

import software.constructs.Construct;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.CfnOutput;

import software.amazon.awscdk.services.apigateway.LambdaRestApi;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;

public class CdkWorkshopStack extends Stack {

    public final CfnOutput hcViewerUrl;
    public final CfnOutput hcEndpoint;

    public CdkWorkshopStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public CdkWorkshopStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        // Defines a new lambda resource
        final Function hello = Function.Builder.create(this, "HelloHandler")
            .runtime(Runtime.NODEJS_14_X)    // execution environment
            .code(Code.fromAsset("lambda"))  // code loaded from the "lambda" directory
            .handler("hello.handler")        // file is "hello", function is "handler"
            .build();

        // Defines our hitcounter resource
        final HitCounter helloWithCounter = new HitCounter(this, "HelloHitCounter", HitCounterProps.builder()
            .downstream(hello)
            .build());

        // Defines an API Gateway REST API resource backed by our "hello" function
        final LambdaRestApi gateway = LambdaRestApi.Builder.create(this, "Endpoint")
            .handler(helloWithCounter.getHandler())
            .build();

        // Defines a viewer for the HitCounts table
        final TableViewer tv = TableViewer.Builder.create(this, "ViewerHitCount")
            .title("Hello Hits")
            .table(helloWithCounter.getTable())
            .build();

        hcViewerUrl = CfnOutput.Builder.create(this, "TableViewerUrl")
            .value(tv.getEndpoint())
            .build();

        hcEndpoint = CfnOutput.Builder.create(this, "GatewayUrl")
            .value(gateway.getUrl())
            .build();
    }
}

{{</highlight>}}

Al agregar las salidas `hcViewerUrl` y `hcEndpoint`, estamos exponiendo los puntos de conexión necesarios para nuestra aplicación HitCounter. Estamos utilizando el constructo básico `CfnOutput` para declarar estas salidas como salidas de la pila de CloudFormation (explicaremos mas detalles en un minuto).

Confirmemos estos cambios a nuestro repositorio (`git commit -am "MESSAGE" && git push`), y naveguemos a la [consola de CloudFormation](https://console.aws.amazon.com/cloudformation). Allí usted puede ver que hay tres pilas.

* `CDKToolkit`: La primera es la pila integrada de CDK (ustede debe ver esta pila en todas las cuentas en donde haya configurado CDK). Puede ignorar esta pila.
* `WorkshopPipelineStack`: Esta es la pila que declara nuestra canalización. No es realmente la que necesitamos ahora.
* `Deploy-WebService`: Aquí está nuestra aplicación! Seleccione esta pila, y bajo sus detalles, seleccione el tab `Outputs`. Aquí ustede debe encontrar cuatro puntos de conexión (dos pares de valores duplicados).  Dos de ellos, `EndpointXXXXXX` y `ViewerHitCounterViewerEndpointXXXXXXX`, son los generados por Cloudformation, y los otros dos son los que nosotros mismos generamos.

![](./stack-outputs.png)

Si usted hace click en `TableViewerUrl`, usted debería ver nuestra bella tabla contadora de hits que creamos durante el workshop inicial.

## Adicionar una Prueba de Validación
Ahora ya hemos desplegado nuestra aplicación, pero una canalización de CD no es completa sin pruebas!

Comencemos con una simple prueba que le haga ping a nuestros puntos de conexión para confirmar que están vivos.
Volvamos a `WorkshopPipelineStack.java` y agreguemos lo siguiente:

{{<highlight java "hl_lines=12 29-45">}}
package com.myorg;

import java.util.List;
import java.util.Map;

import software.constructs.Construct;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.pipelines.CodeBuildStep;
import software.amazon.awscdk.pipelines.CodePipeline;
import software.amazon.awscdk.pipelines.CodePipelineSource;
import software.amazon.awscdk.pipelines.StageDeployment;
import software.amazon.awscdk.services.codecommit.Repository;
import software.amazon.awscdk.services.codepipeline.actions.CodeCommitSourceAction;

public class WorkshopPipelineStack extends Stack {
    public WorkshopPipelineStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public WorkshopPipelineStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        // PIPELINE CODE HERE

        final WorkshopPipelineStage deploy = new WorkshopPipelineStage(this, "Deploy");
        StageDeployment stageDeployment = pipeline.addStage(deploy);

        stageDeployment.addPost(
                CodeBuildStep.Builder.create("TestViewerEndpoint")
                        .projectName("TestViewerEndpoint")
                        .commands(List.of("curl -Ssf $ENDPOINT_URL"))
                        .envFromCfnOutputs(Map.of("ENDPOINT_URL",  /* TBD */))
                        .build(),

                CodeBuildStep.Builder.create("TestAPIGatewayEndpoint")
                        .projectName("TestAPIGatewayEndpoint")
                        .envFromCfnOutputs(Map.of("ENDPOINT_URL",  /* TBD */))
                        .commands(List.of(
                                "curl -Ssf $ENDPOINT_URL",
                                "curl -Ssf $ENDPOINT_URL/hello",
                                "curl -Ssf $ENDPOINT_URL/test"
                        ))
                        .build()
        );
    }
}
{{</highlight>}}

Adicionamos pasos post-implementación utilizando `stageDeployment.AddPost(...)` de Canalizaciones de CDK. Agregamos dos acciones a nuestra etapa de despliegue: para probar el punto de conexión de nuestro TableViewer y el punto de conexión de nuestro APIGateway, respectivamente.

> Nota: Enviamos varios requerimientos de `curl` al punto de conexión de APIGateway de tal forma que cuando accedamos a nuestro TableViewer, haya varios valores ya poblados.

Usted puede haber notado que aun no hemos asignado el valor de los URLs de estos puntos de conexión. Esto se debe a que aún no han sido expuestos a esta pila!

Con una pequeña modificación a `WorkshopPipelineStage.java` los podemos exponer:

{{<highlight java "hl_lines=6 10-11 20 22-23">}}
package com.myorg;

import software.amazon.awscdk.Stage;
import software.constructs.Construct;
import software.amazon.awscdk.StageProps;
import software.amazon.awscdk.CfnOutput;

public class WorkshopPipelineStage extends Stage {

    public final CfnOutput hcViewerUrl;
    public final CfnOutput hcEndpoint;

    public WorkshopPipelineStage(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public WorkshopPipelineStage(final Construct scope, final String id, final StageProps props) {
        super(scope, id, props);

        final CdkWorkshopStack service = new CdkWorkshopStack(this, "WebService");

        hcViewerUrl = service.hcViewerUrl;
        hcEndpoint = service.hcEndpoint;
    }
}
{{</highlight>}}

Y ahora podemos agregar esos valores a nuestras acciones en `cdk_workshop/pipeline_stack.py` obteniendo el `cfn_output` de nuestra etapa de despliegue:
{{<highlight java "hl_lines=9 14">}}
        // OTHER CODE HERE...
        final WorkshopPipelineStage deploy = new WorkshopPipelineStage(this, "Deploy");
        StageDeployment stageDeployment = pipeline.addStage(deploy);

        stageDeployment.addPost(
                CodeBuildStep.Builder.create("TestViewerEndpoint")
                        .projectName("TestViewerEndpoint")
                        .commands(List.of("curl -Ssf $ENDPOINT_URL"))
                        .envFromCfnOutputs(Map.of("ENDPOINT_URL",  deploy.hcViewerUrl))
                        .build(),

                CodeBuildStep.Builder.create("TestAPIGatewayEndpoint")
                        .projectName("TestAPIGatewayEndpoint")
                        .envFromCfnOutputs(Map.of("ENDPOINT_URL",  deploy.hcEndpoint))
                        .commands(List.of(
                                "curl -Ssf $ENDPOINT_URL",
                                "curl -Ssf $ENDPOINT_URL/hello",
                                "curl -Ssf $ENDPOINT_URL/test"
                        ))
                        .build()
{{</highlight>}}

## Confirmar y Verificar!
Confirme estos cambios, espere a que la canalización haga el re-despliegue de la aplicación, navegue de nuevo a la [consola de CodePipeline](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) y allí usted podrá ver que hay dos acciones de prueba contenidas dentro de la etapa de despliegue (`Deploy`)!

![](./pipeline-tests.png)

Felicitaciones! Usted ha creado exitosamente una canalización de CD para su aplicación completa con pruebas y todo! Sientase libre de explorar la consola para ver los detalles de la pila creada, o dele un vistazo a la sección en la [Referencia del API](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html) acerca de Canalizaciones de CDK y construya una para su aplicación.