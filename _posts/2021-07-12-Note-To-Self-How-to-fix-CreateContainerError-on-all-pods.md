---
layout: post
title: "Note To Self: How To Fix `CreateContainerError` On All Pods"
date: 2021-07-12 15:59:54.000000000 +02:00
tags:

---
# Note To Self: How To Fix `CreateContainerError` On All Pods.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2021-07-12-Note-To-Self-How-to-fix-CreateContainerError-on-all-pods.png" | absolute_url }})
{: refdef}

3 Min Read

-----------------------------------------------------------------------------------------

# The Story

I recently upgraded the version of `k3s` on my Vagrant box and as soon as I deployed my application, I got the dreaded `CreateContainerError` on all pods.

# The How

A recent update of `k3s` threw me of when all of my pods resulted in `CreateContainerError`. 

```bash
$ k3s --version

k3s version v1.21.2+k3s1 (5a67e8dc)
go version go1.16.4
```

Checking the status of my pods with [k9s](https://github.com/derailed/k9s):
```bash
k9s --kubeconfig ~/.kube/config
```

![image](https://user-images.githubusercontent.com/7910856/125294488-9864c200-e324-11eb-9f0f-b15d1aa578e3.png)

Upon investigation I discovered that there's been a recent update on Kubernetes which [restricts a container's access to resources with AppArmor](https://kubernetes.io/docs/tutorials/clusters/apparmor/).

**AppArmor** (Application Armor) is a Linux security module that protects an operating system and its applications from security threats.

According to the [Kubernetes docs](https://kubernetes.io/docs/tutorials/clusters/apparmor/):
> AppArmor is a Linux kernel security module that supplements the standard Linux user and group based permissions to confine programs to a limited set of resources. AppArmor can be configured for any application to reduce its potential attack surface and provide greater in-depth defence. It is configured through profiles tuned to allow the access needed by a specific program or container, such as Linux capabilities, network access, file permissions, etc. Each profile can be run in either enforcing mode, which blocks access to disallowed resources, or complain mode, which only reports violations.

>AppArmor can help you to run a more secure deployment by restricting what containers are allowed to do, and/or provide better auditing through system logs. However, it is important to keep in mind that AppArmor is not a silver bullet and can only do so much to protect against exploits in your application code. It is important to provide good, restrictive profiles, and harden your applications and cluster from other angles as well.

Read more about AppAmor [here](#references).

Running `describe pod` or `get events`, I got the error message:
`Error: failed to create containerd container: get apparmor_parser version: exec: "apparmor_parser": executable file not found in $PATH`

```bash
kubectl describe pod backend-75fbb7ff65-ss2fk | grep -A20 "Events"
```

![image](https://user-images.githubusercontent.com/7910856/125299733-b7198780-e329-11eb-8032-92b93c5bea98.png)

# The Walk-through

Installing `apparmor` fixed the issue. 

- Debian/Ubuntu

```bash
sudo apt install apparmor apparmor-utils
```
- OpenSuse

```bash
sudo zypper --non-interactive install apparmor-parser
```

# References

- [AppArmor: Linux kernel security module](https://www.apparmor.net/)
- [Restrict a Container's Access to Resources with AppArmor](https://kubernetes.io/docs/tutorials/clusters/apparmor/)
- [Understanding AppArmor in Ubuntu [Linux]](https://www.maketecheasier.com/understanding-apparmor-in-ubuntu-linux)
