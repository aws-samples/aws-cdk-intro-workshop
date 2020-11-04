using Amazon.CDK;

namespace CdkWorkshop
{
    class Program
    {
        static void Main(string[] args)
        {
            var app = new App();
            new WorkshopPipelineStack(app, "WorkshopPipelineStack");

            app.Synth();
        }
    }
}
