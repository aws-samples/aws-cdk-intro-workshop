# Testing constructs in csharp

Visual Studio Required for this testing workshop, download [here](https://visualstudio.microsoft.com/downloads/)

## Todo
* Figure out commands to do things instead of Visual Studio solution explorer things, got idea from [here](https://scottie.is/writing/a-cdk-companion-for-the-rahul-nath-lambda-course/)
* Manage nuget packages via CLI, e.g.: `dotnet add package Amazon.CDK.Assertions`
* Remove need for Visual Studio

## Getting started testing your CDK code

* Open `src/CdkWorkshop/CdkWorkshop.sln`in Visual Studio
* In Solution Explorer, add Project `Tests` > `MSTest Project` named `CdkWorkshopTests`
* From terminal, from directory `CdkWorkshop.sln` resides in, run `dotnet test` to see single placeholder test pass
* Rename boilerplate `UnitTest1.cs` file to `HitCounterTest.cs`
* In Solution Explorer, add reference to `CdkWorkshop` project from `CdkWorkshopTests`
* In Solution Explorer, add `Amazon.CDK`, `Amazon.CDK.lib`, and `Amazon.CDK.Assertions` NuGet packages to the CdkWorkshopTests project

* Update the contents of the `HitCounterTest.cs` to add test ensure DynamoDB Table was created:
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
* Run `dotnet test` and ensure test passes

* Add test to ensure DynamoDB table created with correct key:

* Add test to ensure HitCounter Lambda is created:
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

* Add a test to ensure the lambda is created with correct environment variables:
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

## CDK C# project notes

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CdkWorkshopStack`)
which contains an Amazon SNS topic that is subscribed to an Amazon SQS queue.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

It uses the [.NET Core CLI](https://docs.microsoft.com/dotnet/articles/core/) to compile and execute your project.

## Useful CDK commands

* `dotnet build src` compile this app
* `cdk ls`           list all stacks in the app
* `cdk synth`       emits the synthesized CloudFormation template
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk docs`        open CDK documentation

