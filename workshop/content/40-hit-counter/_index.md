+++
title = "Writing Constructs"
chapter = true
weight = 40
+++

# Writing constructs

In this chapter we will define a new construct called `HitCounter`. This
construct can be attached to any Lambda function that's used as an API Gateway
backend, and it will count how many requests were issued to each URL path. It
will store this in a DynamoDB table.

![](images/hit-counter.png)
