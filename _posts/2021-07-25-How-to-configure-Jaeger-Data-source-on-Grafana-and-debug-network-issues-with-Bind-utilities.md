---
layout: post
title: "How To Configure Jaeger Data Source On Grafana And Debug Network Issues With Bind-utilities"
date: 2021-07-25 14:34:46.000000000 +02:00
tags:
- DevOps
- Grafana
- Jaeger
- Kubernetes
- Linux
- Prometheus
- Tips and Tricks
---
# How To Configure Jaeger Data Source On Grafana And Debug Network Issues With Bind-utilities.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2021-07-25-How-to-configure-Jaeger-Data-source-on-Grafana-and-debug-network-issues-with-Bind-utilities.png" | absolute_url }})
{: refdef}


11 Min Read


 <a href="https://imp.i115008.net/c/2851051/877657/11298" target="_top" id="877657"><img src="//a.impactradius-go.com/display-ad/11298-877657" border="0" alt="" width="100%" height="90"/></a><img height="0" width="0" src="https://imp.pxf.io/i/2851051/877657/11298" style="position:absolute;visibility:hidden;" border="0" />

---

# The Story

As a [mentor for a Udacity nanodegree](https://blog.mphomphego.co.za/blog/2021/01/03/How-I-became-a-Udacity-Mentor.html), I realized that most students had difficulties adding [Jaeger](https://www.jaegertracing.io) tracing [data source](https://grafana.com/docs/grafana/latest/datasources/) on Grafana & Prometheus running in a Kubernetes cluster.

According to the [docs](https://www.jaegertracing.io/docs/1.24/):
> Jaeger is a distributed tracing system released as open source by Uber Technologies. It is used for monitoring and troubleshooting microservices-based distributed systems, including distributed context propagation, distributed transaction monitoring, root cause analysis, service dependency analysis and performance/latency optimization

At this point, one might be wondering what _distributed tracing_ is?

> An understanding of application behaviour can be a fascinating task in a microservice architecture. This is because incoming requests may cover several services, and on this request, each intermittent service may have one or more operations. This makes it more difficult and requires more time to resolve problems.
>
> Distributed tracking helps gain insight into each process and identifies failure regions caused by poor performance.

I, therefore, decided to document this guide below which takes you through the installation of Jaeger to incorporate it into Grafana and troubleshooting.

**Note:** This post will not be about using Jaeger for distributed tracing and backend/frontend application performance/latency optimization. If that's something that interests you then check out this [post](https://www.digitalocean.com/community/tutorials/how-to-implement-distributed-tracing-with-jaeger-on-kubernetes) very useful.

**Note:** This post assumes that:

- You are familiar with Kubernetes
- You have a running Kubernetes cluster and,
- You have already installed Grafana and Prometheus on the cluster

If not, refer to a previous post on how to [install Prometheus & Grafana using Helm 3 on Kubernetes cluster running on Vagrant VM](https://blog.mphomphego.co.za/blog/2021/02/01/Install-Prometheus-and-Grafana-with-helm-3-on-Kubernetes-cluster-running-on-Vagrant-VM.html)

 <a href="https://imp.i115008.net/c/2851051/877657/11298" target="_top" id="877657"><img src="//a.impactradius-go.com/display-ad/11298-877657" border="0" alt="" width="100%" height="90"/></a><img height="0" width="0" src="https://imp.pxf.io/i/2851051/877657/11298" style="position:absolute;visibility:hidden;" border="0" />


## The Walk-through

This section is divided into 4 parts:

- [How To Configure Jaeger Data Source On Grafana And Debug Network Issues With Bind-utilities.](#how-to-configure-jaeger-data-source-on-grafana-and-debug-network-issues-with-bind-utilities)
- [The Story](#the-story)
  - [The Walk-through](#the-walk-through)
    - [Installing Jaeger Operator on Kubernetes](#installing-jaeger-operator-on-kubernetes)
    - [Access Jaeger UI on Browser](#access-jaeger-ui-on-browser)
    - [Configuring Jaeger Data Source on Grafana](#configuring-jaeger-data-source-on-grafana)
    - [Debugging and Troubleshooting](#debugging-and-troubleshooting)
- [Reference](#reference)

### Installing Jaeger Operator on Kubernetes

First, we will need to install [Jaeger Operator](https://www.jaegertracing.io/docs/1.24/operator/#understanding-operators).
> The Jaeger Operator is an implementation of a [Kubernetes Operator](https://www.openshift.com/learn/topics/operators). Operators are pieces of software that ease the operational complexity of running another piece of software. More technically, Operators are a method of packaging, deploying, and managing a Kubernetes application.

The command below will create the `observability` namespace and install the Jaeger Operator ([CRD](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#customresourcedefinitions) for `apiVersion: jaegertracing.io/v1`) in the same namespace.

```bash
export namespace=observability
kubectl create namespace ${namespace}
kubectl create -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/master/deploy/crds/jaegertracing.io_jaegers_crd.yaml
kubectl create -n ${namespace} -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/master/deploy/service_account.yaml
kubectl create -n ${namespace} -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/master/deploy/role.yaml
kubectl create -n ${namespace} -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/master/deploy/role_binding.yaml
kubectl create -n ${namespace} -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/master/deploy/operator.yaml

kubectl create -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/master/deploy/cluster_role.yaml
kubectl create -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/master/deploy/cluster_role_binding.yaml
```

Once we have created the `jaeger-operator` deployment, we need to create a Jaeger instance, see snippet below:

```bash
mkdir -p jaeger-tracing
cat >> jaeger-tracing/jaeger.yaml <<EOF
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: my-traces
  namespace: ${namespace}
EOF
kubectl apply -n ${namespace} -f jaeger-tracing/jaeger.yaml
```

Once the Jaeger instance named `my-traces` has been created, we can verify that pods and services are running successfully by running:

```bash
kubectl get -n ${namespace} pods,svc
```

![image](https://user-images.githubusercontent.com/7910856/126912022-8d52fab8-be88-4aad-b9bf-7830ff292f59.png)

The Jaeger UI is served via the [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/).

> An Ingress exposes HTTP and HTTPS routes from outside the cluster to services within the cluster. We can verify that an ingress service exists, by running:

```bash
kubectl get -n ${namespace} ingress -o yaml | tail
```

![image](https://user-images.githubusercontent.com/7910856/126898255-a23f5002-8600-4f04-a90b-335017ffe341.png)

**Note:** The service name and port number will be useful later when setting up data sources on Grafana.

 <a href="https://imp.i115008.net/c/2851051/895506/11298" target="_top" id="895506"><img src="//a.impactradius-go.com/display-ad/11298-895506" border="0" alt="" width="100%" height="90"/></a><img height="0" width="0" src="https://imp.pxf.io/i/2851051/895506/11298" style="position:absolute;visibility:hidden;" border="0" />
### Access Jaeger UI on Browser

(for testing purposes) we can [port-forward](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#port-forward) it such that we access it on our localhost host by running the command:

```bash
kubectl port-forward -n ${namespace} \
    $(kubectl get pods -n ${namespace} -l=app="jaeger" -o name) --address 0.0.0.0 16686:16686
```

Then on our browser, we can access the Jaeger UI to validate the installation was successful.

![image](https://user-images.githubusercontent.com/7910856/126910823-696351d9-f8eb-4410-a0d4-380aadcfeebd.png)

---

### Configuring Jaeger Data Source on Grafana

To configure Jaeger as a data source, we need to retrieve the [Jaeger query](https://www.jaegertracing.io/docs/1.24/architecture/#query) service name as this will be used to query a DNS record for Kubernetes service and port.
> _Query_ is a service that retrieves traces from storage and hosts a UI to display them.

According to [Kubernetes docs](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#introduction):
> Every Service defined in the cluster (including the DNS server itself) is assigned a DNS name. By default, a client Pod's DNS search list includes the Pod's namespace and the cluster's default domain.

We can retrieve a full DNS name for the [Jaeger Query](https://www.jaegertracing.io/docs/1.24/architecture/#query) endpoint which we will use as our data source URL on Grafana

According to [Kubernetes docs](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#namespaces-of-services):
> A DNS query may return different results based on the namespace of the pod making it. DNS queries that don't specify a namespace are limited to the pod's namespace. Access services in other namespaces by specifying them in the DNS query.

The code below compiles the DNS for the Jaeger query [_service_](https://kubernetes.io/docs/concepts/services-networking/service/) which exists in the `observability` namespace running on a _local cluster_.
> In Kubernetes, a Service is an abstraction that defines a logical set of Pods and a policy by which to access them (sometimes this pattern is called a micro-service).

Notice, the pattern `<service_name>.<namespace>.svc.cluster.local`

```bash
ingress_name=$(kubectl get -n ${namespace} ingress -o jsonpath='{.items[0].metadata.name}'); \
ingress_port=$(kubectl get -n ${namespace} ingress -o jsonpath='{.items[0].spec.defaultBackend.service.port.number}'); \
echo -e "\n\n${ingress_name}.${namespace}.svc.cluster.local:${ingress_port}"
```

![image](https://user-images.githubusercontent.com/7910856/126897017-513166bb-01da-4515-a336-00e9e6f3b60c.png)


Copy the echoed URL (including port number) above and open Grafana UI to add the data source, ensure that the link is successful by selecting `save&test`.

![image](https://user-images.githubusercontent.com/7910856/126897423-6f3ef0bd-9b25-4597-bbf5-5990eecae0ff.png)

Should you encounter an error "**Jaeger: Bad Gateway. 502. Bad Gateway**" or similar go to [debugging and troubleshooting](#debugging-and-troubleshooting)

The image below shows a successful integration, where we can query Jaeger [Span](https://www.jaegertracing.io/docs/1.24/architecture/#span) traces on Grafana.
> A span represents a logical unit of work in Jaeger that has an operation name, the start time of the operation, and the duration. Spans may be nested and ordered to model causal relationships.

![image](https://user-images.githubusercontent.com/7910856/126897982-7e76451e-df9c-449f-a8d8-b7d25cc7241d.png)

 <a href="https://imp.i115008.net/c/2851051/895506/11298" target="_top" id="895506"><img src="//a.impactradius-go.com/display-ad/11298-895506" border="0" alt="" width="100%" height="90"/></a><img height="0" width="0" src="https://imp.pxf.io/i/2851051/895506/11298" style="position:absolute;visibility:hidden;" border="0" />
### Debugging and Troubleshooting

- Jaeger docs contain a list of commonly encountered issues, hit this [link](https://www.jaegertracing.io/docs/1.24/troubleshooting/) for more information.
- If your issues are relating to [DNS](https://www.cloudflare.com/learning/dns/what-is-dns/). Please ensure that `kube-dns` is running, all Service objects have an in-cluster DNS name of `<service_name>.<namespace>.svc.cluster.local` so all other things would address your `<service_name>` in the `<namespace>`.

![image](https://user-images.githubusercontent.com/7910856/126915101-31bc70dc-8584-4ddd-a3e5-d47d59e0d362.png)

- For the next task, we will need to run a Docker container in our cluster which provides a list of useful [BIND](https://en.wikipedia.org/wiki/BIND) utilities such as `dig`, `host` and `nslookup` within the cluster.

After a few Google searches, I found this popular container below and decided to use it for my debugging after I've investigated and vetted it for any malicious packages.

Read more about [how to harden the security of your Docker environment](https://blog.mphomphego.co.za/blog/2021/03/28/How-I-hardened-the-security-of-my-Docker-environment.html)

![image](https://user-images.githubusercontent.com/7910856/126897185-2f71afe1-5012-4fd0-af5f-ea78bf67b167.png)

Running the command below will invoke a `bash` shell on the newly created pod-based of the `dnsutils` Docker image:

```bash
vagrant@dashboard:~> kubectl run dnsutils --image tutum/dnsutils -ti -- bash
```

**Note:** I am running [k3s](https://rancher.com/docs/k3s/latest/en/) on a Vagrant box. In the case, you are not familiar with k3s,
> K3s, is designed to be a single binary of less than 40MB that completely implements the Kubernetes API. To achieve this, they removed a lot of extra drivers that didn't need to be part of the core and are easily replaced with add-ons.
>
> K3s is a fully CNCF (Cloud Native Computing Foundation) certified Kubernetes offering. This means that you can write your YAML to operate against a regular "full-fat" Kubernetes, and they'll also apply against a k3s cluster.

Anyways, let's not get side-tracked. If you have used Docker before, think of `kubectl run` as an alternate `docker run`; it creates and runs a particular image in a pod.

The commands below will query various DNS records using [`dig` (Domain Information Groper)](https://linuxize.com/post/how-to-use-dig-command-to-query-dns-in-linux/) utility, which will return a list of IP addresses of the [A Record](https://en.wikipedia.org/wiki/List_of_DNS_record_types) which exists on the Kubernetes domain (`*.*.svc.cluster.local`), then print the full hostname to STDOUT records that contain `observability` namespace.

```bash
root@dnsutils:/# namespace=observability
root@dnsutils:/# for IP in $(dig +short *.*.svc.cluster.local); do
    HOSTS=$(host $IP)
    if grep -q "${namespace}" <<< "$HOSTS"; then
        echo "${HOSTS}";
    fi;
done
```

Below is an image, highlighting the hostname of a particular service of interest, which is `my-traces-query.observability.svc.cluster.local`

![image](https://user-images.githubusercontent.com/7910856/126897114-e91d582b-4e34-4f08-aaa9-1e2e0141260c.png)

Then investigate the port: `16686` on the hostname if it's up by using [nmap](https://nmap.org/) utility. But since `nmap` doesn't come preinstalled in the container then we can manually install it.

```bash
root@dnsutils:/# apt update -qq && apt install -y nmap
```

After we have installed the utility we can scan the port that Jaeger query should be running on as shown in [Configuring Jaeger Data Source on Grafana](#configuring-jaeger-data-source-on-grafana).

```bash
root@dnsutils:/# nmap -p 16686 my-traces-query.observability.svc.cluster.local
```

The image below shows that port `16686` is open and running this validates that we can access the Jaeger query either via the UI or as a Grafana data source.

![image](https://user-images.githubusercontent.com/7910856/126897246-965994e6-01bf-4804-9dff-cc035549e87c.png)

I will try to update this post with new ways to debug as I find my ways around Kubernetes, Jaeger and Grafana.

If you have any suggestions, leave a comment below and we will get in touch.

 <a href="https://imp.i115008.net/c/2851051/887756/11298" target="_top" id="887756"><img src="//a.impactradius-go.com/display-ad/11298-887756" border="0" alt="" width="100%" height="90"/></a><img height="0" width="0" src="https://imp.pxf.io/i/2851051/887756/11298" style="position:absolute;visibility:hidden;" border="0" />
# Reference

- [Grafana Data Sources](https://www.metricfire.com/blog/grafana-data-sources/)
- [Jaeger: Operator for Kubernetes](https://www.jaegertracing.io/docs/1.24/operator/)
- [What are Custom Resource Definitions?](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#customresourcedefinitions)
- [Tracing in Grafana with Tempo and Jaeger](https://dev.to/infracloud/tracing-in-grafana-with-tempo-and-jaeger-ec)
- [A Guide to Deploying Jaeger on Kubernetes in Production](https://medium.com/jaegertracing/a-guide-to-deploying-jaeger-on-kubernetes-in-production-69afb9a7c8e5)
- [Distributed Tracing with Jaeger on Kubernetes](https://abirami-ece-09.medium.com/distributed-tracing-with-jaeger-on-kubernetes-b6364b3719d4)
- [Build a monitoring infrastructure for your Jaeger installation](https://developers.redhat.com/blog/2019/08/28/build-a-monitoring-infrastructure-for-your-jaeger-installation#create_a_podmonitor)
- [How To Implement Distributed Tracing with Jaeger on Kubernetes](https://www.digitalocean.com/community/tutorials/how-to-implement-distributed-tracing-with-jaeger-on-kubernetes)
- [An Introduction to the Kubernetes DNS Service](https://www.digitalocean.com/community/tutorials/an-introduction-to-the-kubernetes-dns-service)
- [Kubernetes DNS for Services and Pods](https://medium.com/kubernetes-tutorials/kubernetes-dns-for-services-and-pods-664804211501)
- [How To Use Nmap to Scan for Open Ports](https://www.digitalocean.com/community/tutorials/how-to-use-nmap-to-scan-for-open-ports)
- [How to Scan & Find All Open Ports with Nmap](https://phoenixnap.com/kb/nmap-scan-open-ports)

 <a href="https://imp.i115008.net/c/2851051/828292/11298" target="_top" id="828292"><img src="//a.impactradius-go.com/display-ad/11298-828292" border="0" alt="" width="100%" height="90"/></a><img height="0" width="0" src="https://imp.pxf.io/i/2851051/828292/11298" style="position:absolute;visibility:hidden;" border="0" />
