+++
title = "Update IAM settings for your Workspace"
chapter = false
weight = 30
+++

{{% notice info %}}
Cloud9 normally manages IAM credentials dynamically. This isn't currently compatible with
the heptio authentication plugin, so we will disable it and rely on the IAM role instead.
{{% /notice %}}

- Return to your workspace and click the sprocket, or launch a new tab to open the Preferences tab
- Select **AWS SETTINGS**
- Turn off **AWS managed temporary credentials**
- Close the Preferences tab
![c9disableiam](/images/c9disableiam.png)

- To ensure temporary credentials aren't already in place we will also remove
any existing credentials file:
```
rm -vf ${HOME}/.aws/credentials
```

- We should configure our aws cli with a default region: **us-west-2**
```
aws configure set default.region us-west-2
aws configure get default.region
```
