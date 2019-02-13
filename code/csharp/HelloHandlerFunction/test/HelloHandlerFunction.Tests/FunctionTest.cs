using System.Collections.Generic;
using Amazon.Lambda.APIGatewayEvents;
using AutoFixture;
using AutoFixture.Xunit2;
using Xunit;

namespace HelloHandlerFunction.Tests
{
    public class FunctionTest
    {
        private readonly Function _sut;

        public FunctionTest()
        {
            var fixture = new Fixture();

            _sut = fixture.Freeze<Function>();
        }

        [Theory, AutoData]
        public void TestHandler(APIGatewayProxyRequest gatewayProxyRequest)
        {
            var testInvoke = _sut.FunctionHandler(gatewayProxyRequest);

            Assert.Equal(200, testInvoke.StatusCode);
            Assert.Equal(new Dictionary<string, string>
            {
                {"Content-Type", "text/plain"}
            }, testInvoke.Headers);
            Assert.Equal($"Hello, CDK! You've hit {gatewayProxyRequest.Path}\n", testInvoke.Body);
        }
    }
}