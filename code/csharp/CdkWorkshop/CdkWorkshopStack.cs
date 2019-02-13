using Amazon.CDK;
using Amazon.CDK.AWS.APIGateway;
using Amazon.CDK.AWS.Lambda;
using CdkWorkshop.Constructs;

namespace CdkWorkshop
{
    public class CdkWorkshopStack : Stack
    {
        public CdkWorkshopStack(App scope, string name, IStackProps props) : base(scope, name, props)
        {
            var hello = new Function(this, "HelloHandler", new FunctionProps
            {
                Runtime = Runtime.DotNetCore21,
                Timeout = 5,
                Code = Code.Asset(
                    "./HelloHandlerFunction/src/HelloHandlerFunction/bin/Debug/netcoreapp2.1"),
                Handler = "HelloHandlerFunction::HelloHandlerFunction.Function::FunctionHandler"
            });

            var helloWithCounter = new HitCounter(this, "HelloHitCounter", new HitCounterProps
            {
                Downstream = hello
            });

            new LambdaRestApi(this, "Endpoint", new LambdaRestApiProps
            {
                Handler = helloWithCounter.Handler
            });
        }
    }
}