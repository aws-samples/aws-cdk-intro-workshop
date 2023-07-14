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

Usaremos `cdk init` para crear un nuevo proyecto de C# CDK:

```
cdk init sample-app --language csharp
```

El resultado debería tener este aspecto (puedes ignorar de forma segura las advertencias sobre la inicialización de un repositorio de git, esto probablemente signifique que no tienes git instalado, lo cual está bien para este workshop):

```
Applying project template sample-app for csharp
Project 'CdkWorkshop/CdkWorkshop.csproj' ajouté à la solution.
Initializing a new git repository...
# Welcome to your CDK C# project!

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CdkWorkshopStack`)
which contains an Amazon SNS topic that is subscribed to an Amazon SQS queue.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

It uses the [.NET Core CLI](https://docs.microsoft.com/dotnet/articles/core/) to compile and execute your project.

## Useful commands

* `dotnet build src` compile this app
* `cdk ls`           list all stacks in the app
* `cdk synth`        emits the synthesized CloudFormation template
* `cdk deploy`       deploy this stack to your default AWS account/region
* `cdk diff`         compare deployed stack with current state
* `cdk docs`         open CDK documentation

Enjoy!

```

Como puede ver, nos muestra un montón de comandos útiles para empezar.

## Ver También

- [AWS CDK Command Line Toolkit (cdk) in the AWS CDK User Guide](https://docs.aws.amazon.com/CDK/latest/userguide/tools.html)
