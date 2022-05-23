---
layout: post
title: "How I Setup Jenkins On Docker Container Using Ansible (Part 2)"
date: 2022-05-09 12:22:16.000000000 +02:00
tags:
- Jenkins
- Docker
- Ansible
- DevOps
---
# How I Setup Jenkins On Docker Container Using Ansible (Part 2)

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2022-05-09-How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-2.png" | absolute_url }})
{: refdef}

<<TIME TO READ>>

---

# The Story

This post continues from [How I Setup Jenkins On Docker Container Using Ansible (Part 2)]()

In this post, I will try to detail how we built and deployed a Docker container running a Jenkins environment and configured Jenkins Jobs after system initialization.

## TL;DR

## The How

## The Walk-through

The setup is divided into 3 sections, [Instance Creation]({{ "/blog/.<>html" | absolute_url }}), [Containerization]({{ "/blog/<>.html" | absolute_url }}) and [Automation]({{ "<>.html" | absolute_url }}).

This post-walk-through mainly focuses on [***containerization***](#containerization).

### Prerequisites

If you already have [Docker](https://docs.docker.com/get-docker/) and [Docker-Compose]() installed and configured you can skip this step else you can search for your installation methods.

```bash
sudo apt install docker.io
# The Docker service needs to be set up to run at startup.
sudo systemctl start docker
sudo systemctl enable docker
python3 -m pip install docker-compose
```

Using a container offers convenience and ensuring that deployments are deterministic. It also offers a great deal of flexibility.

### Containerization

But before continue, the directory structure shown below should resemble what we should have once we are done with the walk-through.

#### Directory Structure

```bash
tree -L 3
.
├── Dockerfile
├── jenkins_config.yaml
├── jenkins_plugins.txt
└── userContent
    └── README.md

2 directory, 4 files
```

The following sections will explain some of the files and directories we will be creating.

#### Create Docker container

First, we need to create 2x empty `jenkins_config.yaml` and `jenkins_plugins.txt` (We will divide into the contents of the files later), `Dockerfile` and include all dependencies we need.

{ %raw %}

```bash
mkdir -p ~/tmp/jenkins-docker && cd "$_"
mkdir -p userContent
touch jenkins_config.yaml jenkins_plugins.txt userContent/README.md
echo "Files in this directory will be served under your http://<server>/jenkins/userContent/" > userContent/README.md
cat > Dockerfile << "EOF"
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
    vim \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
# /extra-tools

# increase http login session timeout
ENV JENKINS_OPTS --sessionTimeout=10080

# https://www.jenkins.io/doc/book/managing/casc/
ENV CASC_JENKINS_CONFIG "/usr/share/jenkins/ref/jenkins_config.yaml"

# disable setup wizard on first start
ENV JAVA_OPTS=-Djenkins.install.runSetupWizard=false

# install plugins
# hadolint ignore=DL3059
COPY --chown=jenkins:jenkins jenkins_plugins.txt /usr/share/jenkins/ref/jenkins_plugins.txt
RUN /usr/local/bin/install-plugins.sh < /usr/share/jenkins/ref/jenkins_plugins.txt

# copy user contents which include images
COPY --chown=jenkins:jenkins userContent/* /usr/share/jenkins/ref/userContent/

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

Once we have established the sequence of commands that are needed in order to assemble the Jenkins image we will be using through the `Dockerfile` above, we need to build the image using the following command.

```bash
docker build -t jenkins-docker .
```

In order to see if our image was successfully built we will list all images we have using

```bash
docker image ls
```

which gives us a similar output
![imagels](https://user-images.githubusercontent.com/31302703/167669477-92a28964-b0e2-4bee-aa77-9c630a043252.png)

Once established that our image was successfully built, we need to tag the image before publishing (push) it to [Docker Hub](https://hub.docker.com/). To tag a docker image you use the following command:

```bash
docker tag jenkins-docker amakhaba/jenkins-image .
```

In order to publish the new image login to docker hub using your docker hub credentials, if you do not have any then [sign up for Docker Hub](https://hub.docker.com/signup). Thereafter login using the following command in order to push the image to docker hub.

```bash
docker login
```

When you are logged in you can push the image to docker hub using the following command:

```bash
docker push
```

Thereafter, we verify that the image was successfully pushed to [docker hub](https://hub.docker.com/)

![dockerhub](https://user-images.githubusercontent.com/31302703/167672477-d33d24cb-177e-4e97-80f8-a60233ff94d4.png)

#### Jenkins Configuration as Code

checkout and get enlightened

- <https://www.digitalocean.com/community/tutorials/how-to-automate-jenkins-setup-with-docker-and-jenkins-configuration-as-code>
- <https://fauzislami.com/blog/2022/02/18/jcasc-jenkins-configuration-as-code-setting-up-jenkins-in-a-fully-reproducible-way/>
- <https://medium.com/nerd-for-tech/jenkins-as-code-bfdbd8f3dff9>
- <https://opensource.com/article/20/4/jcasc-jenkins>
- <https://devops.com/using-jenkins-configuration-as-code/>
- <https://dzone.com/articles/jenkins-configuration-as-code-plugins>

-

#### Jenkins Plugins

<https://gist.github.com/noqcks/d2f2156c7ef8955619d45d1fe6daeaa9>

TODO:

- Add jenkins config as code

```bash
cd ~/tmp/jenkins-docker


- Add jenkins plugins

## Reference

- []()
- []()
