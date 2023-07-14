+++
title = "Adicionar una Aplicación a la Canalización"
weight = 140
+++

## Crear una Etapa
En este punto, usted tiene una canalización operativa completa de CDK que se actualiza automáticamente con cada confirmacióm, *PERO* por el momento, eso es todo lo que hace. Necesitamos adicionar una etapa a la canalización que despliegue nuestra aplicación.

Cree un nuevo archivo llamado `pipeline_stage.py` en el directorio `cdk_workshop` con el siguiente código:

```python
from constructs import Construct
from aws_cdk import (
    Stage
)
from .cdk_workshop_stack import CdkWorkshopStack

class WorkshopPipelineStage(Stage):

    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        service = CdkWorkshopStack(self, 'WebService')

```

Esto solamente declara una nueva etapa (`core.Stage`) (componente de una canalización), y en esa etapa crea una instancia de la pila de nuestra aplicación.

## Adicionar la pila a la canalización
Ahora debemos adicionar la etapa a la canalización agregando el siguiento código a `cdk_workshop/pipeline_stack.py`:

{{<highlight python "hl_lines=7 32-33">}}
from constructs import Construct
from aws_cdk import (
    Stack,
    aws_codecommit as codecommit,
    pipelines as pipelines,
)
from cdk_workshop.pipeline_stage import WorkshopPipelineStage

class WorkshopPipelineStack(Stack):
    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Creates a CodeCommit repository called 'WorkshopRepo'
        repo = codecommit.Repository(
            self, "WorkshopRepo", repository_name="WorkshopRepo"
        )

        pipeline = pipelines.CodePipeline(
            self,
            "Pipeline",
            synth=pipelines.ShellStep(
                "Synth",
                input=pipelines.CodePipelineSource.code_commit(repo, "main"),
                commands=[
                    "npm install -g aws-cdk",  # Installs the cdk cli on Codebuild
                    "pip install -r requirements.txt",  # Instructs Codebuild to install required packages
                    "npx cdk synth",
                ]
            ),
        )

        deploy = WorkshopPipelineStage(self, "Deploy")
        deploy_stage = pipeline.add_stage(deploy)
{{</highlight>}}

Esto importa y crea una instancia de `WorkshopPipelineStage`. Más tarde, usted podría instanciar esta etapa múltiples veces (por ejemplo, usted desea crear un despliegue de Producción y un despliegue de Desarrollo/Pruebas separados).

Luego agregamos esa etapa a nuestra canalización (`pipeline.add_stage(deploy);`). Una etapa (`Stage`) en una canalización de CDK representa un juego de una o mas pilas de CDK que deben ser desplegadas juntas, a un ambiente particular.

## Confirmar/Desplegar
Ahora que hemos adicionado el código para desplegar nuestra aplicación, solo nos falta confirmar y enviar los cambios al repositorio.

```
git add .
git commit -m "Add deploy stage to pipeline" && git push
```

Una que que esto se ha hecho, podemos volver a la [consola de CodePipeline](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) y observar que la canalización está en ejecución (esto puede tomar algún tiempo).

![](./pipeline-succeed.png)

Éxito!
