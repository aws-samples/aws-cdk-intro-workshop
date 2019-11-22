+++
title = "Project structure"
weight = 300
+++

## Open your IDE

Now's a good time to open the project in your favorite IDE and explore.

> If you use VSCode, you can just type `code .` within the project directory.
> 
> You may see a notification saying `Required assets to build and debug are missing from 'YOURPROJECT'. Add them?` 
> 
> This can be ignored for our purposes.

## Explore your project directory

You'll see something like this:

![](./structure.png)

* `src/CdkWorkshop/Program.cs` is the entrypoint for the CDK application it will load the stack defined in `src/CdkWorkshop/CdkWorkshopStack.cs`
* `src/CdkWorkshop/CdkWorkshopStack.cs` is where your CDK application's main stack is defined. This is the file we'll be spending most of our time in.
* `cdk.json` tells the toolkit how to run your app. In our case it will be `"dotnet run -p src/CdkWorkshop/CdkWorkshop.csproj"`
* `src/CdkWorkshop/CdkWorkshop.csproj` is the C# project file. It is an xml file and contains information on references. This will be useful to you down the line, but is not relevant for the purposes of this workshop.
* `src/CdkWorkshop/GlobalSuppressions.cs` disables the Roslyn analyzer for `RECS0026:Possible unassigned object created by 'new'` as this generates many false positives with CDK.
* `src/CdkWorkshop.sln` is the C# solution file that provides build information. You should not need to interface with this file.
* `.gitignore` tell git and npm which files to include/exclude
  from source control and when publishing this module to the package manager.
* The `src/CdkWorkshop/bin` and `src/CdkWorkshop/obj` folders are the build folders for the project and can be ignored.

## Your app's entry point

Let's have a quick look at `src/CdkWorkshop/Program.cs`:

```c#
using Amazon.CDK;

namespace CdkWorkshop
{
    class Program
    {
        static void Main(string[] args)
        {
            var app = new App();
            new CdkWorkshopStack(app, "CdkWorkshopStack");

            app.Synth();
        }
    }
}
```

This code loads and instantiates the `CdkWorkshopStack` class from the
`src/CdkWorkshop/CdkWorkshopStack.cs` file. We won't need to look at this file anymore.

## The main stack

Open up `src/CdkWorkshop/CdkWorkshopStack.cs`. This is where the meat of our application
is:

```cs
using Amazon.CDK;
using Amazon.CDK.AWS.SNS;
using Amazon.CDK.AWS.SNS.Subscriptions;
using Amazon.CDK.AWS.SQS;

namespace CdkWorkshop
{
    public class CdkWorkshopStack : Stack
    {
        public CdkWorkshopStack(Construct scope, string id) : base(scope, id)
        {
             // The CDK includes built-in constructs for most resource types, such as Queues and Topics.
            var queue = new Queue(this, "CdkWorkshopQueue", new QueueProps
            {
                VisibilityTimeout = Duration.Seconds(300)
            });

            var topic = new Topic(this, "CdkWorkshopTopic");

            topic.AddSubscription(new SqsSubscription(queue));
        }
    }
}
```

As you can see, our app was created with a sample CDK stack
(`CdkWorkshopStack`).

The stack includes:

- SQS Queue (`new Queue`)
- SNS Topic (`new Topic`)
- Subscribing the queue to receive any messages published to the topic (`topic.AddSubscription`)
