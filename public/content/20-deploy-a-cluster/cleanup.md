---
title: "Cleanup"
date: 2018-08-07T13:37:53-07:00
weight: 40
---

In order to delete the resources created for this EKS cluster, run the following commands:

Delete the cluster:
```
eksctl delete cluster --name=eksworkshop-eksctl
```

{{% notice tip %}}
The command will return quickly, but destroying all the resources will take
approximately 15 minutes, and can be monitored via the
[CloudFormation Console](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2)
{{% /notice %}}
