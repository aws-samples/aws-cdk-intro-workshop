---
title: Create a log group
weight: 10
---


The first step, is to setup an [AWS CloudWatch Log Group](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html) that will be used to store all of our Kubernetes logs. Make sure to create the log group in the same AWS region as your Amazon EKS cluster.

```
$ aws logs create-log-group --log-group-name kubernetes --region eu-west-1
```

By default, CloudWatch Logs will keep all of your log entries indefinitely. If you want to automatically purge logs older than a certain number of days, you can setup a retention policy. For example: 

```
$ aws logs put-retention-policy --log-group-name kubernetes --retention-in-days 365
```