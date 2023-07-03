+++
title = "Testing Constructs"
weight = 100
bookCollapseSection = true
+++

## Testing Constructs (Optional)

The [CDK Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/testing.html) has a good guide on
testing constructs. For this section of the workshop we are going to use the [Fine-Grained Assertions](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_fine_grained)
and [Validation](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_validation) type tests.

### Prerequisites

1. Install the required testing packages.

Edit the `pom.xml` to add the following deps

{{<highlight xml "hl_lines=8-13">}}
<?xml version="1.0" encoding="UTF-8"?>
<project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd"
         xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dependencies>

        ...

        <dependency>
            <groupId>org.assertj</groupId>
            <artifactId>assertj-core</artifactId>
            <version>3.18.1</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
{{</highlight>}}

#### CDK assert Library

We will be using the CDK `assertions` (`software.amazon.awscdk.assertions`) library throughout this section.
The library contains several helper functions for writing unit and integration tests.


For this workshop we will mostly be using the `hasResourceProperties` function. This helper is used when you
only care that a resource of a particular type exists (regardless of its logical identfier), and that _some_
properties are set to specific values.

Example:

```java
Map<String, Object> expected = Map.of(
    "DomainName", "test.example.com",
)
template.hasResourceProperties("AWS::CertificateManager::Certificate", expected);
```

To see the rest of the documentation, please read the docs [here](https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/assertions/README.md).
