+++
title = "Crear el Repositorio"
weight = 120
+++

## Crear el Repositorio en la Pila de la Canalización
El primer paso en una buena canalización de CD es el control de código fuente. Aquí vamos a crear un repositorio de [**CodeCommit**](https://aws.amazon.com/codecommit/) para almacenar el código de nuestro proyecto.

Edite el archivo `cdk_workshop/pipeline_stack.py` así.

{{<highlight python "hl_lines=4 12-16">}}
from constructs import Construct
from aws_cdk import (
    Stack,
    aws_codecommit as codecommit,
)

class WorkshopPipelineStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Creates a CodeCommit repository called 'WorkshopRepo'
        repo = codecommit.Repository(
            self, 'WorkshopRepo',
            repository_name= "WorkshopRepo"
        )

        # Pipeline code goes here
{{</highlight>}}

## Despliegue

```
cdk deploy
```

## Obtener la Información del Repositorio y Confirmar
Antes que podamos hacer cualquier cosa con nuestro repositorio, necesitamos adicionar nuestro código a el!

### Credenciales de Git
Primero que todo, necesitamos las credenciales de Git para el repositorio. Para hacer esto, vaya a la [Consola de IAM](https://console.aws.amazon.com/iam), navegue a `Users` y luego al usuario que desee.
Dentro de la interfaz para el manejo del usuario, navegue al tab `Security credentials` y desplace la página hacia abajo hasta encontrar la sección "HTTPS Git credentials for AWS CodeCommit". Haga click en "Generate credentials" y siga las instrucciones para descargar las credenciales. Las necesitaremos en un momento.

![](./git-cred.png)

### Adicionar el repositorio remoto
Ahora debemos navegar a la [Consola de CodeCommit](https://console.aws.amazon.com/codesuite/codecommit/repositories) y buscar el repositorio. Alli deberá ver una columna llamada "Clone URL"; haga click en "HTTPS" para copiar el link https que podemos utilizar para adicionar al repositorio local.

> Nota: Si usted no ve el repositorio aquí, asegúrese que esta en la interfaz para la región correcta.

![](./clone-repo.png)

> Mientras usted esta aqui, sientase en libertad de explorar el repositorio. Usted podrá ver que aun está vacío, pero usted tiene acceso a la información de configuración del repositorio.

En la terminal, asegúrese primero que todos los cambios que se han hecho durante el workshop han sido confirmados ejecutando el comando `git status`. Si usted tiene cambios que no han sido preparados o confirmados, usted puede ejecutar `git commit -am "SOME_COMMIT_MESSAGE_HERE"`. Esto preparará y confirmará todos sus archivos de tal forma que usted estará listo para empezar!

> Nota: Si usted copió el código desde el repositorio en lugar de seguir a través del workshop desde el comienzo, ejecute primero`git init && git add -A && git commit -m "init"`

Ahora, adicionaremos el repositorio remoto a nuestra configuración de Git. Esto se hace con el comando (*XXXXX* representa el "Clone URL" que usted copió previamente de la consola):

```bash
git remote add origin XXXXX
```

Finalmente solo tenemos que enviar nuestro código al repositorio (`--set-upstream` le dice a Git que "anule" la rama actual -vacía- en su repositorio):

```bash
git push --set-upstream origin main
```

Aquí, CodeCommit le pedirá las credenciales generadas en la sección **Credenciales de Git**. Usted sólo debe proveerlas una vez.

> Nota: Si el comando `git push` no termina y queda en ejecución indefinidamente, es posible que usted deba seguir [estas instrucciones](https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-https-unixes.html) para configurar su CLI de git.

### Ver el Resultado
Ahora puede volver a la Consola de CodeCommit y ver que su código se encuentra allí!

![](./repo-code.png)
