using Amazon.CDK;

namespace CdkWorkshop
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var app = new App(null);
            new CdkWorkshopStack(app, "CdkWorkshopStack", new StackProps());
            app.Synth();
        }
    }
}