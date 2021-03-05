+++
title = "Testing Constructs"
weight = 100
+++

## Testing Constructs (Optional)

The [CDK Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/testing.html) has a good guide on
testing constructs. For this section of the workshop we are going to use the [Fine-Grained Assertions](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_fine_grained) and [Validation](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_validation) type tests.

### Prerequisites

1. Install the required testing packages.

```bash
$ npm install --save-dev jest @types/jest @aws-cdk/assert
```

#### CDK assert Library

We will be using the CDK `assert` (`@aws-cdk/assert`) library throughout this section.
The library contains several helper functions for writing unit and integration tests.


For this workshop we will mostly be using the `haveResource` function. This helper is used when you
only care that a resource of a particular type exists (regardless of its logical identfier), and that _some_
properties are set to specific values.

Example:

```ts
expect(stack).to(haveResource('AWS::CertificateManager::Certificate', {
    DomainName: 'test.example.com',
    // Note: some properties omitted here

    ShouldNotExist: ABSENT
}));
```

`ABSENT` is a magic value to assert that a particular key in an object is *not* set (or set to `undefined`).

To see the rest of the documentation, please read the docs [here](https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/assert/README.md).
