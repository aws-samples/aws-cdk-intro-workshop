---
title: "Sample Application"
date: 2018-08-07T13:31:55-07:00
weight: 20
---

Istio contains a handy sample application ([BookInfo](https://istio.io/docs/examples/bookinfo/)) that we can use to verify Istio is deployed successfully, and explore some of the key features.

Ensure that your are still in the istio folder downloaded in the previous page, and then run

```
$ kubectl apply -f <(istioctl kube-inject -f samples/bookinfo/platform/kube/bookinfo.yaml)
```
{{% notice info %}}
If you get an error that the `istioctl` command is not found, please make sure you added the the bin folder to your PATH. You can do this with `export PATH=$PATH:$(pwd)/bin` whilst in the downloaded istio directory
{{% /notice %}}

This will deploy a sample application for displaying book reviews, made up of a few different microservices. You can verify that the sample application deployed successfully by running `kubectl get pods`

```
$ kubectl get pods
NAME                              READY     STATUS    RESTARTS   AGE
details-v1-6c77545767-kdprj       2/2       Running   0          1m
productpage-v1-79bd99d8c5-tdgsg   2/2       Running   0          1m
ratings-v1-6df6bcf5ff-9zcrw       2/2       Running   0          1m
reviews-v1-84648f754c-vr96b       2/2       Running   0          1m
reviews-v2-878d96859-9b2gg        2/2       Running   0          1m
reviews-v3-6c4489748c-jbgdj       2/2       Running   0          1m
```

In order to allow access to our sample application from the outside world, we need to setup an ingress route via an [Istio Gateway](https://istio.io/docs/concepts/traffic-management/#gateways). 

```
$ kubectl apply -f samples/bookinfo/networking/bookinfo-gateway.yaml
gateway.networking.istio.io/bookinfo-gateway created
virtualservice.networking.istio.io/bookinfo created
```

Now that our external routing is configured, we can find out the hostname of the Istio ingress gateway's Elastic Load Balancer (ELB), and open it in a browser to connect to our sample application:

```
$ export INGRESS_ELB=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
$ open http://$INGRESS_ELB/productpage
```

You should see a new browser window, containing the sample application

![istio-sample-app](/images/istio-sample-application.png)