+++
title = "Crear una Nueva Canalización"
weight = 130
+++

## Definir una Canalización Vacía
Ahora estamos listos para definir las bases de la canalización.

Edite el archivo `WorkshopPipelineStack.java` así:

{{<highlight java "hl_lines=9-11 30-44">}}
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

import software.amazon.awscdk.services.codepipeline.actions.CodeCommitSourceAction;

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
    }
}
{{</highlight>}}

### Descripción de los Componentes
El código anterior hace diferentes cosas:

* `CodePipeline.Builder.create(...)`: Esto inicializa la canalización con los valores requeridos. Esto servirá como el componente base de aquí en adelante. Cada canalización requiere como mínimo:
    * `synth(...)`: El `synthAction` de la canalización describe los comandos necesarios para instalar dependencias, construir, y sintetizar la aplicación CDK desde el código fuente. Esto siempre debe terminar en un comando *synth*, para proyectos basados en NPM esto siempre es `npx cdk synth`. 
      * El `input` del paso synth especifica el repositorio donde el codigo fuente de CDK está almacenado.

## Desplegar la Canalización y Ver el Resultado
Tolo lo que falta para poner en marcha nuestra canalización es confirmar nuestros cambios y hacer el despliegue una última vez.

```
git commit -am "MESSAGE" && git push
mvn package
npx cdk deploy
```

CdkPipelines actualiza automáticamente cada vez que se hace una confirmación a un repositorio, así que esta es la *última vez* que necesitaremos ejecutar este comando!

Una vez que el despliegue haya finalizado, usted puede ir a la [consola de CodePipeline](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) y allí podrá ver una nueva canalización! Si lo hace, debería ver algo así:

![](./pipeline-init.png)
