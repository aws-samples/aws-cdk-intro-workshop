+++
title = "Create el Construct Hub Interno"
weight = 200
+++

## Crear la Infraestructura para el Construct Hub Interno

{{% notice warning %}}Tenga en cuenta que la interfaz web del Construct Hub se entrega a través de una distribución de CloudFront de acceso público. Restringir el acceso a usuarios y grupos específicos está fuera del alcance de este workshop. Sin embargo, usted puede considerar las siguientes mejores prácticas para implementarlo:

- Utilice URLs o cookies firmadas para permitir el acceso temporal al contenido en su distribución de CloudFront.
- Utilice el Web Application Firewall (WAF) de AWS para proteger su distribución de CloudFront de ataques comunes de web y tráfico no deseado. Usted puede crear reglas personalizadas para bloquear o permitir acceso basado en criterios específicos, tales como direcciones IP, agentes de usuario, o localizaciones geográficas.
- Utilice Lambda@Edge para agregar lógica personalizada a su distribución de CloudFront. Usted puede utilizar Lambda@Edge para hacer chequeos de autorización y permitir o denegar acceso a su contenido basado en criterios específicos.
- Para acceso dentro de una Intranet o redes privadas, deshabilite su distribución de CloudFront y habilite el acceso al bucket S3 origen a través de un Application Load Balancer interno utilizando un punto de enlace en PrivateLink de AWS para Amazon S3.
{{% /notice %}}

## Crear la Pila para el Construct Hub Interno

Como un Administrador del Construct Hub Interno, el primer paso es crear una instancia del Construct Hub en una cuenta de AWS. Antes que podamos usar la biblioteca del Construct Hub en nuestra pila, necesitamos instalar el módulo npm en nuestro proyecto:

{{<highlight bash>}}
npm install construct-hub
{{</highlight>}}

Por defecto, el Construct Hub tiene un solo paquete fuente configurado, que es el registro público npmjs.com. Sin embargo, también soporta repositorios de CodeArtifact e implementaciones de fuentes de paquetes personalizados. Para nuestro propósito, crearemos un dominio de CodeArtifact y un repositorio para adicionar como una fuente de paquetes para nuestro Construct Hub Interno.

Edite el archivo bajo `lib/internal-construct-hub-stack.ts` y use el siguiente código:

{{<highlight typescript>}}
import * as cdk from 'aws-cdk-lib';
import * as codeartifact from 'aws-cdk-lib/aws-codeartifact';
import { ConstructHub } from 'construct-hub';
import * as sources from 'construct-hub/lib/package-sources';
import { Construct } from 'constructs';

export class InternalConstructHubStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a CodeArtifact domain and repo for user construct packages
    const domain = new codeartifact.CfnDomain(this, 'CodeArtifactDomain', {
      domainName: 'cdkworkshop-domain',
    });

    const repo = new codeartifact.CfnRepository(this, 'CodeArtifactRepository', {
      domainName: domain.domainName,
      repositoryName: 'cdkworkshop-repository',
    });

    repo.addDependency(domain);

    // Create internal instance of ConstructHub, register the new CodeArtifact repo
    new ConstructHub(this, 'ConstructHub', {
      packageSources: [
        new sources.CodeArtifact({ repository: repo })
      ],
    });
  }
}
{{</highlight>}}

## Inicializar un Ambiente
La primera vez que usted hace un despliegue de una aplicación de CDK en un ambiente (cuenta/región) de AWS usted puede instalar un "bootstrap stack".  Esta pila incluye recursos que son utilizados en la operación de la herramienta. Por ejemplo, la pila incluye un bucket de S3 que es utilizado para almacenar las plantillas y _assets_ durante el proceso de despliegue.

Usted puede utilizar el comando `cdk bootstrap` para crear esta pila en su cuenta de AWS:

{{<highlight bash>}}
cdk bootstrap
{{</highlight>}}

Usted debería ver una salida similar a esta:
{{<highlight bash>}}
Environment aws://[account-id]/[region] bootstrapped
{{</highlight>}}

## Desplegar
Utilice `cdk deploy` para desplegar la aplicación de CDK:

{{<highlight bash>}}
cdk deploy
{{</highlight>}}

{{% notice info %}} Desplegar el Construct Hub Interno por primera vez puede tomar ~10-12 minutos. Usted puede tomar un descanso o continuar con las secciones de la Biblioteca de Constructos del workshop {{% /notice %}}

