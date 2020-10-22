using Amazon.CDK;
using Amazon.CDK.AWS.APIGateway;
using Amazon.CDK.AWS.Lambda;
using Eladb.DynamoTableViewer;

namespace CdkWorkshop
{
    public class CdkWorkshopStack : Stack
    {
        public readonly CfnOutput HCViewerUrl;
        public readonly CfnOutput HCEndpoint;

        // Defines a new lambda resource
        public CdkWorkshopStack(Construct parent, string id, IStackProps props = null) : base(parent, id, props)
        {
            var hello = new Function(this, "HelloHandler", new FunctionProps
            {
                Runtime = Runtime.NODEJS_10_X,
                Code = Code.FromAsset("lambda"),
                Handler = "hello.handler"
            });

            var helloWithCounter = new HitCounter(this, "HelloHitCounter", new HitCounterProps
            {
                Downstream = hello
            });

            var gateway = new LambdaRestApi(this, "Endpoint", new LambdaRestApiProps
            {
                Handler = helloWithCounter.Handler
            });

            var tv = new TableViewer(this, "ViewerHitCount", new TableViewerProps
            {
                Title = "Hello Hits",
                Table = helloWithCounter.MyTable
            });

            this.HCViewerUrl = new CfnOutput(this, "TableViewerUrl", new CfnOutputProps
            {
                Value = gateway.Url
            });

            this.HCEndpoint = new CfnOutput(this, "GatewayUrl", new CfnOutputProps
            {
                Value = gateway.Url
            });
        }
    }
}
