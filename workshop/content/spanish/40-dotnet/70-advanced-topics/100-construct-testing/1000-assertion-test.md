+++
title = "Pruebas de Aserción"
weight = 200
+++

### Pruebas de Aserción Detalladas

#### Crear una prrueba para la tabla de DynamoDB

{{% notice info %}} Esta sección asume que usted ha [creado el constructo contador de hits](/es/40-dotnet/40-hit-counter.html) {{% /notice %}}

Nuestro constructo `HitCounter` crea una tabla simple de DynamoDB. Ahora, creemos una prueba que valide que la tabla está siendo creada.

#### Prerrequisitos

* Visual Studio es requerido para hacer las pruebas en este workshop, puede descargarlo [aquí](https://visualstudio.microsoft.com/downloads/).

#### Introducción a probar su código de CDK

* En Visual Studio abra `src/CdkWorkshop/CdkWorkshop.sln`
* En Solution Explorer, adicione un Proyecto `Tests` > `MSTest Project` llamado `CdkWorkshopTests`
* Desde una terminal, estando en el directorio en donde se encuentra `CdkWorkshop.sln`, ejecute `dotnet test` para observar como la prueba única es exitosa
* Renombre el archivo de ejemplo `UnitTest1.cs` como `HitCounterTest.cs`
* En Solution Explorer, adicione una referencia al proyecto `CdkWorkshop` desde `CdkWorkshopTests`
* En Solution Explorer, adicione los paquetes NuGet `Amazon.CDK`, `Amazon.CDK.lib`, y `Amazon.CDK.Assertions` al proyecto CdkWorkshopTests

#### Creee un conjunto de pruebas y agregue una prueba para la creación de la tabla de DynamoDB

Actualice el contenido de `HitCounterTest.cs` para agregar la prueba que asegura que la tabla de DynamoDB ha sido creada:
```cs
namespace CdkWorkshopTests;

using Amazon.CDK;
using Amazon.CDK.Assertions;
using CdkWorkshop;

using ObjectDict = Dictionary<string, object>;

[TestClass]
public class HitCounterTest
{
    private Template template;

    [TestInitialize()]
    public void Startup()
    {
        //Create directory that is used when creating lambda in stack 
        Directory.CreateDirectory("lambda");

        var app = new App();
        var stack = new CdkWorkshopStack(app, "test-stack");
        template = Template.FromStack(stack);
    }

    [TestCleanup()]
    public void Cleanup()
    {
        Directory.Delete("lambda");
    }


    [TestMethod]
    public void DynamoDBTableCreated()
    {
        template.ResourceCountIs("AWS::DynamoDB::Table", 1);
    }
}
```

Ejecute la prueba y asegurese que es exitosa:
```bash
$ dotnet test
```

Usted debería ver una salida similar a esta:

```bash
$ dotnet test

Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 15 ms - CdkWorkshopTests.dll (net7.0)
```

#### Agregue una prueba para asegurar que la función Lambda HitCounter es creada
```cs
[TestMethod]
public void StackCreatesHitCounterHandler()
{
    template.HasResourceProperties("AWS::Lambda::Function", new ObjectDict {
        { "Handler", "hitcounter.handler" },
        { "Environment", Match.AnyValue() }
    });
}
```

Observe como se utiliza `Match.AnyValue`:

{{<highlight cs "hl_lines=3">}}
template.HasResourceProperties("AWS::Lambda::Function", new ObjectDict {
    { "Handler", "hitcounter.handler" },
    { "Environment", Match.AnyValue() }
});
{{</highlight>}}

Esto nos permite ignorar propiedades que no aplican o que no sabemos como definir.

#### Agregue una prueba para asegurar que la funcion Lambda es creada con las variables de entorno correctas
```cs
[TestMethod]
public void HitCounterLambdaEnvironmentVariablesCorrect()
{
    var functionCapture = new Capture();
    var tableCapture = new Capture();

    template.HasResourceProperties("AWS::Lambda::Function", new ObjectDict {
        { "Handler", "hitcounter.handler" },
        {
            "Environment", new ObjectDict {
                {
                    "Variables", new ObjectDict {
                        { "DOWNSTREAM_FUNCTION_NAME", functionCapture },
                        { "HITS_TABLE_NAME", tableCapture },
                    }
                }
            }
        }
    });

    Assert.IsTrue(functionCapture.AsObject()["Ref"].ToString().StartsWith("HelloHandler"));
    Assert.IsTrue(tableCapture.AsObject()["Ref"].ToString().StartsWith("HelloHitCounterHits"));
}
```

Observe el use de los captores de argumentos:

{{<highlight cs "hl_lines=7-8">}}
template.HasResourceProperties("AWS::Lambda::Function", new ObjectDict {
    { "Handler", "hitcounter.handler" },
    {
        "Environment", new ObjectDict {
            {
                "Variables", new ObjectDict {
                    { "DOWNSTREAM_FUNCTION_NAME", functionCapture },
                    { "HITS_TABLE_NAME", tableCapture },
                }
            }
        }
    }
});

Assert.IsTrue(functionCapture.AsObject()["Ref"].ToString().StartsWith("HelloHandler"));
Assert.IsTrue(tableCapture.AsObject()["Ref"].ToString().StartsWith("HelloHitCounterHits"));
{{</highlight>}}

Esto nos permite capturar los parámetros pasados al método de CDK que utilizamos para definir nuestra tabla.

Utilizando estos captores, podemos hacer una aserción para las variables de entorno `DOWNSTREAM_FUNCTION_NAME` y `HITS_TABLE_NAME` en la propiedad `Ref` en la plantilla generada de CloudFormation.

El método `StartsWith` es utilizado para reducir el riesgo que las pruebas no funcionen como sea esperado debido a caracteres generados aleatoriamente que son adicionados a los nombres de los recursos durante la generación de CloudFormation.

#### Agregar una prueba que asegure que la tabla de DynamoDB es creada con la llave correcta
```cs
[TestMethod]
public void DynamoDBTableCreatedWithCorrectKey()
{
    var keySchemaCapture = new Capture();
    
    template.HasResourceProperties("AWS::DynamoDB::Table", new ObjectDict {
        { "KeySchema", keySchemaCapture },
        { "AttributeDefinitions", Match.AnyValue() },
        { "ProvisionedThroughput", Match.AnyValue() },
    });

    var expectedKeyAttributes = new[] { "path" };
    var actualKeyAttributes = keySchemaCapture.AsArray().Select(x =>
        (x as ObjectDict)["AttributeName"].ToString()).ToArray();

    CollectionAssert.AreEqual(expectedKeyAttributes, actualKeyAttributes);
}
```


#### Resumiendo
En este punto usted debería tener 4 pruebas exitosas:

```bash
$ dotnet test                                                                                    

Test run for /Users/kev/src/aws-cdk-intro-workshop/code/csharp/test-workshop/src/CdkWorkshopTests/bin/Debug/net7.0/CdkWorkshopTests.dll (.NETCoreApp,Version=v7.0)
Microsoft (R) Test Execution Command Line Tool Version 17.5.0 (x64)
Copyright (c) Microsoft Corporation.  All rights reserved.

Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     4, Skipped:     0, Total:     4, Duration: 7 s - CdkWorkshopTests.dll (net7.0)
```

Felicitaciones, buen trabajo!  

Esta parte del workshop solo ha provisto un vistazo de como hacer pruebas de soluciones CDK para csharp. Para más información, vea los ejemplos de C# en la [Guía para desarrolladores](https://docs.aws.amazon.com/cdk/v2/guide/testing.html).
  


<!-- ##### Page Todo
* Figure out commands to do things instead of Visual Studio solution explorer things, got idea from [here](https://scottie.is/writing/a-cdk-companion-for-the-rahul-nath-lambda-course/)
* Manage nuget packages via CLI, e.g.: `dotnet add package Amazon.CDK.Assertions`
* Remove need for Visual Studio -->