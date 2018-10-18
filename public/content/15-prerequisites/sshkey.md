+++
title = "Create a SSH key"
chapter = false
weight = 40
+++

1. Create a ssh key for your workspace
```
ssh-keygen
```
{{% notice tip %}}
Press `enter` 3 times to take the default choices
{{% /notice %}}

1. Upload the public key to your EC2 region:
```
aws ec2 import-key-pair --key-name "eksworkshop" --public-key-material file://~/.ssh/id_rsa.pub
```
