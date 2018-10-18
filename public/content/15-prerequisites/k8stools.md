+++
title = "Install Kubernetes Tools"
chapter = false
weight = 50
+++

Amazon EKS clusters require kubectl and kubelet binaries and the Heptio
Authenticator to allow IAM authentication for your Kubernetes cluster.

{{% notice tip %}}
In this workshop we will give you the commands to download the Linux
binaries. If you are running Mac OSX / Windows, please see the official EKS docs
for the download links.
{{% /notice %}}


#### Install kubectl
```
sudo curl -kLo /usr/local/bin/kubectl "https://amazon-eks.s3-us-west-2.amazonaws.com/1.10.3/2018-06-05/bin/linux/amd64/kubectl"
sudo chmod +x /usr/local/bin/kubectl
```

#### Install Heptio Authenticator
```
sudo curl -kLo /usr/local/bin/heptio-authenticator-aws "https://amazon-eks.s3-us-west-2.amazonaws.com/1.10.3/2018-06-05/bin/linux/amd64/heptio-authenticator-aws"
sudo chmod +x /usr/local/bin/heptio-authenticator-aws
```

#### Verify the binaries
```
kubectl version --short --client
heptio-authenticator-aws help
```
