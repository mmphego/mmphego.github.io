---
layout: post
title: "Note To Self: How To Stop A Running Pod On Kubernetes"
date: 2021-05-18 04:36:19.000000000 +02:00
tags:

---
# Note To Self: How To Stop A Running Pod On Kubernetes.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2021-05-18-Note-To-Self:-How-to-stop-a-running-pod-on-kubernetes.png" | absolute_url }})
{: refdef}

3 Min Read

-----------------------------------------------------------------------------------------

# The Story

OMG, I just ran a Kubernetes command from the wild and now I cannot seem to stop or delete the running pod (that was me when my CPU fan sounded like an industrial fan). 

So, this is what happened right. I have a [RKE Kubernetes](https://rancher.com/products/rke/) cluster running on a Vagrant box and I thought to myself. Why not try to use it to mine a few cryptos while at it; since the crypto business has been booming recently.

So the idea was to test it on my Vagrant box, and some how let it find its way to run it elsewhere so that I can mine while I sleep and then one day wake up as a Gajillionare or something close.

Note To Self: Never blindly run commands on your system especially from the wild.

## TL;DR

```bash
# Set a new size for a Deployment, ReplicaSet, Replication Controller, or StatefulSet.
kubectl scale --help
```

# The How

Running a basic `kubectl run` command to bring up a few mining pods where `rke_config_cluster.yml` is my RKE config file.

```bash
#start monero_cpu_moneropool
kubectl run --kubeconfig rke_config_cluster.yml moneropool --image=servethehome/monero_cpu_moneropool:latest --replicas=1
#start minergate
kubectl run --kubeconfig rke_config_cluster.yml minergate --image=servethehome/monero_cpu_minergate:latest --replicas=1
#start cryptotonight
kubectl run --kubeconfig rke_config_cluster.yml minergate --image=servethehome/universal_cryptonight:latest --replicas=1
```

After realising that my CPU was choking, I then tried to stop the mining pods.

![image](https://user-images.githubusercontent.com/7910856/118583866-09a94e00-b796-11eb-8c16-5cfef8008c24.png)

Little did I know that, Kubernetes doesn't support stop/pause of current state of pod(s). Then I started deleting the pods thinking that this will automagically stop and delete the pods and sure enough that didn't work.

![image](https://user-images.githubusercontent.com/7910856/118583540-85ef6180-b795-11eb-9e77-dcaa69607795.png)

That's when it hinted me, that the command I copied ensures that there's always 1 replica running which was why the pods kept on being re-spawned.

# The Walk-through

I managed to stop all my mining pods by ensuring that there are no working deployments which is simply done by setting number of replicas to 0. Duh!!!

```bash
kubectl --kubeconfig=rke_config_cluster.yml  scale --replicas=0 deployment minergate moneropool
kubectl --kubeconfig=rke_config_cluster.yml  scale --replicas=0 replicaset minergate-686c565775 moneropool-69fbc5b6d5
```

![image](https://user-images.githubusercontent.com/7910856/118584808-fa2b0480-b797-11eb-9bee-13bfb4661286.png)

Checking all running pods again, I can see that my mining pods have been paused/stopped.

![image](https://user-images.githubusercontent.com/7910856/118584763-e5e70780-b797-11eb-90ec-3b8109a8efb9.png)

And that's how I failed to become a Gajillionare, maybe I should just run this in a production environment bwagagagaga!

# Reference

- [Rancher Kubernetes Engine (RKE)](https://rancher.com/products/rke/)
- []()
