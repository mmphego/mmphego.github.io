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

This post continues from [How I Setup Jenkins On Docker Container Using Ansible (Part 1)]({{ "/blog/2022/05/09/How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-1.html" | absolute_url }})

In this post, we will detail how an auto-configured Jenkins environment was built and deployed as a Docker container.

## The Walk-through

The setup is divided into 3 sections, [Instance Creation]({{ "/blog/2022/05/09/How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-1.html" | absolute_url }}), [Containerization]({{ "/blog/2022/05/09/How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-2.html" | absolute_url }}) and [Automation]({{ "/blog/2022/03/21/How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-3.html" | absolute_url }}).

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
├── populate_jenkins_casc.py
├── requirements.txt
└── userContent
    └── README.md

1 directory, 6 files
```

The following sections will explain some of the files and directories we will be creating.

#### Create Docker container

The code snippets below do the following:

- Creates a directory where we will store all our files and scripts

```bash
mkdir -p ~/tmp/jenkins-docker && cd "$_"
mkdir -p userContent
```

- Creates 5 empty `jenkins_config.yaml`, `jenkins_plugins.txt`, `populate_jenkins_casc.py`, `requirements.txt` and `README.md` files and,
  - **Note:** The contents of these files are discussed in other posts to avoid this post getting too long and confusing.

```bash
touch jenkins_config.yaml \
    jenkins_plugins.txt \
    populate_jenkins_casc.py \
    requirements.txt \
    userContent/README.md

echo "Files in this directory will be served under your http://<server>/jenkins/userContent/" > userContent/README.md
```

- Creates a `Dockerfile` which includes all relevant dependencies (**Note**: Jenkins is pinned to a specific version to ensure determinism)

{% raw %}

```bash
cat > Dockerfile << "EOF"
FROM jenkins/jenkins:2.321

USER root

# set your timezone
ENV TZ="/usr/share/zoneinfo/Africa/Johannesburg"

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

# ------------ extra-tools ------------

# hadolint ignore=DL3008,DL3015
RUN apt-get update \
    && apt-get -yq install \
    graphviz \
    rsync \
    vim \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ------------ Jenkins configurations ------------

# Change to Jenkins user
USER jenkins

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

# copy user contents which might include images and other files
COPY --chown=jenkins:jenkins userContent/* /usr/share/jenkins/ref/userContent/

# hadolint ignore=DL3059
RUN chown -R jenkins:jenkins /var/backups
# hadolint ignore=DL3059
RUN chown -R jenkins:jenkins /var/jenkins_home
EOF
```

{% endraw %}

To ensure that we follow the [Docker's best practices](https://docs.docker.com/develop/dev-best-practices/), we use [Hadolint](https://github.com/hadolint/hadolint) which is a `Dockerfile` linter that helps you build best practice Docker images. I use it in all of my projects to ensure I’m creating small, secure, efficient and maintainable images.

Let’s run our `Dockerfile` through `Hadolint`:

```bash
docker run --rm -i hadolint/hadolint < Dockerfile
```

If you are a VS Code user, there is the [Hadolint extension](https://marketplace.visualstudio.com/items?itemName=exiasr.hadolint). If you want to use it directly in Github, there is a [Hadolint Github action](https://github.com/marketplace/actions/hadolint-action).

---

Once we have established that our `Dockerfile` is valid (no linting errors), we can explore the `jenkins_config.yaml`, `jenkins_plugins.txt`, `populate_jenkins_casc.py`, `requirements.txt` empty files created above.

#### Jenkins Plugins

To learn more about Jenkins plugins (`jenkins_plugin.txt`), another blog post on [Managing Jenkins Plugins]({{ "/blog/2022/06/24/Managing-Jenkins-Plugins.html" | absolute_url }}) was written.

#### Jenkins Configuration as Code

To learn more about Jenkins configuration as code (`jenkins_config.yaml`, `populate_jenkins_casc.py` and `requirements.txt`), another blog post on [Managing Jenkins Configuration As Code And Secrets Management]({{ "/blog/2022/06/24/Managing-Jenkins-Configuration-as-Code-and-Secrets-Management.html" | absolute_url }}) was written.

#### Putting it all together

Once all of the files are created, we can execute the sequence of commands that are needed to assemble the Jenkins image using through the `Dockerfile` that was created.

Let's build the image using the following command:

```bash
docker build -t jenkins-docker .
```

Ensure that the image was successfully built by listing all available images:

```bash
docker image ls
```

which gives us a similar output
![imagels](https://user-images.githubusercontent.com/31302703/167669477-92a28964-b0e2-4bee-aa77-9c630a043252.png)

Now let's tag the image before publishing (push) it to [Docker Hub](https://hub.docker.com/).

To tag a docker image you use the following command:

```bash
docker tag jenkins-docker <<dockerhub username>>/jenkins-image .
```

Now let's publish the new image by logging into Docker Hub using our Docker Hub credentials, if you do not have any then [sign up for Docker Hub](https://hub.docker.com/signup).

Thereafter login using the following command in order to push the image to Docker Hub:

```bash
docker login
```

After a successful login, then push the image to Docker Hub using the following command:

```bash
docker push
```

Thereafter, we verify that the image was successfully pushed to [Docker Hub](https://hub.docker.com/)

![dockerhub](https://user-images.githubusercontent.com/31302703/167672477-d33d24cb-177e-4e97-80f8-a60233ff94d4.png)

## Conclusion

Congratulations! You have successfully created a Jenkins container (containing jenkins plugins and configuration as code) and published it to Docker Hub. You can now use the instance as part of the Ansible playbooks.

## Reference

- []()
- []()
