---
title: "Istio Dashboard"
weight: 30
---

Istio automatically collects metrics for our microservices, including throughput, error rates and latencies. To help visualise and these metrics, Istio comes preconfigured with some handy [Grafana](https://grafana.com/) dashboards. 

These dashboards are not exposed to the outside world by default, so we need to port-forward from our local machine to the Grafana pod in order to access them.

```
$ kubectl -n istio-system port-forward $(kubectl -n istio-system get pod -l app=grafana -o jsonpath='{.items[0].metadata.name}') 3000:3000
$ open http://localhost:3000/d/1/istio-mesh-dashboard
```

You should see a browser window pop up, with the Istio mesh dashboard. This page gives a general overview of all of the Istio-enabled services deployed in your Kubernetes cluster.

![istio-mesh-dashboard](/images/istio-mesh-dashboard.png)

If you click on a service, you can drill down and see the metrics available for that individual service. This includes things like top requests, request sources, latencies and error rates.

![istio-service-dashboard](/images/istio-service-dashboard.png)

We will use these metrics later on when configuring our canary deployments, to make sure that any new versions of our applications we deploy don't have a negative impact on application performance.