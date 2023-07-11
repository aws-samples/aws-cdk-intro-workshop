+++
title = "Adicionar una Aplicación a la Canalización"
weight = 4000
+++

## Crear una Etapa
En este punto, usted tiene una canalización operativa completa de CDK que se actualiza automáticamente con cada confirmacióm, *PERO* por el momento, eso es todo lo que hace. Necesitamos adicionar una etapa a la canalización que despliegue nuestra aplicación.

Cree un nuevo archivo llamado `PipelineStage.cs` en el directorio `CdkWorkshop` con el siguiente código:

{{<highlight ts>}}
using Amazon.CDK;
using Amazon.CDK.Pipelines;
using Constructs;

namespace CdkWorkshop
{
    public class WorkshopPipelineStage : Stage
    {
        public WorkshopPipelineStage(Construct scope, string id, StageProps props = null)
            : base(scope, id, props)
        {
            var service = new CdkWorkshopStack(this, "WebService");
        }
    }
}
{{</highlight>}}

Esto solamente declara una nueva etapa (`Stage`) (componente de una canalización), y en esa etapa crea una instancia de la pila de nuestra aplicación.

## Adicionar la pila a la canalización
Ahora debemos adicionar la etapa a la canalización agregando el siguiento código a `CdkWorkshop/PipelineStack.cs`:

{{<highlight ts "hl_lines=39-40">}}
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
            // Creates a CodeCommit repository called 'WorkshopRepo'
            var repo = new Repository(this, "WorkshopRepo", new RepositoryProps
            {
                RepositoryName = "WorkshopRepo"
            });

            // The basic pipeline declaration. This sets the initial structure
            // of our pipeline
            var pipeline = new CodePipeline(this, "Pipeline", new CodePipelineProps
            {
                PipelineName = "WorkshopPipeline",

                // Builds our source code outlined above into a cloud assembly artifact
                Synth = new ShellStep("Synth", new ShellStepProps{
                    Input = CodePipelineSource.CodeCommit(repo, "main"),  // Where to get source code to build
                    Commands = new string[] {
                        "npm install -g aws-cdk",
                        "sudo apt-get install -y dotnet-sdk-3.1",  // Language-specific install cmd
                        "dotnet build",  // Language-specific build cmd
                        "npx cdk synth"
                    }
                }),
            });

            var deploy = new WorkshopPipelineStage(this, "Deploy");
            var deployStage = pipeline.AddStage(deploy);
        }
    }
}
{{</highlight>}}

Esto importa y crea una instancia de `WorkshopPipelineStage`. Más tarde, usted podría instanciar esta etapa múltiples veces (por ejemplo, usted desea crear un despliegue de Producción y un despliegue de Desarrollo/Pruebas separados).

Luego agregamos esa etapa a nuestra canalización (`pipeline.AddStage(deploy);`). Una etapa (`Stage`) en una canalización de CDK representa un juego de una o más pilas de CDK que deben ser desplegadas juntas, a un ambiente particular.

## Confirmar/Desplegar
Ahora que hemos adicionado el código para desplegar nuestra aplicación, solo nos falta confirmar y enviar los cambios al repositorio.

```
git commit -am "Add deploy stage to pipeline" && git push
```

Una que que esto se ha hecho, podemos volver a la [consola de CodePipeline](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) y observar que la canalización está en ejecución (esto puede tomar algún tiempo).

![](./pipeline-succeed.png)

Éxito!
