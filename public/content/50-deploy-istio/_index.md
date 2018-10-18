+++
title = "Deploy Istio"
chapter = false
weight = 50
+++

Istio is a service mesh for Kubernetes. It helps route and secure traffic between microservices, as well as provide great visibility into how your microservices are communicating (traffic throughput, error rates, latencies etc).

It's particularly useful in the context of canary deployments, as it will allow us to easily route a percentage of our application traffic (e.g. 5%) to the canary deployment at a per-request granularity.

In general, Istio provides the following:

## Traffic management
Istio’s easy rules configuration and traffic routing lets you control the flow of traffic and API calls between services. Istio simplifies configuration of service-level properties like circuit breakers, timeouts, and retries, and makes it a breeze to set up important tasks like A/B testing, canary rollouts, and staged rollouts with percentage-based traffic splits.

With better visibility into your traffic, and out-of-box failure recovery features, you can catch issues before they cause problems, making calls more reliable, and your network more robust – no matter what conditions you face.

## Security
Istio’s security capabilities free developers to focus on security at the application level. Istio provides the underlying secure communication channel, and manages authentication, authorization, and encryption of service communication at scale. With Istio, service communications are secured by default, letting you enforce policies consistently across diverse protocols and runtimes – all with little or no application changes.

While Istio is platform independent, using it with Kubernetes (or infrastructure) network policies, the benefits are even greater, including the ability to secure pod-to-pod or service-to-service communication at the network and application layers.

## Observability
Istio’s robust tracing, monitoring, and logging give you deep insights into your service mesh deployment. Gain a real understanding of how service performance impacts things upstream and downstream with Istio’s monitoring features, while its custom dashboards provide visibility into the performance of all your services and let you see how that performance is affecting your other processes.

![istio-dashboard](/images/istio-service-dashboard.png)

All these features let you more effectively set, monitor, and enforce SLOs on services. Of course, the bottom line is that you can detect and fix issues quickly and efficiently.