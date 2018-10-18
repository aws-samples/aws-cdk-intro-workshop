---
title: Configure log shipping
weight: 30
---

In order to ship our container logs to AWS CloudWatch Logs, we will make use of an open source fluentd based plugin. We can install it straight from Helm like so:

```
$ helm repo add incubator https://kubernetes-charts-incubator.storage.googleapis.com/
$ helm install \
    --name fluentd incubator/fluentd-cloudwatch \
    --set awsRegion=eu-west-1,rbac.create=true
```

{{% notice info %}}
Make sure to specify the region you created the AWS CloudWatch Logs log group in with the `--set awsRegion=<region>` flag in the above command 
{{% /notice %}}

We can verify that it installed correctly, by running `kubectl --namespace=default get pods -l "app=fluentd-cloudwatch,release=fluentd"`. You should see one pod per worker node. 

```
$ kubectl --namespace=default get pods -l "app=fluentd-cloudwatch,release=fluentd"
NAME                               READY     STATUS    RESTARTS   AGE
fluentd-fluentd-cloudwatch-gwcnr   1/1       Running   0          1m
fluentd-fluentd-cloudwatch-mksnh   1/1       Running   0          1m
```