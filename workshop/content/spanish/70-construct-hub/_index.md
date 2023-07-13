+++
title = "Construct Hub"
weight = 70
bookCollapseSection = true
+++

# Construct Hub

El [Construct Hub](https://constructs.dev/) es la localización dedicada para encontrar, reutilizar y compartir constructos creados por AWS, la [Red de Socios de AWS](https://aws.amazon.com/partners/), terceros, y la comunidad de desarrolladores. Este sitio actualmente lista los constructos para nuestros lenguajes de programación soportados Typescript, Java, Python, y .NET (con listados para Go muy pronto).  Los constructos de CDK son los bloques de construcción y patrones de arquitectura que usted puede utilizar para crear aplicaciones completamente listas para producción en la nube. Los constructos listados en el Construct Hub son creados utilizando el [Kit de Desarrollo en la Nube de AWS](https://aws.amazon.com/es/cdk/) (AWS CDK), [CDK para Kubernetes](https://cdk8s.io/) (CDK8s) y [CDK para Terraform](https://github.com/hashicorp/terraform-cdk) (CDKtf). Por favor revise los sitios/repositorios de cada producto para información más detallada acerca de cada una de estas bibliotecas de CDK.

Definimos [constructos](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html) como clases, que definen una “parte del estado de un sistema”. Los constructos pueden a su vez ser compuestos juntos para formar bloques de alto nivel que represenatn un estado más complejo. AWS, empresas, empresas nacientes, y desarrolladores individuales utilizan constructos de CDK para compartir patrones de arquitectura comprobados como biblotecas de código reutilizables, de tal forma que todos pueden beneficiarse del conocimiento colectivo de la comunidad.

Adicionalmente a los servicios en la nube ofrecidos por AWS, usted puede encontrar cientos de integraciones con proveedores de servicios en la nube y utilidades, productos y tecnologías como: Twitter, Slack, Grafana, Prometheus, Next.js, Gitlab y más.

El Construct Hub es la localización central donde los usuarios de CDK pueden encontrar una colección completa de constructos que les ayudarán a construir sus aplicaciones. El Construct Hub facilita a los desarrolladores encontrar los bloques de construcción de alto nivel que necesitan para construir sus aplicaciones al listar bibliotecas de constructos que han sido liberadas al público.

## Descubriendo y Utilizando Constructos

Navegue a https://constructs.dev y busque constructos basados en palabras clave tales como nombres de servicios de AWS que desea utilizar (por ejemplo, “eks”, “dynamodb”), el creador de la biblioteca (por ejemplo, “pahud”), o el tipo de CDK (por ejemplo, “cdktf”, “cdk8s”). Ejemplos de constructos que usted puede encontrar incluye datadog-cdk-constructs que hace la instrumentación de funciones Lambda para Python y Node.js Lambda con Datadog, cdk-gitlab-runner que crea un GitLab Runner y ejecuta un trabajo de canalización, cdk-k3s-cluster que hace el despliegue de un cluster de K3s, y muchos más. El website Construct Hub tambien incluye enlaces a recursos para obtener una Indrocucción. Aquí hay un ejemplo de el resultado de una búsqueda de constructos que incluyen la palabra clave "bucket" y soportan el lenguaje de programación "Python":

Las bibliotecas de constructos listadas en el Construct Hub incluyen una página de detalles con instrucciones sobre cómo instalar el paquete (click en "Use Construct") y una referencia del API que describe todas las clases, interfaces, enumeraciones, y tipos de datos en la biblioteca.  La referencia del API y los ejemplos de código son mostrados en el lengiaje de programación seleccionado y son automáticamente generados del tipo de información producido por el compilador jsii (jsii es un lenguaje de programación basado en Typescript para crear bibliotecas multi-lenguaje).

## Listar Constructos en el Hub

Para que su constructo sea listado en el Construct Hub, usted debe asegurarse que sea creado teniendo en cuenta los siguientes criterios:

- Ha sido publicado en el registro de [npmjs.com](https://npmjs.com/)
- Utiliza una de las siguientes licencias: _Apache, BSD, EPL, MPL-2.0, ISC y CDDL o MIT_
- Es anotado con una de las palabras clave soportadas (awscdk, cdk8s o cdktf)
- Es compilado con [jsii](https://aws.github.io/jsii/)

Como un editor de la biblioteca de constructos, usted puede mejorar la presentación de su biblioteca de constructos al:

- Agregar enlaces al código fuente del constructo y la documentación
- Incluir un archivo README con instrucciones de uso
- Agregar palabras clave relevantes que serán mostradas en la página del paquete y pueden ser utilizadas para búsquedas

Cada paquete es propiedad de su editor, asi que contribuciones, tales como reportes de bugs, deben ser hechas a través del enlace del repositorio provisto por el editor. Usted puede hacer click en el enlace 'Provide feedback' en la página del paquete para abrir un nuevo incidente en el repositorio del paquete.

Para información adicional y para enviar su pripio constructo, por favor revise nuestra [página de contribuciones](https://constructs.dev/contribute).

## Uso Interno

A usted podría interesarle usar una instancia del Construct Hub para propósitos internos para soportar el desarrollo de Propiedad Intelectial (PI) o para escalar mejores prácticas de CDK específicas a su organización.  Estamos desarrollando una [biblioteca](https://github.com/cdklabs/construct-hub) que le permita a cualquier persona hacer el despliegue de su propia instancia.  Por favor vea [Construct Hub Interno](/es/70-construct-hub/100-internal-construct-hub.html) para seguir un tutorial sobre cómo desplegar un Construct Hub interno en su propia cuenta de AWS.

{{% notice warning %}} Tenga en cuenta que la <a href="https://github.com/cdklabs/construct-hub" target="_blank">biblioteca de Construct Hub</a> está actualmente en desarrollo activo y debe ser considerada _experimental_.  Cualquier comentario o asistencia que usted nos pueda dar en ese repositorio sera apreciada!{{% /notice %}}
