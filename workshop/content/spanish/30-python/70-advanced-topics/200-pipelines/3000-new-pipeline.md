+++
title = "Crear una Nueva Canalización"
weight = 130
+++

## Definir una Canalización Vacía
Ahora estamos listos para definir las bases de la canalización.

Edite el archivo `pipeline_stack.py` así:

{{<highlight python "hl_lines=5 17-29">}}
from constructs import Construct
from aws_cdk import (
    Stack,
    aws_codecommit as codecommit,
    pipelines as pipelines,
)

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
                    "cdk synth",
                ]
            ),
        )
{{</highlight>}}

### Descripción de los Componentes
El código anterior hace diferentes cosas:

* `pipelines.CodePipeline(...)`: Esto inicializa la canalización con los valores requeridos. Esto servirá como el componente base de aquí en adelante. Cada canalización requiere como mínimo:
    * `pipelines.ShellStep(...)`: El `synth` de la canalización describe los comandos necesarios para instalar dependencias, construir, y sintetizar la aplicación CDK desde el código fuente. Esto siempre debe terminar en un comando *synth*, para proyectos basados en NPM esto siempre es `npx cdk synth`.
      * El `input` del paso synth especifica el repositorio donde el codigo fuente de CDK está almacenado.

## Desplegar la Canalización y Ver el Resultado
Tolo lo que falta para poner en marcha nuestra canalización es confirmar nuestros cambios y hacer el despliegue una última vez.

```bash
git add .
git commit -m "MESSAGE" && git push
cdk deploy
```

CdkPipelines actualiza automáticamente cada vez que se hace una confirmación a un repositorio, así que esta es la *última vez* que necesitaremos ejecutar este comando!

Una vez que el despliegue haya finalizado, usted puede ir a la [consola de CodePipeline](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) y allí podrá ver una nueva canalización! Si lo hace, debería ver algo así:

![](./pipeline-init.png)
