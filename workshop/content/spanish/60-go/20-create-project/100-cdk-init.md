+++
title = "cdk init"
weight = 100
+++

## Crear directorio de proyectos

Cree un directorio vacío en su sistema:

```
mkdir cdk-workshop && cd cdk-workshop
```

## cdk init

Usaremos `cdk init` para crear un nuevo proyecto de Go CDK:

```
cdk init sample-app --language go
```

El resultado debería tener este aspecto (puedes ignorar de forma segura las advertencias sobre la inicialización de un repositorio de git, esto probablemente signifique que no tienes git instalado, lo cual está bien para este workshop):

```
Applying project template sample-app for go
# Welcome to your CDK Go project!

This is a blank project for Go development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
 * `go test`         run unit tests

Initializing a new git repository...
✅ All done!
```

Como puede ver, nos muestra un montón de comandos útiles para empezar.

## Ver También

- [AWS CDK Command Line Toolkit (cdk) in the AWS CDK User Guide](https://docs.aws.amazon.com/CDK/latest/userguide/tools.html)
