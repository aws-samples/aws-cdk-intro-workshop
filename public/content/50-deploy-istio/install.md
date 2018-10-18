---
title: "Install with Helm"
date: 2018-08-07T13:31:55-07:00
weight: 10
---

The first step towards installing Istio, is to download the latest release

```
$ curl -L https://git.io/getLatestIstio | sh -
```

This will create a folder in your current directory. At the time of writing, the latest version was `1.0.1`, and the command above created a directory `istio-1.0.1`. We need to add the directory to our path, so we can use the `istioctl` binary, but also cd into the directory to continue.

```
$ cd istio-1.0.1
$ export PATH=$PATH:$(pwd)/bin
$ istioctl version
Version: 1.0.1
GitRevision: 42773aacced474d97159902d20579a25b1f98106
User: root@832d5020b1d4
Hub: gcr.io/istio-release
GolangVersion: go1.10.1
BuildStatus: Clean
```

Once we're in the `istio-1.0.1` directory, we can use Helm to easily install (and upgrade in the future) Helm within our Kubernetes cluster.

```
$ helm install install/kubernetes/helm/istio \
    --name istio \
    --namespace istio-system \
    --set global.configValidation=false \
    --set sidecarInjectorWebhook.enabled=false \
    --set grafana.enabled=true
```

This will deploy Istio, Prometheus (for metric collection) and Grafana (for dashboards).

{{% notice info %}}
Istio works by attaching a sidecar container to pods you run within your cluster. This sidecar container manages traffic flows, and logs metrics. Istio supports automatically attaching this sidecar container to every pod through a Kubernetes feature called [Mutating Admission Webhooks](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#mutatingadmissionwebhook-beta-in-1-9). These are not currently supported with Amazon EKS (as of Sept 2018), which is why the `--set sidecarInjectorWebhook.enabled=false` flag is required.
{{% /notice %}}

We can validate that Istio deployed success, by running `kubectl get all -n istio-system`

```
$ kubectl get all --namespace istio-system
NAME                                            READY     STATUS    RESTARTS   AGE
pod/grafana-56d946d5b6-fxjb8                    1/1       Running   0          10m
pod/istio-citadel-769b85bf84-rkh2q              1/1       Running   0          10m
pod/istio-egressgateway-677c95648f-qh66g        1/1       Running   0          10m
pod/istio-galley-5c65774d47-jmpk8               1/1       Running   0          10m
pod/istio-ingressgateway-6fd6575b8b-88tp4       1/1       Running   0          10m
pod/istio-pilot-65f4cfb764-p6rb2                2/2       Running   0          10m
pod/istio-policy-5b9945744b-4984m               2/2       Running   0          10m
pod/istio-statsd-prom-bridge-7f44bb5ddb-hmtkk   1/1       Running   0          10m
pod/istio-telemetry-5fc7ccc5b7-4l2pc            2/2       Running   0          10m
pod/prometheus-84bd4b9796-9f7cr                 1/1       Running   0          10m

NAME                               TYPE           CLUSTER-IP       EXTERNAL-IP                                                              PORT(S)                                                                        AGE
service/grafana                    ClusterIP      10.100.80.106    <none>                                                                   3000/TCP                                                                        10m
service/istio-citadel              ClusterIP      10.100.26.178    <none>                                                                   8060/TCP,9093/TCP                                                                        10m
service/istio-egressgateway        ClusterIP      10.100.207.80    <none>                                                                   80/TCP,443/TCP                                                                        10m
service/istio-galley               ClusterIP      10.100.78.152    <none>                                                                   443/TCP,9093/TCP                                                                        10m
service/istio-ingressgateway       LoadBalancer   10.100.177.45    a9a6f7806b29211e8aee9021fe026032-921576903.eu-west-1.elb.amazonaws.com   80:31380/TCP,443:31390/TCP,31400:31400/TCP,15011:30083/TCP,8060:31588/TCP,853:30615/TCP,15030:31985/TCP,15031:32034/TCP   10m
service/istio-pilot                ClusterIP      10.100.249.226   <none>                                                                   15010/TCP,15011/TCP,8080/TCP,9093/TCP                                                                        10m
service/istio-policy               ClusterIP      10.100.225.35    <none>                                                                   9091/TCP,15004/TCP,9093/TCP                                                                        10m
service/istio-statsd-prom-bridge   ClusterIP      10.100.165.99    <none>                                                                   9102/TCP,9125/UDP                                                                        10m
service/istio-telemetry            ClusterIP      10.100.188.26    <none>                                                                   9091/TCP,15004/TCP,9093/TCP,42422/TCP                                                                        10m
service/prometheus                 ClusterIP      10.100.73.203    <none>                                                                   9090/TCP                                                                        10m

NAME                                       DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/grafana                    1         1         1            1           10m
deployment.apps/istio-citadel              1         1         1            1           10m
deployment.apps/istio-egressgateway        1         1         1            1           10m
deployment.apps/istio-galley               1         1         1            1           10m
deployment.apps/istio-ingressgateway       1         1         1            1           10m
deployment.apps/istio-pilot                1         1         1            1           10m
deployment.apps/istio-policy               1         1         1            1           10m
deployment.apps/istio-statsd-prom-bridge   1         1         1            1           10m
deployment.apps/istio-telemetry            1         1         1            1           10m
deployment.apps/prometheus                 1         1         1            1           10m

NAME                                                  DESIRED   CURRENT   READY     AGE
replicaset.apps/grafana-56d946d5b6                    1         1         1         10m
replicaset.apps/istio-citadel-769b85bf84              1         1         1         10m
replicaset.apps/istio-egressgateway-677c95648f        1         1         1         10m
replicaset.apps/istio-galley-5c65774d47               1         1         1         10m
replicaset.apps/istio-ingressgateway-6fd6575b8b       1         1         1         10m
replicaset.apps/istio-pilot-65f4cfb764                1         1         1         10m
replicaset.apps/istio-policy-5b9945744b               1         1         1         10m
replicaset.apps/istio-statsd-prom-bridge-7f44bb5ddb   1         1         1         10m
replicaset.apps/istio-telemetry-5fc7ccc5b7            1         1         1         10m
replicaset.apps/prometheus-84bd4b9796                 1         1         1         10m

NAME                                                       REFERENCE                         TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
horizontalpodautoscaler.autoscaling/istio-egressgateway    Deployment/istio-egressgateway    <unknown>/80%   1         5         1          10m
horizontalpodautoscaler.autoscaling/istio-ingressgateway   Deployment/istio-ingressgateway   <unknown>/80%   1         5         1          10m
horizontalpodautoscaler.autoscaling/istio-pilot            Deployment/istio-pilot            <unknown>/80%   1         5         1          10m
horizontalpodautoscaler.autoscaling/istio-policy           Deployment/istio-policy           <unknown>/80%   1         5         1          10m
horizontalpodautoscaler.autoscaling/istio-telemetry        Deployment/istio-telemetry        <unknown>/80%   1         5         1          10m
```