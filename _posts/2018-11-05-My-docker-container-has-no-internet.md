---
layout: post
title: "My Docker container has no internet"
date: 2018-11-05 08:32:20.000000000 +02:00
tags:
- Docker
- Tips/Tricks
- Linux/Ubuntu
---
# My Docker container has no internet

I had an issue with my Docker containers building when I am connected to my work network, this post is mainly for my archival and future use.

## The Fix
Check the contents of `resolv.conf`:
```bash
$ cat /etc/resolv.conf
```

If it includes a line like nameserver 127.0.1.1 it means the containers are obtaining an incorrect names server.
To fix this edit the `NetworkManager.conf` file:
```bash
$ sudo nano /etc/NetworkManager/NetworkManager.conf
```
And comment out the line with `dns=dnsmasq`; the file should look like this:
```bash
[main]
plugins=ifupdown,keyfile,ofono
#dns=dnsmasq

[ifupdown]
managed=false
```

Finally, restart the network manager:
```bash
$ sudo systemctl restart network-manager
```

Test again the container:
```bash
$ docker run ubuntu:16.04 apt-get update
Get:1 http://archive.ubuntu.com/ubuntu xenial InRelease [247 kB]
Get:2 http://archive.ubuntu.com/ubuntu xenial-updates InRelease [102 kB]
```
