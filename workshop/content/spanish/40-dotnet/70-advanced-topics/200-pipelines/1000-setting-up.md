+++
title = "Introducción a las Canalizaciones"
weight = 1000
+++

> Nota: Esta sección del workshop asume que usted ha completado las secciones previas.  Si usted no lo ha hecho, y solamente quiere seguir esta sección, o si usted está retornando a intentar este workshop, usted puede utilizar el código [aquí](https://github.com/aws-samples/aws-cdk-intro-workshop/tree/master/code/csharp/main-workshop) que representa el último estado del proyecto después de adicionar las pruebas.

## Crear la Pila para la Canalización
El primer paso es crear la pila que contendrá nuestra canalización.
Teniendo en cuenta que esta pila es independiente de nuestra aplicación de "producción" real, queremos mantenerla completamente separada.

Cree un nuevo archivo llamado `PipelineStack.cs` bajo el directorio `src/CdkWorkshop`. Adicione el siguiente código al archivo.

{{<highlight ts>}}
using Amazon.CDK;
using Constructs;

namespace CdkWorkshop
{
    public class WorkshopPipelineStack : Stack
    {
        public WorkshopPipelineStack(Construct parent, string id, IStackProps props = null) : base(parent, id, props)
        {
            // Pipeline code goes here
        }
    }
}
{{</highlight>}}

Parece familiar? En este punto, la canalización es como cualquier otra pila de CDK.

## Actualizar el Punto de Entrada para el Despliegue de CDK
A continuación, ya que el propósito de nuestra canalización es desplegar la pila de nuestra aplicación, no necesitamos que la aplicación principal de CDK despliegue nuestra aplicación original. En su lugar, podemos cambiar el punto de entrada para que se despliegue nuestra canalización, que a su vez hará el despliegue de la aplicación.

Para hacer esto, edite el código en `CdkWorkshop/Program.cs` así:

{{<highlight ts "hl_lines=10">}}
using Amazon.CDK;

namespace CdkWorkshop
{
    class Program
    {
        static void Main(string[] args)
        {
            var app = new App();
            new WorkshopPipelineStack(app, "WorkshopPipelineStack");

            app.Synth();
        }
    }
}

{{</highlight>}}

Y ahora estamos listos!

# Construyamos una canalización!
