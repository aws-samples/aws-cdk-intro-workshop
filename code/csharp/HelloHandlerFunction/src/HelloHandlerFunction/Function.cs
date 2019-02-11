using System.Collections.Generic;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.Json;

[assembly: LambdaSerializer(typeof(JsonSerializer))]

namespace HelloHandlerFunction
{
    public sealed class Function
    {
        public APIGatewayProxyResponse FunctionHandler(APIGatewayProxyRequest input)
        {
            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Headers = new Dictionary<string, string>
                {
                    {"Content-Type", "text/plain"}
                },
                Body = $"Hello, CDK! You've hit {input.Path}\n"
            };
        }
    }
}