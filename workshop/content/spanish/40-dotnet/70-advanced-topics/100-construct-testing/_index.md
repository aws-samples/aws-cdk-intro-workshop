+++
title = "Testing Constructs"
weight = 100
bookCollapseSection = true

+++

## Testing Constructs (Optional)

The [CDK Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/testing.html) has a good guide on
testing constructs. For this section of the workshop we are going to use the [Fine-Grained Assertions](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_fine_grained).

#### CDK assert Library

We will be using the CDK `Assertions` (`Amazon.CDK.Assertions`) [library](https://www.nuget.org/packages/Amazon.CDK.Assertions/) throughout this section.
The library contains several helper functions for writing unit and integration tests.

For this workshop we will mostly be using the `HasResourceProperties` function. This helper is used when you only care that a resource of a particular type exists (regardless of its logical identifier), and that _some_ properties are set to specific values.

Example:

```cs
template.HasResourceProperties("AWS::Lambda::Function", new Dictionary<string, object> {
    { "Handler", "hitcounter.handler" },
    { "Environment", Match.AnyValue() }
});
```

`Match.AnyValue()` can be used to assert that a particular key in an object is set with any value.

To see the rest of the documentation, please read the docs [here](https://www.fuget.org/packages/Amazon.CDK.Assertions/1.194.0).
