+++
title = "Introducción a las Canalizaciones"
weight = 110
+++

> Nota: Esta sección del workshop asume que usted ha completado las secciones previas.  Si usted no lo ha hecho, y solamente quiere seguir esta sección, o si usted está retornando a intentar este workshop, usted puede utilizar el código [aquí](https://github.com/aws-samples/aws-cdk-intro-workshop/tree/master/code/java/main-workshop) que representa el último estado del proyecto después de adicionar las pruebas.

## Crear la Pila para la Canalización
El primer paso es crear la pila que contendrá nuestra canalización.
Teniendo en cuenta que esta pila es independiente de nuestra aplicación de "producción" real, queremos mantenerla completamente separada.

Cree un nuevo archivo llamado `WorkshopPipelineStack.java` bajo el directorio `src/main/java/com/myorg`. Adicione el siguiente código al archivo.

{{<highlight java>}}
package com.myorg;

import software.constructs.Construct;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;

public class WorkshopPipelineStack extends Stack {
    public WorkshopPipelineStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public WorkshopPipelineStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        // Pipeline code goes here
    }
}
{{</highlight>}}

Parece familiar? En este punto, la canalización es como cualquier otra pila de CDK.

## Actualizar el Punto de Entrada para el Despliegue de CDK
A continuación, ya que el propósito de nuestra canalización es desplegar la pila de nuestra aplicación, no necesitamos que la aplicación principal de CDK despliegue nuestra aplicación original. En su lugar, podemos cambiar el punto de entrada para que se despliegue nuestra canalización, que a su vez hará el despliegue de la aplicación.

Para hacer esto, edite el código en `src/main/java/com/myorg/CdkWorkshopApp.java` así:

{{<highlight java "hl_lines=9">}}
package com.myorg;

import software.amazon.awscdk.App;

public final class CdkWorkshopApp {
    public static void main(final String[] args) {
        App app = new App();

        new WorkshopPipelineStack(app, "PipelineStack");

        app.synth();
    }
}
{{</highlight>}}

Y ahora estamos listos!

# Construyamos una canalización!
