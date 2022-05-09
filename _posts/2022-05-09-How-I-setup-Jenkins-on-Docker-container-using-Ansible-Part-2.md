---
layout: post
title: "How I Setup Jenkins On Docker Container Using Ansible-Part-2"
date: 2022-05-09 12:22:16.000000000 +02:00
tags:
-
-
-
---
# How I Setup Jenkins On Docker Container Using Ansible-Part-2

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2022-05-09-How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-2.png" | absolute_url }})
{: refdef}

<<TIME TO READ>>

---

# The Story

## TL;DR

## TS;RE

## The How

## The Walk-through

The setup is divided into 3 sections, [Instance Creation]({{ "/blog/.<>html" | absolute_url }}), [Containerization][here]({{ "/blog/<>.html" | absolute_url }}) and [Automation]({{ "/blog/2021/06/15/How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible.html" | absolute_url }}).

This post-walk-through mainly focuses on automation. Go [here]([here]({{ "/blog/2021/06/15/How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible.html" | absolute_url }})) for the containerisation.

{ %raw %}

```bash
mkdir -p ~/tmp/jenkins-docker && cd "$_"
cat > Dockerfile <<"EOF"
FROM jenkins/jenkins:2.321

USER root
# hadolint ignore=DL3008,DL3009,DL3015
RUN apt-get update && \
    apt-get -yq install \
    apt-transport-https \
    bzip2 \
    ca-certificates \
    curl \
    gnupg2 \
    iputils-* \
    net-tools \
    software-properties-common \
    wget

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
RUN apt-key fingerprint 0EBFCD88
RUN add-apt-repository -y \
    "deb [arch=amd64] https://download.docker.com/linux/debian \
    $(lsb_release -cs) \
    stable"

# hadolint ignore=DL3008,DL3009,DL3015
RUN apt-get update \
    && apt-get install -yq \
    docker-ce-cli

VOLUME /var/run/docker.sock
# /docker-cli

# extra-tools:
# hadolint ignore=DL3008,DL3015
RUN apt-get update \
    && apt-get -yq install \
    graphviz \
    rsync \
    nano \
    vim \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
# /extra-tools

# increase http login session timeout
ENV JENKINS_OPTS --sessionTimeout=10080

# https://github.commkdir -p ~/tmp/jenkins-docker
# ENV CASC_JENKINS_CONFIG "/usr/share/jenkins/ref/jenkins.yaml"

# disable setup wizard on first start
ENV JAVA_OPTS=-Djenkins.install.runSetupWizard=false

# install plugins
# hadolint ignore=DL3059
# COPY --chown=jenkins:jenkins jenkins_plugins.txt /usr/share/jenkins/ref/jenkins_plugins.txt
# RUN /usr/local/bin/install-plugins.sh < /usr/share/jenkins/ref/jenkins_plugins.txt

# # copy user contents which include images
# COPY --chown=jenkins:jenkins userContent/* /usr/share/jenkins/ref/userContent/

# misc:
# hadolint ignore=DL3059
RUN chown -R jenkins:jenkins /var/backups
# hadolint ignore=DL3059
RUN chown -R jenkins:jenkins /var/jenkins_home
# /misc
USER jenkins
EOF

```

{ % endraw %}

Once we have
```bash
docker build -t jenkins-docker .
```

Document the steps taken

- docker build
- docker login
- docker tag
- docker push

verify image is available in docker hub
    - screenshot of docker hub

TODO:

- Add jenkins config as code

```bash
cd ~/tmp/jenkins-docker


- Add jenkins plugins

## Reference

- []()
- []()
