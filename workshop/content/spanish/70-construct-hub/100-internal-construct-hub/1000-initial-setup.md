+++
title = "Configuración Inicial"
weight = 100
+++

## Configuración Inicial

{{% notice warning %}}
Antes de comenzar, asegurese que ha seguido los pasos en la sección de [Prerequisitos](/es/15-prerequisites.html).

Adicionalmente usted debe tener <a href="https://docs.docker.com/get-docker/" target="_blank">Docker</a> en ejecución y <a href="https://yarnpkg.com/getting-started/install" target="_blank">Yarn</a> instalado en su ambiente de desarrollo para completar este tutorial.
{{% /notice %}}

## Crear el Directorio Principal y el Directorio del Proyecto

### Directorio Principal 
Crearemos el directorio principal que contendrá todo el código para este workshop:

{{<highlight bash>}}
mkdir construct-hub-workshop && cd construct-hub-workshop
{{</highlight>}}

### Directorio del Proyecto
A continuación crearemos el directorio del proyecto para el constructo "real" del Construct Hub que desplegaremos en nuestra cuenta de AWS:

{{<highlight bash>}}
mkdir internal-construct-hub && cd internal-construct-hub
{{</highlight>}}

## Crear un Nuevo Proyecto de CDK utilizando TypeScript

Utilizaremos `cdk init` para crear un proyecto de CDK utilizando TypeScript:

{{<highlight bash>}}
cdk init app --language typescript
{{</highlight>}}
