using System;
using System.IO;
using AutoFixture;
using AutoFixture.Xunit2;

namespace HitCounterFunction.Tests
{
    public class DefaultAutoData : AutoDataAttribute
    {
        public DefaultAutoData() : base(() =>
            new Fixture().Customize(new CompositeCustomization(new MemoryStreamGood())))
        {
        }

        private class MemoryStreamGood : ICustomization
        {
            public void Customize(IFixture fixture)
            {
                fixture.Register(() => new MemoryStream(Guid.NewGuid().ToByteArray()));
            }
        }
    }
}