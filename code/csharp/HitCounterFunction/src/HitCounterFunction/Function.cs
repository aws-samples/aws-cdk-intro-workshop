using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.Lambda;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.Model;
using Newtonsoft.Json;
using Environment = System.Environment;
using JsonSerializer = Amazon.Lambda.Serialization.Json.JsonSerializer;

[assembly: LambdaSerializer(typeof(JsonSerializer))]

namespace HitCounterFunction
{
    public sealed class Function : IDisposable
    {
        private IAmazonDynamoDB _dynamoDbClient;
        private IAmazonLambda _lambdaClient;

        public Function() : this(null, null)
        {
        }

        public Function(IAmazonDynamoDB dynamoDbClient, IAmazonLambda lambdaClient)
        {
            _dynamoDbClient = dynamoDbClient ?? new AmazonDynamoDBClient();
            _lambdaClient = lambdaClient ?? new AmazonLambdaClient();
        }

        public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest input)
        {
            Console.WriteLine("Starting function");
            Console.WriteLine("Incrementing call counter");

            var updateCounter = _dynamoDbClient.UpdateItemAsync(new UpdateItemRequest
            {
                TableName = Environment.GetEnvironmentVariable("HITS_TABLE_NAME"),
                Key = new Dictionary<string, AttributeValue>
                {
                    {
                        "path", new AttributeValue
                        {
                            S = input.Path
                        }
                    }
                },
                UpdateExpression = "ADD hits :incr",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    {
                        ":incr", new AttributeValue
                        {
                            N = "1"
                        }
                    }
                }
            });

            Console.WriteLine("Staring Proxy lambda call...");

            var response = await _lambdaClient.InvokeAsync(new InvokeRequest
            {
                FunctionName = Environment.GetEnvironmentVariable("DOWNSTREAM_FUNCTION_NAME"),
                Payload = JsonConvert.SerializeObject(input)
            });

            Console.WriteLine($"Downstream response status code was {response.StatusCode}");

            Console.WriteLine("Waiting for counter to update");
            await updateCounter;

            using (var reader = new StreamReader(response.Payload))
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = response.StatusCode,
                    Body = reader.ReadToEnd()
                };
            }
        }

        public void Dispose()
        {
            _dynamoDbClient.Dispose();
            _lambdaClient.Dispose();
        }
    }
}