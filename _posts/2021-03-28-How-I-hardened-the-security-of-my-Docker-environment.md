---
layout: post
title: "How I Hardened The Security Of My Docker Environment"
date: 2021-03-28 10:40:30.000000000 +02:00
tags:

---
# How I Hardened The Security Of My Docker Environment.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2021-03-28-How-I-hardened-the-security-of-my-Docker-environment.png" | absolute_url }})
{: refdef}

9 Min Read

-----------------------------------------------------------------------------------------

# The Story

One thing I have never considered when working with containers was **security** (Yes, I know what you're thinking). I've always thought that since Docker provides a secure and robust environment for managing SDLC (Systems development life cycle) as compared to traditional VMs, then that simply meant that I was immune to security issues such as *container breakouts, wild images and DoS (Denial-of-Service) attacks*.

But the worst thing happened. I pulled and ran a random image from the wild resulting which made my workstation unusable mainly because some process(es) running in the container consuming all of my memory and CPU. I had to force a system restart and lost the things I was working on.
I had to learn the hard way and ended up tweeting about the ordeal to warn others.

<div style="text-align: center;">
<blockquote class="twitter-tweet" ><p lang="en" dir="ltr"><a href="https://twitter.com/hashtag/NoteToSelf?src=hash&amp;ref_src=twsrc%5Etfw">#NoteToSelf</a>: When running untrusted containers from the wild always &quot;use memory limit mechanisms&quot; to prevent a denial of service from occurring. <br>FYI a container can use all of the memory on the host.<br><br>I learned this the hard way.</p>&mdash; Mpho Mphego (@MphoMphego) <a href="https://twitter.com/MphoMphego/status/1375664477459337220?ref_src=twsrc%5Etfw">March 27, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

This experience resulted in me going down the rabbit-hole, researching ways to harden my docker security in my environment. In this post, I will detail some of the things everyone should know when working with Docker.

## TL;DR

Audit your environment, don't run containers as Root and always keep your system up-to-date.

# The How

There are several ways one can improve the security of their docker environment.

## Harden Your System/Host/Server

Your docker environment is only secure if your system/host is secure, meaning if the host is compromised surely the docker environment will be as well. 
Always ensure that your host systems (OS, Kernel versions, packages) are always up-to-date.

Another great alternative is to run a system security audit, for UNIX-based systems there's a tool called [lynis](https://github.com/CISOfy/Lynis).

According to the docs; 
> Lynis is a security auditing tool for systems based on UNIX like Linux, macOS, BSD, and others. It performs an in-depth security scan and runs on the system itself. The primary goal is to test security defences and provide tips for further system hardening. It will also scan for general system information, vulnerable software packages, and possible configuration issues. Lynis was commonly used by system administrators and auditors to assess the security defences of their systems. Besides the "blue team," nowadays penetration testers also have Lynis in their toolkit.

To run a system audit clone/download and run `lynis` script (no compilation nor installation is required):
```bash
git clone https://github.com/CISOfy/lynis
cd lynis; ./lynis audit system
```

It usually takes a few seconds to complete, and upon completion, you should see some recommended remediations similar to the ones pictured below:

![image](https://user-images.githubusercontent.com/7910856/112767180-75ccc880-9015-11eb-93ac-1a4f30db204c.png)

## Avoid Running Containers As Root

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Friends don&#39;t let friends run containers as root. <a href="https://t.co/UQIRzQQegP">pic.twitter.com/UQIRzQQegP</a></p>&mdash; Mpho Mphego (@MphoMphego) <a href="https://twitter.com/MphoMphego/status/1376272738126561289?ref_src=twsrc%5Etfw">March 28, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

By default (*I think*), Docker lets you run containers run as Root, meaning you have access to all the root privileges when running containers.

Remediation: You can update your `Dockerfile` by adding user(s) similar to what I have below.

```dockerfile
# Add a user
RUN groupadd -r vino && \
    useradd -m -s /bin/bash -r -g vino -G audio,video vino && \
    mkdir -p /app && \
    chown -R vino:vino /app

RUN echo "vino ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
RUN visudo --c
USER vino
```

and then you can run a container with that user

`docker run --user <user>[:<group>] -ti <image> /bin/bash`


## Set Resource Limits for Images and Containers

As mentioned at the beginning of this post, I had a container that when ran caused my computer to become unresponsive due to high CPU and memory usage. This then led me down the rabbit-hole of trying to understand and avoid the same issue happening again.

To ensure your computer/host/server does not get DoS'ed, you should limit the number of system resources that each container and image can consume. Limiting these resources minimizes the attack surface in the event of a system compromise.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr"><a href="https://twitter.com/hashtag/Docker?src=hash&amp;ref_src=twsrc%5Etfw">#Docker</a> image building best practices (IMHO)<br><br>- Preset memory amount the image will use<br>- Force it to always fetch new dependencies (avoid using legacy dependencies) <a href="https://t.co/QRYHAe3Utg">pic.twitter.com/QRYHAe3Utg</a></p>&mdash; Mpho Mphego (@MphoMphego) <a href="https://twitter.com/MphoMphego/status/1376069447031664640?ref_src=twsrc%5Etfw">March 28, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

You can also limit memory and CPU used when running the container by running:

```bash
docker run \
    --restart=on-failure:5 \
    --memory 256mb \
    --cpus="1.5" \
    -i \
    -p 4000:4000 \
    <image_name>
```

Running this container with these restrictions will limit the memory usage to a maximum 256Mb and guarantees at most one and a half of the CPUs, this should be sufficient for most applications (considering that 1 application per container) while ensuring that should the application fail it will be restarted maximum 5 times before issuing a runtime error.

## CIS Benchmarks Auditing

As you work to develop an image for your docker container you need to build &test, verify and harden it, this is where [CIS (Center for Internet Security) Docker benchmarking](https://www.cisecurity.org/benchmark/docker/) comes in. 

CIS Docker benchmark establish an authoritative hardening guide for Docker across the core attack surfaces - Docker client, host, and registry

There are currently 2 tools (I know of) that are great for running Docker security audits.

### `docker-bench`

[docker-bench](https://github.com/aquasecurity/docker-bench) is a detection tool (not an enforcement tool) written in Go that checks whether Docker is deployed according to security best practices documented in the [CIS (Center for Internet Security) Docker Benchmark](https://www.cisecurity.org/benchmark/docker/) ([Download report](https://paper.bobylive.com/Security/CIS/CIS_Docker_Benchmark_v1_2_0.pdf))

To install the tool run:

```bash
go get github.com/aquasecurity/docker-bench
cd $GOPATH/src/github.com/aquasecurity/docker-bench
go build -o docker-bench .
```

Then run the analysis and only review failed checks:

```bash
./docker-bench --include-test-output | grep FAIL
```

You should see output similar to the one below, which lists some of the identified findings that needs remediation which is usually a manual process although the actual remediation steps will vary depending on the specific attach surface you chose to harden.

![image](https://user-images.githubusercontent.com/7910856/112748270-ff9b7800-8fba-11eb-8c21-b5355c82c23d.png)

Suppose we want to remedy **4.5 Ensure Content trust for Docker is Enabled**
We would need to follow the instructions listed in the CIS Docker Benchmark page 128 as shown in the snippet below

![image](https://user-images.githubusercontent.com/7910856/112763934-c1c44100-9006-11eb-9385-3c64c8657866.png)

Alternatively, open the [CIS Docker Benchmark](https://paper.bobylive.com/Security/CIS/CIS_Docker_Benchmark_v1_2_0.pdf) document for recommended remediation/hardening tips.
 
### `Docker Bench for Security`

A similar application to the `docker-bench` was developed by the Docker team which also provides a tool to analyse containers and images for potential security risks. This is a great alternative since it was written and maintained by the creators of Docker

The [Docker Bench for Security](https://github.com/docker/docker-bench-security) is a script that checks for dozens of common best-practices around deploying Docker containers in production. The tests are all automated and are inspired by the [CIS Docker Benchmark](https://paper.bobylive.com/Security/CIS/CIS_Docker_Benchmark_v1_2_0.pdf)

As opposed to `docker-bench` which is a Go package that needs to be built, the Docker Bench for Security is packaged in a small container. However, this container gets ran with a lot of privileges such as sharing the host's filesystem, PID and namespaces.

Run the analysis:

```bash
docker run --rm --net host --pid host --userns host --cap-add audit_control \
    -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
    -v /etc:/etc:ro \
    -v /usr/bin/containerd:/usr/bin/containerd:ro \
    -v /usr/bin/runc:/usr/bin/runc:ro \
    -v /usr/lib/systemd:/usr/lib/systemd:ro \
    -v /var/lib:/var/lib:ro \
    -v /var/run/docker.sock:/var/run/docker.sock:ro \
    --label docker_bench_security \
    docker/docker-bench-security
```

If all went well, you should see an output similar to the one below which lists some of the identified findings that needs remediation which is usually a manual process although the actual remediation steps will vary depending on the specific attach surface you chose to harden.

![image](https://user-images.githubusercontent.com/7910856/112764649-da822600-9009-11eb-8568-4a31c53e7eda.png)

## Don't Use Images From The Wild

Last but not least, if you can; try not to use containers from the wild. Alternatively, vet their `Dockerfile` if it's available and then build your image from their `Dockerfile`.

Another option to consider is to enable the [Docker Content Trust](https://docs.docker.com/engine/security/trust/) feature which is disabled by default.

To enable it run:
```bash
echo "export DOCKER_CONTENT_TRUST=1" >> ~/.bashrc && source ~/.bashrc
```

This means that when you attempt to pull images that are not signed by a genuine publisher, Docker will decline.

# Reference

- [Docker: Runtime options with Memory, CPUs, and GPUs](https://docs.docker.com/config/containers/resource_constraints/)
- [Best Practices for Docker Security For 2020](https://www.securecoding.com/blog/best-practices-for-docker-security-for-2020/)
- [Docker Bench for Security](https://medium.com/devgorilla/docker-bench-for-security-f1cbb9edd12d)
- [How To Audit Docker Host Security with Docker Bench for Security on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-audit-docker-host-security-with-docker-bench-for-security-on-ubuntu-16-04)
