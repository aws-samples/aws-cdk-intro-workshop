using Amazon.CDK;
using Amazon.CDK.Pipelines;
using Constructs;

namespace CdkWorkshop
{
    public class WorkshopPipelineStage : Stage
    {
        public readonly CfnOutput HCViewerUrl;
        public readonly CfnOutput HCEndpoint;

        public WorkshopPipelineStage(Construct scope, string id, StageProps props = null)
            : base(scope, id, props)
        {
            var service = new CdkWorkshopStack(this, "WebService");

            this.HCEndpoint = service.HCEndpoint;
            this.HCViewerUrl = service.HCViewerUrl;
        }
    }
}
