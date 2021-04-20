---
layout: post
title: "Note To Self: Error Loading Config File /etc/rancher/k3s/k3s.yaml"
date: 2021-04-19 02:07:25.000000000 +02:00
tags:

---
# Note To Self: Error Loading Config File `/etc/rancher/k3s/k3s.yaml`

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2021-04-19-note-to-self-error-loading-config-file-k3s.yaml.png" | absolute_url }})
{: refdef}

3 Min Read

-----------------------------------------------------------------------------------------

# The Story

After updating [k3s](https://k3s.io/) to the latest version on my vagrant box, I started getting permission denied errors when I ran commands such as `kubectl get pod`. 

This was mainly because previous versions of k3s created a world-readable `/etc/rancher/k3s/k3s.yaml` file, which appears to contain a plain text admin password (Serious security threat).

```bash
vagrant@dashboard:~> kubectl get pod -A
WARN[2021-04-18T23:59:51.388277731Z] Unable to read /etc/rancher/k3s/k3s.yaml, please start server with --write-kubeconfig-mode to modify kube config permissions 
error: error loading config file "/etc/rancher/k3s/k3s.yaml": open /etc/rancher/k3s/k3s.yaml: permission denied
```

kubectl/k3s version info:

```bash
vagrant@dashboard:~> kubectl version
Client Version: version.Info{Major:"1", Minor:"20", GitVersion:"v1.20.5+k3s1", GitCommit:"355fff3017b06cde44dbd879408a3a6826fa7125", GitTreeState:"clean", BuildDate:"2021-03-31T06:21:52Z", GoVersion:"go1.15.10", Compiler:"gc", Platform:"linux/amd64"}
Server Version: version.Info{Major:"1", Minor:"20", GitVersion:"v1.20.5+k3s1", GitCommit:"355fff3017b06cde44dbd879408a3a6826fa7125", GitTreeState:"clean", BuildDate:"2021-03-31T06:21:52Z", GoVersion:"go1.15.10", Compiler:"gc", Platform:"linux/amd64"}
vagrant@dashboard:~> k3s --version
k3s version v1.20.5+k3s1 (355fff30)
go version go1.15.10
```

## The Fix

There's 2 ways to fix this:

1. Reinstall k3s or start server with 644 permissions
    
    ```bash
    curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
    ```
or using the variable `K3S_KUBECONFIG_MODE`

    ```bash
    curl -sfL https://get.k3s.io | K3S_KUBECONFIG_MODE="644" sh -s -
    ```

2. Explicitly change file permissions without reinstalling.
    
    ```bash
    sudo chmod 644 /etc/rancher/k3s/k3s.yaml
    ```
