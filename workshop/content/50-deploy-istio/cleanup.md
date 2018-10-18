---
title: "Cleanup Sample Application"
date: 2018-08-07T13:31:55-07:00
weight: 40
---

Now that we have played around with the Istio sample application, we can undeploy the external gateway we created for it by running:

```
$ kubectl delete -f samples/bookinfo/networking/bookinfo-gateway.yaml
gateway.networking.istio.io "bookinfo-gateway" deleted
virtualservice.networking.istio.io "bookinfo" deleted
```

and then delete the sample application itself with:

```
$ kubectl delete -f <(istioctl kube-inject -f samples/bookinfo/platform/kube/bookinfo.yaml)
service "details" deleted
deployment.extensions "details-v1" deleted
service "ratings" deleted
deployment.extensions "ratings-v1" deleted
service "reviews" deleted
deployment.extensions "reviews-v1" deleted
deployment.extensions "reviews-v2" deleted
deployment.extensions "reviews-v3" deleted
service "productpage" deleted
deployment.extensions "productpage-v1" deleted
```