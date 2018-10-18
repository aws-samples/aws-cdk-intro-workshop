---
title: "Configure RBAC"
date: 2018-08-07T13:31:55-07:00
weight: 10
---

Before we deploy Helm to our Kubernetes cluster, we need to setup Role Based Access Control (RBAC) permissions for it. This will give the `Tiller` component of Helm the permissions it needs within the cluster to deploy applications.

Recent versions of Kubernetes employ a role-based access control (or RBAC) system (as do modern operating systems) to help mitigate the damage that can be done if credentials are misused or bugs exist. Even where an identity is hijacked, the identity has only so many permissions to a controlled space. This effectively adds a layer of security to limit the scope of any attack with that identity.

Helm and Tiller are designed to install, remove, and modify logical applications that can contain many services interacting together. As a result, often its usefulness involves cluster-wide operations, which in a multitenant cluster means that great care must be taken with access to a cluster-wide Tiller installation to prevent improper activity.

In order to grant Helm the permissions it needs, we need to create a dedicated [ServiceAccount](https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/) for it. We'll also deploy a [ClusterRoleBinding](https://kubernetes.io/docs/reference/access-authn-authz/rbac/), which will grant `cluster-admin` permissions to the tiller service account. 

```
cat <<EOF | kubectl create -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: tiller
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: tiller
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: tiller
    namespace: kube-system
EOF
```

You should see the following output, confirming that the service account and permissions were configured correctly:

```
serviceaccount/tiller created
clusterrolebinding.rbac.authorization.k8s.io/tiller created
```