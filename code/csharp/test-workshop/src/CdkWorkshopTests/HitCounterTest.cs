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

    [TestMethod]
    public void StackCreatesHitCounterHandler()
    {
        template.HasResourceProperties("AWS::Lambda::Function", new ObjectDict {
            { "Handler", "hitcounter.handler" },
            { "Environment", Match.AnyValue() }
        });
    }

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
}
