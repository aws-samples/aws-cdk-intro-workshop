+++
title = "Canalizaciones de CDK"
weight = 100
bookCollapseSection = true
+++

# Canalizaciones de CDK

En este capítulo crearemos una canalización para una Implementación Continua (CD) de la aplicación desarrollada en los capítulos anteriores.

CD es un componente importante para la mayoría de los proyectos web, pero puede ser un proceso complicado de configurar teniendo en cuenta todas las partes móviles requeridas. El constructo para [Canalizaciones de CDK](https://docs.aws.amazon.com/cdk/latest/guide/cdk_pipeline.html) hace que este proceso sea fácil y optimizado dentro de su infraestructura existente de CDK.

Estas canalizaciones consisten en "etapas" que representan las fases del proceso de implementaciòn desde como el código fuente es manejado, hasta como los artefactos completamente construidos son desplegados.

![](./pipeline-stages.png)
