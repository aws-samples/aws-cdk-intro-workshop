+++
title = "Adicionar una Aplicación a la Canalización"
weight = 140
+++

## Crear una Etapa
En este punto, usted tiene una canalización operativa completa de CDK que se actualiza automáticamente con cada confirmacióm, *PERO* por el momento, eso es todo lo que hace. Necesitamos adicionar una etapa a la canalización que despliegue nuestra aplicación.

Cree un nuevo archivo llamado `WorkshopPipelineStage.java` en el directorio `CdkWorkshop` con el siguiente código:

{{<highlight java>}}
package com.myorg;

import software.amazon.awscdk.Stage;
import software.constructs.Construct;
import software.amazon.awscdk.StageProps;

public class WorkshopPipelineStage extends Stage {
    public WorkshopPipelineStage(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public WorkshopPipelineStage(final Construct scope, final String id, final StageProps props) {
        super(scope, id, props);

        new CdkWorkshopStack(this, "WebService");
    }
}
{{</highlight>}}

Esto solamente declara una nueva etapa (`Stage`) (componente de una canalización), y en esa etapa crea una instancia de la pila de nuestra aplicación.

## Adicionar la etapa a la canalización
Ahora debemos adicionar la etapa a la canalización agregando el siguiento código a `cdk_workshop/pipeline_stack.py`:

{{<highlight java "hl_lines=43-44">}}
package com.myorg;

import java.util.List;
import java.util.Map;

import software.constructs.Construct;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.pipelines.CodeBuildStep;
import software.amazon.awscdk.pipelines.CodePipeline;
import software.amazon.awscdk.pipelines.CodePipelineSource;

import software.amazon.awscdk.services.codecommit.Repository;

public class WorkshopPipelineStack extends Stack {
    public WorkshopPipelineStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public WorkshopPipelineStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        // This creates a new CodeCommit repository called 'WorkshopRepo'
        final Repository repo = Repository.Builder.create(this, "WorkshopRepo")
            .repositoryName("WorkshopRepo")
            .build();

        // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
        final CodePipeline pipeline = CodePipeline.Builder.create(this, "Pipeline")
                .pipelineName("WorkshopPipeline")
                .synth(CodeBuildStep.Builder.create("SynthStep")
                        .input(CodePipelineSource.codeCommit(repo, "main"))
                        .installCommands(List.of(
                                "npm install -g aws-cdk"   // Commands to run before build
                        ))
                        .commands(List.of(
                                "mvn package",            // Language-specific build commands
                                "npx cdk synth"           // Synth command (always same)
                        )).build())
                .build();

        final WorkshopPipelineStage deploy = new WorkshopPipelineStage(this, "Deploy");
        pipeline.addStage(deploy);
    }
}
{{</highlight>}}

Esto importa y crea una instancia de `WorkshopPipelineStage`. Más tarde, usted podría instanciar esta etapa múltiples veces (por ejemplo, usted desea crear un despliegue de Producción y un despliegue de Desarrollo/Pruebas separados).

Luego agregamos esa etapa a nuestra canalización (`pipeline.addStage(deploy);`). Una etapa (`ApplicationStage`) en una canalización de CDK representa un juego de una o mas pilas de CDK que deben ser desplegadas juntas, a un ambiente particular.

## Confirmar/Desplegar
Ahora que hemos adicionado el código para desplegar nuestra aplicación, solo nos falta confirmar y enviar los cambios al repositorio.

```
git commit -am "Add deploy stage to pipeline" && git push
```

Una que que esto se ha hecho, podemos volver a la [consola de CodePipeline](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) y observar que la canalización está en ejecución (esto puede tomar algún tiempo).

![](./pipeline-succeed.png)

Éxito!
