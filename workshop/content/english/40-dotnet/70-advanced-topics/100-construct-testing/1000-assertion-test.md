+++
title = "Assertion Tests"
weight = 200
+++

### Fine-Grained Assertion Tests

#### Create a test for the DynamoDB table

{{% notice info %}} This section assumes that you have [created the hit counter construct](/40-dotnet/40-hit-counter.html) {{% /notice %}}

Our `HitCounter` construct creates a simple DynamoDB table. Lets create a test that
validates that the table is getting created.

#### Prerequisites

* Visual Studio Required for this testing workshop, download [here](https://visualstudio.microsoft.com/downloads/)

#### Getting started testing your CDK code

* Open `src/CdkWorkshop/CdkWorkshop.sln`in Visual Studio
* In Solution Explorer, add Project `Tests` > `MSTest Project` named `CdkWorkshopTests`
* From terminal, from directory `CdkWorkshop.sln` resides in, run `dotnet test` to see single placeholder test pass
* Rename boilerplate `UnitTest1.cs` file to `HitCounterTest.cs`
* In Solution Explorer, add reference to `CdkWorkshop` project from `CdkWorkshopTests`
* In Solution Explorer, add `Amazon.CDK`, `Amazon.CDK.lib`, and `Amazon.CDK.Assertions` NuGet packages to the CdkWorkshopTests project

#### Create test suite and add test for creation of DynamoDB Table

 Update the contents of the `HitCounterTest.cs` to add test ensure DynamoDB Table was created:
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

Run the test and ensure test passes:
```bash
$ dotnet test
```

You should see output like this:

```bash
$ dotnet test

Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 15 ms - CdkWorkshopTests.dll (net7.0)
```

#### Add test to ensure HitCounter Lambda is created
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

Notice the usage of `Match.AnyValue`:

{{<highlight cs "hl_lines=3">}}
template.HasResourceProperties("AWS::Lambda::Function", new ObjectDict {
    { "Handler", "hitcounter.handler" },
    { "Environment", Match.AnyValue() }
});
{{</highlight>}}

This allows us to ignore properties that do not apply or we do not understand how to define.

#### Add a test to ensure the lambda is created with correct environment variables
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

Notice the usage of argument captors:

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

This allows us to capture parameters passed to the CDK method that we used to define our table

Using these captors, we can make an assertion on the `Ref` property in the generated CloudFormation template for the `DOWNSTREAM_FUNCTION_NAME` and `HITS_TABLE_NAME` environment variables

The `StartsWith` method is used to reduce risk of the tests not functioning as expected due 
to randomly generated characters that are appended to the resource names during generation of CloudFormation.

#### Add test to ensure DynamoDB table created with correct key
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


#### Wrapping up
At this point you should have 4 passing tests:

```bash
$ dotnet test                                                                                    

Test run for /Users/kev/src/aws-cdk-intro-workshop/code/csharp/test-workshop/src/CdkWorkshopTests/bin/Debug/net7.0/CdkWorkshopTests.dll (.NETCoreApp,Version=v7.0)
Microsoft (R) Test Execution Command Line Tool Version 17.5.0 (x64)
Copyright (c) Microsoft Corporation.  All rights reserved.

Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     4, Skipped:     0, Total:     4, Duration: 7 s - CdkWorkshopTests.dll (net7.0)
```

Congrats, nice work!  

This portion of the workshop has provided only a small overview of testing csharp CDK solutions.   For more information, view the C# samples in the [user guide](https://docs.aws.amazon.com/cdk/v2/guide/testing.html).
  


##### Page Todo
* Figure out commands to do things instead of Visual Studio solution explorer things, got idea from [here](https://scottie.is/writing/a-cdk-companion-for-the-rahul-nath-lambda-course/)
* Manage nuget packages via CLI, e.g.: `dotnet add package Amazon.CDK.Assertions`
* Remove need for Visual Studio


{{< nextprevlinks >}}