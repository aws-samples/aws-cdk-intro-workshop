+++
title = "Limpieza"
weight = 700
+++

## Limpieza

Es hora de limpiar los recursos creados en este workshop:

### Borrar el Repositorio de CodeCommit

Navegue a <a href="https://console.aws.amazon.com/codecommit" target="_blank">CodeCommit</a> y borre el repositorio `construct-lib-repo`.

### Borrar la Tabla de DynamoDB

Ahora navegue a <a href="https://console.aws.amazon.com/dynamodb" target="_blank">DynamoDB</a> borre la tabla `HelloCdkAppStack-HelloHitCounterHitsXXXXXXXX-XXXXXXXXXXXX`.

### Remover y Borrar los Repositorios Ascendentes de CodeArtifact

Ejecute este comando para desasociar todos los repositorios ascendentes del dominio de CodeArtifact:

{{<highlight bash>}}
aws codeartifact update-repository --repository cdkworkshop-repository --domain cdkworkshop-domain --upstreams --region [Insert Region]
{{</highlight>}}

Luego ejecute este comando para borrar el repositorio ascendente (npm-store):

{{<highlight bash>}}
aws codeartifact delete-repository --domain cdkworkshop-domain --repository npm-store --region [Insert Region]
{{</highlight>}}

### Restablecer el Registro de NPM

{{<highlight bash>}}
npm config set registry https://registry.npmjs.com/
{{</highlight>}}

### Borrar las Pilas de Cloudformation

Para limpiar los recursos creados en esta sección del workshop, navegue a <a href="https://console.aws.amazon.com/cloudformation" target="_blank">CloudFormation</a> y borre las pilas llamadas `InternalConstructHubStack`, `InternalConstructPipelineStack`, y `HelloCdkAppStack`.

### Borrar los Buckets de S3

Navegue a <a href="https://console.aws.amazon.com/s3" target="_blank">S3</a> y borre los buckets (~11 de ellos) cuyos nombres comienzan con `internalconstruct`.  Algunos necesitan ser desocupados antes de ser borrados. Vea la documentación sobre como <a href="https://docs.aws.amazon.com/es_es/AmazonS3/latest/userguide/delete-bucket.html" target="_blank">Eliminar un bucket</a> para más información. 

### Borrar el Directorio construct-hub-workshop

En su máquina, borre el directorio `construct-hub-workshop`.