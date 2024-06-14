+++
title = "Introducción a las Canalizaciones"
weight = 110
+++

> Nota: Esta sección del workshop asume que usted ha completado las secciones previas.  Si usted no lo ha hecho, y solamente quiere seguir esta sección, o si usted está retornando a intentar este workshop, usted puede utilizar el código [aquí](https://github.com/aws-samples/aws-cdk-intro-workshop/tree/master/code/python/main-workshop) que representa el último estado del proyecto después de adicionar las pruebas.

## Crear la Pila para la Canalización
El primer paso es crear la pila que contendrá nuestra canalización.
Teniendo en cuenta que esta pila es independiente de nuestra aplicación de "producción" real, queremos mantenerla completamente separada.

Cree un nuevo archivo llamado `pipeline_stack.py` bajo el directorio `cdk_workshop`. Adicione el siguiente código al archivo.

```python
from constructs import Construct
from aws_cdk import (
    Stack
)

class WorkshopPipelineStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Pipeline code will go here
```
Parece familiar? En este punto, la canalización es como cualquier otra pila de CDK.

## Actualizar el Punto de Entrada para el Despliegue de CDK
A continuación, ya que el propósito de nuestra canalización es desplegar la pila de nuestra aplicación, no necesitamos que la aplicación principal de CDK despliegue nuestra aplicación original. En su lugar, podemos cambiar el punto de entrada para que se despliegue nuestra canalización, que a su vez hará el despliegue de la aplicación.

Para hacer esto, edite el código en `app.py` así:

{{<highlight python "hl_lines=4 7">}}
#!/usr/bin/env python3

import aws_cdk as cdk
from cdk_workshop.pipeline_stack import WorkshopPipelineStack

app = cdk.App()
WorkshopPipelineStack(app, "WorkshopPipelineStack")

app.synth()
{{</highlight>}}

Eso le dice a CDK que utilice estas nuevas características cada vez que sintetice una pila (`cdk synth`).

Y ahora estamos listos!

# Construyamos una canalización!
