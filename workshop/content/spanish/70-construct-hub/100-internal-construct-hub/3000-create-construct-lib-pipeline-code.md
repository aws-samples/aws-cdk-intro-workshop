+++
title = "Crear la Biblioteca de Constructos - Código de la Canalización"
weight = 300
+++

## Crear la Biblioteca de Constructos - Canalización

A continuación, haremos la configuración de la infraestructura que hará el despliegue de la biblioteca de contructos en nuestro Construct Hub Interno.  Ya que esto es independiente de la infraestructura del "Construct Hub Interno" que se hizo en el paso anterior, queremos que este código este en su propio directorio. En su terminal, asegurese que se encuentra en el directorio `construct-hub-workshop`.

Navegue a <a href="https://console.aws.amazon.com/codecommit" target="_blank">CodeCommit</a> y cree un nuevo repositorio remoto llamado `construct-lib-repo`. Vaya al tab HTTPS (GRC) y siga las instrucciones para clonar el repositorio `construct-lib-repo` a su máquina local (reemplace `<path>` en el código abajo con el URL del repositorio recién creado).

{{<highlight bash>}}
git clone <path>
cd construct-lib-repo
{{</highlight>}}

Nota: Trabajaremos con TypeScript, así que asegurese que está instalado. Si no es así, ejecute el siguiente comando en su terminal:

{{<highlight bash>}}
npm install -g typescript
{{</highlight>}}

Ahora, crearemos un nuevo folder llamado `pipeline` dentro del directorio `/construct-lib-repo`.  Este contendrá la insfraestructura de la canalización. Luego inicializaremos un proyecto de CDK utilizando TypeScript.

{{<highlight bash>}}
mkdir pipeline
cd pipeline
cdk init app --language typescript
{{</highlight>}}

Abra el archivo `lib/pipeline-stack.ts` y reemplace el código con el siguiente:

{{<highlight typescript>}}
import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline'
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions'
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam'
import { Effect } from 'aws-cdk-lib/aws-iam'
import { PipelineProject } from "aws-cdk-lib/aws-codebuild";
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";

interface ConstructPipelineStackProps extends cdk.StackProps {
  codeArtifactDomain: string;
  codeArtifactRepository: string;
  constructLibGitRepositoryName: string;
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ConstructPipelineStackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();

    const pipeline = new codepipeline.Pipeline(this, 'Pipeline');
    this.addSourceStageToPipeline(pipeline, sourceArtifact, props);
    this.addCodeBuildStageToPipeline(pipeline, sourceArtifact, props);
  }

  private addSourceStageToPipeline(pipeline: Pipeline, sourceArtifact: Artifact, props: ConstructPipelineStackProps) {
    const sourceStage = pipeline.addStage({ stageName: 'Source' });
    sourceStage.addAction(new codepipeline_actions.CodeCommitSourceAction({
      actionName: 'Source',
      output: sourceArtifact,
      repository: codecommit.Repository.fromRepositoryName(this, 'ConstructLibRepository', props.constructLibGitRepositoryName),
      branch: "main",
      codeBuildCloneOutput: true
    }));
  }

  private addCodeBuildStageToPipeline(pipeline: Pipeline, sourceArtifact: Artifact, props: ConstructPipelineStackProps) {
    const constructBuildPackageAndReleaseBuildProject = new codebuild.PipelineProject(this, `ConstructBuildPackageAndReleaseCodeBuildProject`, {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("pipeline/build-spec/projen-release.yml"),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_6_0
      },
      environmentVariables: {
        CODEARTIFACT_DOMAIN: { value: props.codeArtifactDomain },
        AWS_ACCOUNT_ID: { value: this.account },
        CODEARTIFACT_REPOSITORY: { value: props.codeArtifactRepository }
      },
    });
    this.configureBuildProjectRolePolicy(constructBuildPackageAndReleaseBuildProject, props);

    const packageAndReleaseStage = pipeline.addStage({
      stageName: 'ConstructBuildPackageAndRelease'
    });

    packageAndReleaseStage.addAction(
      new codepipeline_actions.CodeBuildAction({
        actionName: 'ConstructBuildPackageAndRelease',
        project: constructBuildPackageAndReleaseBuildProject,
        input: sourceArtifact
      }));
  }

  private configureBuildProjectRolePolicy(constructBuildPackageAndReleaseBuildProject: PipelineProject, props: ConstructPipelineStackProps) {
    constructBuildPackageAndReleaseBuildProject.addToRolePolicy(new iam.PolicyStatement({
      actions: ['codeartifact:GetAuthorizationToken'],
      resources: [`arn:aws:codeartifact:${this.region}:${this.account}:domain/${props.codeArtifactDomain}`],
      effect: Effect.ALLOW
    }
    ));
    constructBuildPackageAndReleaseBuildProject.addToRolePolicy(new iam.PolicyStatement({
      actions: ['codeartifact:GetRepositoryEndpoint', 'codeartifact:ReadFromRepository'],
      resources: [`arn:aws:codeartifact:${this.region}:${this.account}:repository/${props.codeArtifactDomain}/${props.codeArtifactRepository}`],
      effect: Effect.ALLOW
    }
    ));
    constructBuildPackageAndReleaseBuildProject.addToRolePolicy(new iam.PolicyStatement({
      actions: ['codeartifact:PublishPackageVersion', 'codeartifact:PutPackageMetadata'],
      resources: [`arn:aws:codeartifact:${this.region}:${this.account}:package/${props.codeArtifactDomain}/${props.codeArtifactRepository}/*/*/*`],
      effect: Effect.ALLOW
    }
    ));
    constructBuildPackageAndReleaseBuildProject.addToRolePolicy(new iam.PolicyStatement({
      actions: ['sts:GetServiceBearerToken'],
      resources: ["*"],
      conditions: { "StringEquals": { "sts:AWSServiceName": "codeartifact.amazonaws.com" } },
      effect: Effect.ALLOW
    }
    ));
    constructBuildPackageAndReleaseBuildProject.addToRolePolicy(new iam.PolicyStatement({
      actions: ['codecommit:GitPull', 'codecommit:GitPush'],
      resources: [`arn:aws:codecommit:${this.region}:${this.account}:${props.constructLibGitRepositoryName}`],
      effect: Effect.ALLOW
    }
    ));
  }
}
{{</highlight>}}

Esto crea una canalización de CodePipeline con dos etapas, una etapa origen enlazada al repositorio de CodeCommit, y un proyecto de CodeBuild que ejecuta la compilación y libera los artefactos _transpiled_, empaquetados.

## Actualizar el Punto de Entrada del Despliegue de CDK

Ahora necesitamos cambiar el punto de entrada del despliegue de nuestra canalización. Para hacer esto, editemos el código en `bin/pipeline.ts` así:

{{<highlight typescript>}}
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
new PipelineStack(app, 'InternalConstructPipelineStack', {
  codeArtifactDomain: "cdkworkshop-domain",
  codeArtifactRepository: "cdkworkshop-repository",
  constructLibGitRepositoryName: "construct-lib-repo"
});
{{</highlight>}}

## Configuración de CodeBuild

Utilizaremos CodeBuild para construir nuestro proyecto. CodeBuild necesita un archivo 'buildspec'. Este archivo es una colección de comandos de compilación y ajustes relacionados en formato YAML que CodeBuild utiliza para ejecutar una compilación.

Ejecutemos los siguientes comandos para crear el archivo buildspec:
{{<highlight bash>}}
mkdir build-spec
touch build-spec/projen-release.yml
{{</highlight>}}

Ahora copiemos el siguiente código en 'projen-release.yml':

{{<highlight yaml>}}
version: 0.2

env:
  shell: "bash"
  git-credential-helper: "yes"

phases: 
  install: 
    runtime-versions: 
      python: "3.10"
      nodejs: "16"
      java: "corretto17"
      dotnet: "6.0"
    commands:
      - cd constructs
      - "npm install --location=global projen yarn"
      - "yarn install --check-files"
      - pip install git-remote-codecommit
#      Avoid detached head
      - git checkout main
      - git remote set-url origin `git remote -v | head -1 | cut -f1 -d " " | cut -f2 | sed 's/https:\/\/git-codecommit./codecommit::/g' | sed 's/.amazonaws.com\/v1\/repos\//:\/\//g'`
      - git config --global user.email "build-automation@amazon.com"
      - git config --global user.name "CodeBuild Automation"
  build:
    commands:
      - "projen release"
      - |-
        if [ -d "dist/js" ]; then
          echo "Uploading NPM package..."
          export NPM_TOKEN=`aws codeartifact get-authorization-token --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --query authorizationToken --output text`
          export NPM_REGISTRY=`aws codeartifact get-repository-endpoint --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --repository "${CODEARTIFACT_REPOSITORY}" --format npm --query repositoryEndpoint --output text | sed s~^https://~~`
          npx -p publib@latest publib-npm
          echo "Done uploading NPM package."
        else
          echo "dist/js was not found. Skipping NPM package upload."
        fi
        if [ -d "dist/python" ]; then
          echo "Uploading Python package..."
          export TWINE_USERNAME=aws
          export TWINE_PASSWORD=`aws codeartifact get-authorization-token --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --query authorizationToken --output text`
          export TWINE_REPOSITORY_URL=`aws codeartifact get-repository-endpoint --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --repository "${CODEARTIFACT_REPOSITORY}" --format pypi --query repositoryEndpoint --output text`
          npx -p publib@latest publib-pypi
          echo "Done uploading Python package."
        else
          echo "dist/python was not found. Skipping Python package upload."
        fi
        if [ -d "dist/dotnet" ]; then
          echo "Uploading NuGet package..."
          export NUGET_API_KEY=`aws codeartifact get-authorization-token --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --query authorizationToken --output text`
          export NUGET_SERVER="`aws codeartifact get-repository-endpoint --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --repository "${CODEARTIFACT_REPOSITORY}" --format nuget --query repositoryEndpoint --output text`v3/index.json"
          aws codeartifact login --tool dotnet --repository "${CODEARTIFACT_REPOSITORY}" --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}"
          npx -p publib@latest publib-nuget
          echo "Done uploading NuGet package."
        else
          echo "dist/dotnet was not found. Skipping NuGet package upload."
        fi
        if [ -d "dist/java" ]; then
          echo "Uploading Java package..."
          export MAVEN_USERNAME=aws
          export MAVEN_PASSWORD=`aws codeartifact get-authorization-token --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --query authorizationToken --output text`
          export MAVEN_REPOSITORY_URL=`aws codeartifact get-repository-endpoint --domain "${CODEARTIFACT_DOMAIN}" --domain-owner "${AWS_ACCOUNT_ID}" --repository "${CODEARTIFACT_REPOSITORY}" --format maven --query repositoryEndpoint --output text`
          export MAVEN_SERVER_ID=codeartifact
          npx -p publib@latest publib-maven
          echo "Done uploading Java package."
        else
          echo "dist/java was not found. Skipping Java package upload."
        fi        

reports: 
  test-reports: 
    files: 
      - "**/test-reports/junit.xml"
    file-format: "JUNITXML"
{{</highlight>}}

El primer comando en la fase de compilación de este archivo YAML es `projen release`. <a href="https://projen.io" target="_blank">Projen</a> se encarga de la compilación JSII, pruebas unitarias, detección de manipulaciones, y empaquetamiento. Miraremos Projen con más detalle en la siguente sección. Projen crea los paquetes transpilados y los coloca en el directorio `dist`.

Los otros comands de la fase de compilación buscan la existencia de directorios específicos `dist` en tiempo de ejecución y asignan las variables de ambiente de CodeArtifact en tiempo de ejecución antes de publicar los artefactos utilizando <a href="https://github.com/cdklabs/publib/blob/main/README.md" target="_blank">publib</a>.

## Resumen

En esta sección, creamos el código de la canalización que utilizaremos para compilar, empaquetar y publicar nuestros constructos internos a nuestro Construct Hub Interno. En la siguiente sección configuraremos Projen para crear una biblioteca de constructos.
