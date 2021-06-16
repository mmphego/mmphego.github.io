---
layout: post
title: "How I Setup A Private Local PyPI Server Using Docker And Ansible"
date: 2021-06-15 11:30:00.000000000 +02:00
tags:
- Python
- PyPI
- Docker
- Tips and Tricks
- DevOps
---
# How I Setup A Private Local PyPI Server Using Docker And Ansible.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2021-06-15-How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible.png" | absolute_url }})
{: refdef}

7 Min Read

-----------------------------------------------------------------------------------------

# The Story

Recently, I worked on a [Jira](https://www.atlassian.com/software/jira) ticket that has been in the backlog for a while. 

{:refdef: style="text-align: center;"}
![image](https://user-images.githubusercontent.com/7910856/122241859-29ca4b00-cec3-11eb-94ca-ba484c3bb733.png)
{: refdef}

The story goes like this, we (my team @ work) have a [PyPI](https://en.wikipedia.org/wiki/Python_Package_Index) server (running on [devpi](https://github.com/devpi/devpi)) which hosts our packages. There were a couple of issues that we saw as potential risks, namely:

- The setup was not under config management, meaning we didn't know how we would reconstitute it if it dies and like every software project there wasn't much detailed documentation on the how-to.
- The Python packages did not have any backups, so if something was to happen it would be bye-bye to old packages i.e. It would be tricky to tests old system releases.
- The server needed to be restarted occasionally to forcefully refresh the packages as our package index had grown over the past few years.

My initial approach to this was:
- Research and evaluating existing tools that the Python ecosystem had to offer, [devpi](https://github.com/devpi/devpi) and [pypi-server](https://pypi.org/project/pypiserver/) being the most prominent ones.
- Run the PyPI server in a container preferably Docker (current setup was running in a [ProxMox LXC container](https://pve.proxmox.com/wiki/Linux_Container).)
- Ensure that the deployment is deterministic and,
- PyPi repository that can be torn down and recreated ad hoc by a single command (preferably through [Ansible](https://docs.ansible.com/ansible/latest/index.html)) .
- Overall ensure that there isn't any significant downtime between the change-over i.e. The client-side shouldn't have to make any changes.

In this post, I will try to detail how I set up a private local PyPI server using [**Docker**](https://docs.docker.com/get-docker) And [Ansible](https://docs.ansible.com/ansible/latest/index.html).

# TL;DR

Deploy/destroy devpi server running in Docker container using a single command.

# The How

After my initial research between [devpi](https://github.com/devpi/devpi) and [pypi-server](https://pypi.org/project/pypiserver/). Devpi won for various and obvious reasons!

I could have just [bash scripted](https://www.linux.com/training-tutorials/writing-simple-bash-script/) everything quickly before putting it all together but then where is the fun in that? Also, this has to run in Prod. Hence, why I decided on an over-engineered approach which would be a good learning platform. 

# The Walk-through

The setup is divided into two sections, [Containerization](#Containerization) and [Automation](#automation).

This post-walk-through mainly focuses on containerisation. Go [here]({{ "/blog/2021/06/16/How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible-Continues.html" | absolute_url }}) for the automation.

## Prerequisite

If you already have [Docker](https://docs.docker.com/get-docker/) and [Docker-Compose](https://docs.docker.com/compose/) installed and configured you can skip this step else you can search for your installation methods.

```bash
sudo apt install docker.io
# The Docker service needs to be set up to run at startup.
sudo systemctl start docker
sudo systemctl enable docker
python3 -m pip install docker-compose
```

## Containerization

Part of my solution was that the PyPI server runs in a container preferably Docker for obvious reasons (current setup was running in a [ProxMox LXC container](https://pve.proxmox.com/wiki/Linux_Container)).
Using a container offers convenience and ensuring that deployments are deterministic.

### Directory Structure

In this section, I will go through each file in our `pypi_server` directory, which houses the configurations.

```bash
├── Makefile
├── pypi_server
│   ├── config.yml
│   ├── create_pypi_index.sh
│   ├── docker-compose-dev.yaml
│   ├── docker-compose-stable.yaml
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── README.md
└── README.md
```

#### Makefile

Below is a snippet from our Makefile, which makes it a lot easier for our [CI](https://en.wikipedia.org/wiki/Continuous_integration) system to lint, build, tag and pushes images to our local [Docker Registry](https://docs.docker.com/registry/). This means that instead of typing the whole docker command to build/tag or push, we can run something like:

```bash
# Which will lint the Dockerfile, build, tag and push the image to our local registry
make push_pypi_server
```

You can also check out my over-engineered Makefile [here](https://github.com/mmphego/Generic_Makefile).

```
cat >> Makefile << EOF 
SHELL := /bin/bash -eo pipefail
# Defined images here
.PHONY: $(IMAGES)
IMAGES := pypi_server
# Docker registry URL
REGISTRY := 
.DEFAULT_GOAL := help

define PRINT_HELP_PYSCRIPT
import re, sys
print("Please use `make <target>` where <target> is one of\n")
for line in sys.stdin:
    match = re.match(r'(^([a-zA-Z-]+).*?)## (.*)$$', line)
    if match:
        target, _, help = match.groups()
        if not any([target.startswith('--'), '%' in target, '$$' in target]):
            target = target.replace(':','')
            print(f'{target:40} {help}')
        if '%' in target:
            target = target.replace('_%:', '_{image_name}').split(' ')[0]
            print(f'{target:40} {help}')
        if '$$' in target:
            target = target[:target.find(':')]
            print(f'{target:40} {help}')

endef
export PRINT_HELP_PYSCRIPT

.PHONY: help
help:
    @python3 -c "$$PRINT_HELP_PYSCRIPT" < $(MAKEFILE_LIST)

pre_build_%: IMAGE = $(subst pre_build_,,$@)
pre_build_%:  ## Run Dockerfile linter (https://github.com/hadolint/hadolint)
    docker run --rm -i hadolint/hadolint < $(IMAGE)/Dockerfile

build_cached_%: IMAGE = $(subst build_cached_,,$@)
build_cached_%: pre_build_%  ## Build the docker image [Using cache when building].
    docker build -t "$(IMAGE):latest" "${IMAGE}"

build_%: IMAGE = $(subst build_,,$@)
build_%: pre_build_%  ## Build the docker image [Not using cache when building].
    docker build --no-cache -t "$(IMAGE):latest" "${IMAGE}"
    touch .$@

tag_%: IMAGE = $(subst tag_,,$@)
tag_%: pre_build_%  ## Tag a container before pushing to cam registry.
    if [ ! -f ".build_${IMAGE}" ]; then \
        echo "Rebuilding the image: ${IMAGE}"; \
        make build_$(IMAGE); \
    fi;
    docker tag "$(IMAGE):latest" "$(REGISTRY)/$(IMAGE):latest"

push_%: IMAGE = $(subst push_,,$@)
push_%: tag_%  ## Push tagged container to cam registry.
    docker push $(REGISTRY)/$(IMAGE):latest
    rm -rf ".build_$(IMAGE)"
EOF
```

#### Dockerfile and scripts

I created the following Dockerfile, which executes a script `entrypoint.sh` upon container startup and also copies a `create_pypi_index.sh` script which should be run once when the devpi-server is up. This script [creates and configures the indices](https://devpi.net/docs/devpi/devpi/stable/+d/userman/devpi_indices.html).

``` 
cat >> Dockerfile << EOF 
FROM python:3.7

RUN pip install --no-cache-dir \
    devpi-client==5.2.2 \
    devpi-server==5.5.1 \
    devpi-web==4.0.6

ENV PYPI_PASSWORD
EXPOSE 3141
WORKDIR /root
VOLUME /root/.devpi

COPY create_pypi_index.sh /data/create_pypi_index.sh
RUN chmod a+x /data/create_pypi_index.sh

COPY entrypoint.sh /data/entrypoint.sh
ENTRYPOINT ["bash", "/data/entrypoint.sh"]

COPY config.yml /data/config.yml
CMD ["devpi-server", "-c", "/data/config.yml"]
EOF
```

**`entrypoint.sh`**

According to the [docs](https://devpi.net/docs/devpi/devpi/stable/+d/quickstart-server.html?highlight=devpi%2520init#installing-devpi-server-and-client):
> When started afresh, `devpi-server` will not contain any users or indexes except for the root user and the `root/pypi` index (see using root/pypi index) which represents and caches https://pypi.org packages.

Note: The `root/pypi` index is a read-only cache of https://pypi.org, hence why a new index creation is necessary if you want to push packages as well.

```bash
cat >> entrypoint.sh << EOF 
#!/usr/bin/env bash
if ! [ -f /root/.devpi/server ]; then
    devpi-init
fi

exec "$@"
EOF
```

**`create_pypi_index.sh`**

Read more about indices creation [here](https://devpi.net/docs/devpi/devpi/stable/+d/userman/devpi_indices.html#devpi-um-indices-chapter)

```
cat >> create_pypi_index.sh << EOF 
#!/usr/bin/env bash

# Creates PyPI user and an index for uploading packages to.

devpi use http://localhost:3141
devpi login root --password=
devpi user -c pypi email= password=${PYPI_PASSWORD:-}
devpi user -l
devpi index -c pypi/stable bases=root/pypi volatile=True mirror_whitelist=*
EOF
```

Once the image has been build and a container is running, we can create an index by running the following:

{% raw %}
```bash
PYPI_CONTAINER=$(docker ps --filter "name=pypi" --filter "status=running" --format "{{.Names}}")
docker exec -ti ${PYPI_CONTAINER} /bin/bash -c "/data/create_pypi_index.sh"
```
{% endraw %}

#### Devpi configuration

This is a YAML [devpi configuration](https://devpi.net/docs/devpi/devpi/stable/+doc/quickstart-server.html#using-a-configuration-file-for-devpi-server).

```
cat >> config.yml << EOF 
---
devpi-server:
  host: 0.0.0.0
  port: 3141
  restrict-modify: root
EOF
```

#### Compose file(s)

This is a developmental docker-compose that builds the image locally instead of using the image from the registry.
{% raw %}
```
cat >> docker-compose-dev.yaml << EOF 
---
version: '3'
services:
  devpi:
    build:
      context: .
      dockerfile: ./Dockerfile
    ports:
      - "${DEVPI_PORT:-3141}:3141"
    volumes:
       - "${DEVPI_HOME:-./devpi}:/root/.devpi"
    tty: true
    stdin_open: true
EOF
```
{% endraw %}

The only difference between the `docker-compose-dev.yaml` and `docker-compose-stable.yaml` is one has a [build context and the other has a defined image it pulls from](https://docs.docker.com/compose/compose-file/compose-file-v3/#service-configuration-reference)

Run the command below to build the image and run the container on localhost
{% raw %}
```bash
env DEVPI_HOME="${HOME}/.devpi" docker-compose -f docker-compose-dev.yaml up --build -d
# or 
# cat << EOF > .env
# DEVPI_HOME="${HOME}/.devpi"
# EOF
# docker-compose --env-file ./.env -f docker-compose-dev.yaml up --build -d
# --------------------------------------------------------------------------
# or native
# docker build -t pypi_server . 
# docker run -d -ti -v "${HOME}/.devpi:/root/.devpi" -p 3141:3141 pypi_server
```
{% endraw %}

The PyPI server available at: http://localhost:3141. 
If all went well you should see an image like below.

![image](https://user-images.githubusercontent.com/7910856/122209330-b1ed2800-cea4-11eb-8e3e-92a3350f4c16.png)

#### Garbage Collection

To clean up for whatever reason run the following command:
{% raw %}
```bash
env DEVPI_HOME="${HOME}/.devpi" docker-compose -f docker-compose-dev.yaml down --volumes --rmi all
```
{% endraw %}

### Client: Permanent index configuration for pip

To avoid having to re-type index URLs with `pip` or `easy-install` , you can configure `pip` by setting the `index-url` entry in your `$HOME/.pip/pip.conf` (posix) or `$HOME/pip/pip.ini` (windows). Let’s do it for the `root/pypi` index:

```
mkdir -p ~/.pip
cat >> ~/.pip/pip.conf << EOF 
[global]
no-cache-dir = false
timeout = 60
index-url = http://localhost:3141/root/pypi/stable
[search]
index = http://localhost:3141/root/pypi/
EOF
```

Alternatively, you can add a special environment variable to your shell settings (e.g. `.bashrc`):

```
cat >> ~/.bashrc << EOF 
export PIP_INDEX_URL=http://localhost:3141/root/pypi/stable/
EOF
```

## Automation

I didn't want the post to be too long.

Post continues [here]({{ "/blog/2021/06/15/How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible-Continues.html" | absolute_url }})

# Conclusion

**Congratulations!!!**

Assuming that everything was set up correctly. You now have a container running a local/private PyPI server and you can download or upload (using [twine](https://pypi.org/project/twine/) or [devpi-client](https://pypi.org/project/devpi-client/)) packages. 

We've been using this private package index for a few months, and also noticed a significant improvement in downloading and installing packages. 
The image shows the time it takes to download and install packages before and after.
![image](https://user-images.githubusercontent.com/7910856/122068583-cffb4f80-cdf4-11eb-90c8-6f70cbbaa831.png)

**Note:**
- Uploading packages to the local PyPI server is beyond the scope of this post.
- The purpose of this post was mainly to share the approach that worked well for us. You may use it to host your private package repository and index, adapting it to the cloud provider and web server of your choice.

# Reference

- [devpi: PyPI server and packaging/testing/release tool](https://devpi.net/docs/devpi/devpi/stable/%2Bd/index.html)
- [How to set up DevPI, a PyPI-compatible Python development server](https://opensource.com/article/18/7/setting-devpi)
- [Getting started with devpi](https://stefan.sofa-rockers.org/2017/11/09/getting-started-with-devpi/)
- [Remediating poor PyPI performance with devpi](https://blog.oddbit.com/post/2021-02-08-remediating-poor-pypi-performa/)
