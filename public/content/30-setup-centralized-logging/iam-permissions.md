---
title: Configure IAM role
weight: 20
---

Your Kubernetes worker nodes will need IAM permissions to write log entries to CloudWatch Logs. We will need to update the IAM Role assigned to the worker nodes in order to allow this.

First we need to get the name of the IAM Role associated with your worker nodes. To do this, we'll look at the CloudFormation Outputs from the stack deployed by eksctl when we deployed the cluster:

```
$ export ROLE_ARN=$(aws cloudformation describe-stacks --stack-name eksctl-eks-cluster-nodegroup-0 | jq -r '.Stacks[0].Outputs[0].OutputValue')
$ export ROLE_NAME=$(echo $ROLE_ARN | cut -d '/' -f2)
```

Now we know the worker node role, we can attach an [AWS IAM Managed Policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html) that allows full access to CloudWatch Logs. 

```
$ aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
```
