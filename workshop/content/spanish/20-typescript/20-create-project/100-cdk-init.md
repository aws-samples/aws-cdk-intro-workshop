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

Usaremos `cdk init` para crear un nuevo proyecto de TypeScript CDK:

```
cdk init sample-app --language typescript
```

El resultado debería tener este aspecto (puedes ignorar de forma segura las advertencias sobre la inicialización de un repositorio de git, esto probablemente signifique que no tienes git instalado, lo cual está bien para este workshop):

```
Applying project template app for typescript
Initializing a new git repository...
Executing npm install...
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN tst@0.1.0 No repository field.
npm WARN tst@0.1.0 No license field.

# Welcome to your CDK TypeScript project!

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CdkWorkshopStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
```

Como puede ver, nos muestra un montón de comandos útiles para empezar.

## Ver También

- [AWS CDK Command Line Toolkit (cdk) in the AWS CDK User Guide](https://docs.aws.amazon.com/CDK/latest/userguide/tools.html)
