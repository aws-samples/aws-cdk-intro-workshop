+++
title = "Writing constructs"
bookFlatSection = true
weight = 40
+++

# Writing constructs

In this chapter we will define a new construct called `HitCounter`. This
construct can be attached to any Lambda function that's used as an API Gateway
backend, and it will count how many requests were issued to each URL path. It
will store this in a DynamoDB table.

## See Also

- [Writing Constructs in the AWS CDK User Guide](https://docs.aws.amazon.com/CDK/latest/userguide/writing_constructs.html)