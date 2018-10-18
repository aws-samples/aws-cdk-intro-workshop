---
title: "Install Helm & Tiller"
date: 2018-08-07T13:31:55-07:00
weight: 20
---

If you are using Mac OS, you can install Helm with [Homebrew](https://brew.sh/).
For other operating systems, please see [the Helm documentation](https://github.com/helm/helm/blob/master/docs/install.md).

```
brew install kubernetes-helm
```

Once installed, you can verify that it installed correctly by running `helm version`

```
helm version
Client: &version.Version{SemVer:"v2.10.0", GitCommit:"9ad53aac42165a5fadc6c87be0dea6b115f93090", GitTreeState:"clean"}
Error: could not find tiller
```

You'll see an error from Helm about not being able to find tiller. This is expected at this stage, as so far all we have done is install the Helm CLI to our local machine - now we need to deploy tiller to our Kubernetes cluster.

To do this, just run

```
helm init --service-account tiller
```

This will install tiller (responsible for deploying helm charts to your cluster) as a Deployment in your Kubernetes cluster. You can verify it deployed successfully by running `kubectl get deployment tiller-deploy -n kube-system`

```
kubectl get deployment tiller-deploy -n kube-system
NAME            DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
tiller-deploy   1         1         1            1           53s
```

You should now be able to re-run `helm version`, and helm will show both the client (cli), and server (tiller) versions

```
helm version
Client: &version.Version{SemVer:"v2.10.0", GitCommit:"9ad53aac42165a5fadc6c87be0dea6b115f93090", GitTreeState:"clean"}
Server: &version.Version{SemVer:"v2.10.0", GitCommit:"9ad53aac42165a5fadc6c87be0dea6b115f93090", GitTreeState:"clean"}
```

If you ever want to upgrade helm and tiller to the latest versions, just run

```
brew upgrade kubernetes-helm
helm init --service-account tiller --upgrade
```

We'll use helm in our next chapter, to install Istio to our Kubernetes cluster.