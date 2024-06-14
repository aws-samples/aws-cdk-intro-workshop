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

Usaremos `cdk init` para crear un nuevo proyecto de Java CDK:

```
cdk init sample-app --language java
```

El resultado debería tener este aspecto (puedes ignorar de forma segura las advertencias sobre la inicialización de un repositorio de git, esto probablemente signifique que no tienes git instalado, lo cual está bien para este workshop):

```
Applying project template sample-app for java
# Welcome to your CDK Java project!

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CdkWorkshopStack`)
which contains an Amazon SNS topic that is subscribed to an Amazon SQS queue.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

It is a [Maven](https://maven.apache.org/) based project, so you can open this project with any Maven compatible Java IDE to build and run tests.

## Tutorial
See [this useful workshop](https://cdkworkshop.com/50-java.html) on working with the AWS CDK for Java projects.

## Useful commands

 * `mvn package`     compile and run tests
 * `cdk ls`          list all stacks in the app
 * `cdk synth`       emits the synthesized CloudFormation template
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk docs`        open CDK documentation

Enjoy!

Initializing a new git repository...
Executing 'mvn package'

✅ All done!
```

Como puede ver, nos muestra un montón de comandos útiles para empezar.

## Ver También

- [AWS CDK Command Line Toolkit (cdk) in the AWS CDK User Guide](https://docs.aws.amazon.com/CDK/latest/userguide/tools.html)
