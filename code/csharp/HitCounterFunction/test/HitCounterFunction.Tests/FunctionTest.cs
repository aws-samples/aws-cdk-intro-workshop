using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.Lambda;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Model;
using AutoFixture;
using AutoFixture.AutoMoq;
using AutoFixture.Kernel;
using Moq;
using Xunit;

namespace HitCounterFunction.Tests
{
    public class FunctionTest
    {
        private readonly Function _sut;
        private readonly Mock<IAmazonDynamoDB> _dynamoDbClientMock;
        private readonly Mock<IAmazonLambda> _lambdaClientMock;

        public FunctionTest()
        {
            var fixture = new Fixture().Customize(new AutoMoqCustomization());
            fixture.Customize<Function>(c => c.FromFactory(new MethodInvoker(new GreedyConstructorQuery())));

            _dynamoDbClientMock = fixture.Freeze<Mock<IAmazonDynamoDB>>();
            _lambdaClientMock = fixture.Freeze<Mock<IAmazonLambda>>();

            _sut = fixture.Freeze<Function>();

            _dynamoDbClientMock.Setup(client =>
                    client.UpdateItemAsync(It.IsAny<UpdateItemRequest>(), CancellationToken.None))
                .ReturnsAsync(new UpdateItemResponse());
        }

        [Theory, DefaultAutoData]
        public async Task TestHandler(APIGatewayProxyRequest gatewayProxyRequest, InvokeResponse invokeResponse)
        {
            _lambdaClientMock.Setup(client => client.InvokeAsync(It.IsAny<InvokeRequest>(), CancellationToken.None))
                .ReturnsAsync(invokeResponse);

            var checkStream = new MemoryStream();
            invokeResponse.Payload.CopyTo(checkStream);

            var testInvoke = await _sut.FunctionHandler(gatewayProxyRequest);

            using (var reader = new StreamReader(checkStream))
            {
                Assert.Equal(reader.ReadToEnd(), testInvoke.Body);
            }
        }
    }
}