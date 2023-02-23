using Amazon.CDK;
using Amazon.CDK.AWS.APIGateway;
using Amazon.CDK.AWS.Lambda;
using Constructs;
using Cdklabs.DynamoTableViewer;
namespace CdkWorkshop
{
    public class CdkWorkshopStack : Stack
    {
        // Defines a new lambda resource
        public CdkWorkshopStack(Construct scope, string id) : base(scope, id)
        {
            var hello = new Function(this, "HelloHandler", new FunctionProps
            {
                Runtime = Runtime.NODEJS_14_X,
                Code = Code.FromAsset("lambda"),
                Handler = "hello.handler"
            });

            var helloWithCounter = new HitCounter(this, "HelloHitCounter", new HitCounterProps
            {
                Downstream = hello
            });

            new LambdaRestApi(this, "Endpoint", new LambdaRestApiProps
            {
                Handler = helloWithCounter.Handler
            });

            new TableViewer(this, "ViewerHitCount", new TableViewerProps
            {
                Title = "Hello Hits",
                Table = helloWithCounter.MyTable
            });
        }
    }
}
