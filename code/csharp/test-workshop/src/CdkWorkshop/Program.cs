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
