---
layout: post
title: "Install Prometheus & Grafana With Helm 3 On Kubernetes Cluster Running On Vagrant VM"
date: 2021-01-16 06:08:40.000000000 +02:00
tags:
- Kubernetes
- Vagrant
- K8s
- DevOps

---
# Install Prometheus & Grafana With Helm 3 On Kubernetes Cluster Running On Vagrant VM.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2021-01-16-Install-Prometheus-and-Grafana-with-helm-3-on-Kubernetes-cluster-running-on-Vagrant-VM.png" | absolute_url }})
{: refdef}

<<TIME TO READ>>

-----------------------------------------------------------------------------------------

# The Story

We would like to install the monitoring tool [Prometheus](https://prometheus.io/docs/introduction/overview/) and [Grafana](https://grafana.com/) with [helm 3](https://v3.helm.sh/) on our local machine/VM running a [Kubernetes](https://kubernetes.io/) cluster.

## TL;DR


# The How

## Prerequisites
For this application, we need a Kubernetes cluster running locally and to interface with it via `kubectl`. The list below shows some of the tools that we'll need to use for getting our environment set up properly.

- We will use [Vagrant](https://www.vagrantup.com/docs/installation) 
- With [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
- To run [K3s](https://k3s.io/) and,
- Interface with it via [`kubectl`](https://rancher.com/docs/rancher/v2.x/en/cluster-admin/cluster-access/kubectl/)


```ruby
cat Vagrantfile 

# -*- mode: ruby -*-
# vi: set ft=ruby :
default_box = "generic/opensuse42"

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://vagrantcloud.com/search.

  config.vm.define "master" do |master|
    master.vm.box = default_box
    master.vm.hostname = "master"
    master.vm.network 'private_network', ip: "192.168.0.200",  virtualbox__intnet: true
    master.vm.network "forwarded_port", guest: 22, host: 2222, id: "ssh", disabled: true
    master.vm.network "forwarded_port", guest: 22, host: 2000 # Master Node SSH
    master.vm.network "forwarded_port", guest: 6443, host: 6443 # API Access
    for p in 30000..30100 # expose NodePort IP's
      master.vm.network "forwarded_port", guest: p, host: p, protocol: "tcp"
      end
    master.vm.provider "virtualbox" do |v|
      v.memory = "2048"
      v.name = "k3s"
      end
    master.vm.provision "shell", inline: <<-SHELL
      sudo zypper refresh
      sudo zypper --non-interactive install bzip2
      sudo zypper --non-interactive install etcd
      sudo zypper --non-interactive install lsof
      
      echo "******** Begin installing k3s ********"
      curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.19.2+k3s1 K3S_KUBECONFIG_MODE="644" sh -
      echo "******** End installing k3s ********"

      echo "******** Begin installing helm ********"
      curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
      echo "******** End installing helm ********"
    SHELL
  end
end
```


```bash
vagrant up
```

The command will take a while and will leverage `VirtualBox` to load an [OpenSuse](https://www.opensuse.org/) OS and automatically install [K3s](https://k3s.io/) and [Helm 3](https://v3.helm.sh/).

# The Walk-through

**Install Prometheus with Helm3**

- Let's `ssh` into our freshly baked VM
```bash
vagrant ssh
```

- Let's create a namespace `monitoring` for bundling all monitoring tools
```bash
kubectl create namespace monitoring
```

- Install `prometheus` using `helm 3` on `monitoring` namespace
  | *Helm* is a popular package manager for Kubernetes (think `apt` for `Ubuntu` or `pip` for `Python`). It uses a templating language to make the managing of multiple Kubernetes items in a single application easier to package, install, and update.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add stable https://charts.helm.sh/stable
helm repo update
# Use k3s config file, normally this would be in `~/.kube/config`
helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --kubeconfig /etc/rancher/k3s/k3s.yaml
```

If the installation was successful you should be able to see **6** running pods:
- Alert manager: This allows us to create alerts with Prometheus
- Operator: This is the application itself
- Exporter: This is responsible for getting the logs from the nodes
- Graphana and other matrics tools

```bash
kubectl get pods --namespace=monitoring
```
![image](https://user-images.githubusercontent.com/7910856/104797733-080c5100-57c9-11eb-96ac-348502975c13.png)

and,
```bash
helm ls --namespace monitoring
```

![image](https://user-images.githubusercontent.com/7910856/104797759-3be77680-57c9-11eb-9c38-5bd7e9e8ac15.png)

Once everything is up and running we need to access *Graphana*.

It is highly advisable to use some kind of ingress to expose the services to the world, an example would be to use [NGINX](https://kubernetes.github.io/ingress-nginx/). 

But for the testing purposes, we can either use;
- `kubectl port-forward` or,
- Expose pods with [**NodePort** service](https://kubernetes.io/docs/concepts/services-networking/service/#nodeport). 

These are simple ways of forwarding a Kubernetes service's port to a local port on your machine.

**NOTE:** This is something you would never do in production but would regularly do in testing.

**Port-forwarding with `kubectl port-forward`**

`kubectl port-forward prometheus-prometheus-kube-prometheus-prometheus-0 --address 0.0.0.0 3000:80 -n monitoring`

![image](https://user-images.githubusercontent.com/7910856/104796952-3d15a500-57c3-11eb-8561-5590df88b02e.png)

**Port-forwarding with NodePort service**

Retrieve all services running on `monitoring` namespace

```bash
vagrant@master:~> kubectl get svc --namespace monitoring

NAME                                      TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)                      AGE
prometheus-kube-prometheus-prometheus     ClusterIP   10.43.27.175   <none>        9090/TCP                     40m
prometheus-kube-prometheus-alertmanager   ClusterIP   10.43.27.184   <none>        9093/TCP                     40m
prometheus-prometheus-node-exporter       ClusterIP   10.43.53.226   <none>        9100/TCP                     40m
prometheus-kube-state-metrics             ClusterIP   10.43.94.157   <none>        8080/TCP                     40m
alertmanager-operated                     ClusterIP   None           <none>        9093/TCP,9094/TCP,9094/UDP   40m
prometheus-operated                       ClusterIP   None           <none>        9090/TCP                     40m
prometheus-kube-prometheus-operator       ClusterIP    10.43.242.43   <none>        443/TCP                40m
prometheus-grafana                        ClusterIP    10.43.31.19    <none>        80/TCP                 40m
```

```bash
kubectl edit svc --namespace monitoring prometheus-grafana
```

Make some modification to the yaml config such that you can access graphana from your local machine:
- `type: ClusterIP` with `type: NodePort`, and 
- Change `nodePort` to `30100`

Do the same for `promethues-operator`:

```bash
kubectl edit svc --namespace monitoring prometheus-kube-prometheus-operator
```

Alternatively, you can patch the config. Read more [here](https://stackoverflow.com/a/51559833)

Verify that you can access the localhost through port `30100`

![image](https://user-images.githubusercontent.com/7910856/104797296-b1514800-57c5-11eb-8c81-257d17eb4d56.png)

Also check out more details [on best practices when accessing Applications in a Cluster.](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/)

## Troubleshooting

**Communicate with the K3s cluster through local `kubectl`**

After `vagrant up` is done, you will SSH into the Vagrant environment and retrieve the Kubernetes config file used by `kubectl`. We want to copy the contents of this file into our local environment so that `kubectl` knows how to communicate with the K3s cluster.

```bash
vagrant ssh
```

Print out the contents of the file. 

`sudo cat /etc/rancher/k3s/k3s.yaml`


On a separate terminal, create the file (or replace if it already exists) 

```bash
vim ~/.kube/config` 
```

and paste the contents of the `k3s.yaml` output here.

Afterwards, you can test that `kubectl` works by running `kubectl describe services`. It should not return any errors.

**Connection refused**

![image](https://user-images.githubusercontent.com/7910856/104796952-3d15a500-57c3-11eb-8561-5590df88b02e.png)

I encountered a few issues trying to access graphana through port-forwarding, This was related to the way I configured port-forwarding on vagrant. A walk-around is to either;
- Expand number of `forwarded_port` on `Vagrantfile` or
- Use existing `forwarded_port`'s available.

Lastly, check all listening ports, run `netstat -tulpn`:
```bash
vagrant@master:~> sudo netstat -tulpn

Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name   
tcp        0      0 127.0.0.1:10248         0.0.0.0:*               LISTEN      5596/k3s server     
tcp        0      0 127.0.0.1:10249         0.0.0.0:*               LISTEN      5596/k3s server     
tcp        0      0 0.0.0.0:30442           0.0.0.0:*               LISTEN      5596/k3s server     
tcp        0      0 127.0.0.1:10251         0.0.0.0:*               LISTEN      5596/k3s server     
tcp        0      0 127.0.0.1:10252         0.0.0.0:*               LISTEN      5596/k3s server     
tcp        0      0 127.0.0.1:6444          0.0.0.0:*               LISTEN      5596/k3s server     
tcp        0      0 127.0.0.1:10256         0.0.0.0:*               LISTEN      5596/k3s server     
tcp        0      0 0.0.0.0:30100           0.0.0.0:*               LISTEN      5596/k3s server     
tcp        0      0 0.0.0.0:30037           0.0.0.0:*               LISTEN      5596/k3s server     
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1015/sshd           
tcp        0      0 127.0.0.1:631           0.0.0.0:*               LISTEN      905/cupsd           
tcp        0      0 127.0.0.1:25            0.0.0.0:*               LISTEN      1002/master         
tcp        0      0 127.0.0.1:10010         0.0.0.0:*               LISTEN      5632/containerd     
tcp        0      0 0.0.0.0:32030           0.0.0.0:*               LISTEN      5596/k3s server     
tcp        0      0 :::10250                :::*                    LISTEN      5596/k3s server     
tcp        0      0 :::6443                 :::*                    LISTEN      5596/k3s server     
tcp        0      0 :::9100                 :::*                    LISTEN      8779/node_exporter  
tcp        0      0 :::22                   :::*                    LISTEN      1015/sshd           
udp        0      0 0.0.0.0:68              0.0.0.0:*                           658/wickedd-dhcp4   
udp        0      0 0.0.0.0:8472            0.0.0.0:*                           -                   
```

**Error: Kubernetes cluster unreachable with helm 3**

```bash
vagrant@master:~> helm list
Error: Kubernetes cluster unreachable: Get "http://localhost:8080/version?timeout=32s": dial tcp 127.0.0.1:8080: connect: connection refused
```

Let `helm` use the same config `kubectl` uses, this fixes it.

```bash
vagrant@master:~> kubectl config view --raw >~/.kube/config
```

# Access Graphana

**Note:** When installing via the Prometheus Helm chart, the default Grafana admin password is actually `prom-operator`

![image](https://user-images.githubusercontent.com/7910856/104797296-b1514800-57c5-11eb-8c81-257d17eb4d56.png)

![image](https://user-images.githubusercontent.com/7910856/104796998-85cd5e00-57c3-11eb-9a83-ab35b5b72baf.png)


# Reference

- []()
- []()