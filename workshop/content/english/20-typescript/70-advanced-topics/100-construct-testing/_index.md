+++
title = "Testing Constructs"
weight = 100
bookCollapseSection = true

+++

## Testing Constructs (Optional)

The [CDK Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/testing.html) has a good guide on
testing constructs. For this section of the workshop we are going to use the [Fine-Grained Assertions](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_fine_grained)
and [Validation](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_validation) type tests.

#### CDK assert Library

We will be using the CDK `assertions` (`aws-cdk-lib/assertions`) library throughout this section.
The library contains several helper functions for writing unit and integration tests.


For this workshop we will mostly be using the `hasResourceProperties` function. This helper is used when you
only care that a resource of a particular type exists (regardless of its logical identfier), and that _some_
properties are set to specific values.

Example:

```ts
template.hasResourceProperties('AWS::CertificateManager::Certificate', {
    DomainName: 'test.example.com',

    ShouldNotExist: Match.absent(),
    // Note: some properties omitted here
});
```

`Match.absent()` can be used to assert that a particular key in an object is *not* set (or set to `undefined`).

To see the rest of the documentation, please read the docs [here](https://docs.aws.amazon.com/cdk/api/latest/docs/assertions-readme.html).
