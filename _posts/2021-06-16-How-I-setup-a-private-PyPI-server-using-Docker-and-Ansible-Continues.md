---
layout: post
title: "How I Setup A Private Local PyPI Server Using Docker And Ansible. [Continues]"
date: 2021-06-16 16:18:48.000000000 +02:00
tags:
- Python
- PyPI
- Docker
- Tips and Tricks
- DevOps
---
# How I Setup A Private Local PyPI Server Using Docker And Ansible. [Continues].

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2021-06-16-How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible-Continues.png" | absolute_url }})
{: refdef}

10 Min Read

-----------------------------------------------------------------------------------------

# The Story

This post continues from [How I Setup A Private PyPI Server Using Docker And Ansible]({{ "/blog/2021/06/15/How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible.html" | absolute_url }})

In this post, I will try to detail how to set up a private local PyPI server using [Docker](https://docs.docker.com/get-docker) And [**Ansible**](https://docs.ansible.com/ansible/latest/index.html).

## TL;DR

Deploy/destroy [devpi](https://devpi.net/) server running in [Docker](https://www.docker.com/) container using a single command.

# The How

After my initial [research]({{ "/blog/2021/06/15/How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible.html#the-story" | absolute_url }}), I wanted to ensure that the deployment is deterministic and the PyPi repository can be torn down and recreated ad-hoc by a single command. In our case, a simple `make pypi` deploys an instance of PyPI server through an [Ansible playbook](https://docs.ansible.com/ansible/latest/user_guide/playbooks_intro.html).

According to the [docs](https://docs.ansible.com/ansible/latest/user_guide/playbooks_intro.html):
> Ansible Playbooks offer a repeatable, re-usable, simple configuration management and multi-machine deployment system, one that is well suited to deploying complex applications. If you need to execute a task with Ansible more than once, write a playbook and put it under source control. Then you can use the playbook to push out new configuration or confirm the configuration of remote systems.

A basic Ansible playbook:

- Selects machines to execute against from inventory
- Connects to those machines (or network devices, or other managed nodes), usually over SSH
- Copies one or more modules to the remote machines and starts execution there

You can read more about Ansible [here](https://www.ansible.com/)

# The Walk-through

The setup is divided into two sections, [Containerization](#containerization) and [Automation](#automation).

This post-walk-through mainly focuses on automation. Go [here]({{ "/blog/2021/06/15/How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible.html" | absolute_url }}) for the containerisation.

## Containerization

I didn't want the post to be too long.

Post continues [here]({{ "/blog/2021/06/15/How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible.html" | absolute_url }})

## Automation

See [The How](#the-how) for the justification of opting for Ansible for the automation.
### Prerequisite

If you already have [Ansible](https://www.ansible.com/) installed and configured you can skip this step else you can search for your installation methods.

```bash
python3 -m pip install ansible paramiko
```

Ensure dependency plugins have been installed as well.

```bash
ansible-galaxy collection install \
    ansible.posix \
    community.docker
```

### Directory Structure

In this section, I will go through each file in our `pypi_server` directory, which houses the configurations.

```bash
├── ansible.cfg
├── ansible-requirements-freeze.txt
├── host_inventory
├── Makefile
├── README.md
├── roles
│   └── pypi_server
│      ├── defaults
│      │    └── main.yml
│      ├── files
│      │    └── simple_test-1.0.zip
│      ├── tasks
│      │    └── main.yml
│      └── templates
│           └── nginx-pypi.conf.j2
└── up_pypi.yml
```


#### Ansible Configuration

Certain settings in Ansible are adjustable via a configuration file (ansible.cfg). The stock configuration is sufficient for most users, but in our case, we wanted certain configurations. Below is a sample of our `ansible.cfg`

```
cat >> ansible.cfg << EOF
[defaults]
inventory=host_inventory

# https://github.com/ansible/ansible/issues/14426
transport=paramiko

[ssh_connection]
pipelining=True
EOF
```

If installing Ansible from a package manager such as `apt`, the latest `ansible.cfg` file should be present in `/etc/ansible`.

If you installed Ansible from `pip` or the source, you may want to create this file to override default settings in Ansible. 

```bash
wget https://raw.githubusercontent.com/ansible/ansible/devel/examples/ansible.cfg
```

#### Selecting machine to run your commands from inventory

Ansible reads information about which machines you want to manage from your inventory. Although you can pass an IP address to an ad hoc command, you need inventory to take advantage of the full flexibility and repeatability of Ansible.

```
cat >> host_inventory << EOF
vagrant ansible_host=192.168.50.4 ansible_user=root ansible_become=yes

[pypi_server]
vagrant
EOF
```

For this post, I will be using a [Vagrant](https://www.vagrantup.com/intro) box.

According to the [docs](https://www.vagrantup.com/intro#introduction-to-vagrant):
> Vagrant is a tool for building and managing virtual machine environments in a single workflow. With an easy-to-use workflow and focus on automation, Vagrant lowers development environment setup time, increases production parity, and makes the "works on my machine" excuse a relic of the past.

> Vagrant will isolate dependencies and their configuration within a single disposable, consistent environment, without sacrificing any of the tools you are used to working with (editors, browsers, debuggers, etc.). 


Below is a `Vagrantfile`, used for local development which you may use, you would just need to run `vagrant up` and everything is installed and configured for you to work. 

```
cat >> Vagrantfile << EOF
# -*- mode: ruby -*-
# vi: set ft=ruby :
# set up the default terminal
ENV["TERM"]="linux"

Vagrant.configure(2) do |config|
    config.vm.box = "opensuse/Leap-15.2.x86_64"

    config.ssh.username = 'root'
    config.ssh.password = 'vagrant'
    config.ssh.insert_key = 'true'

    config.vm.network "private_network", ip: "192.168.50.4"
    config.vm.network "forwarded_port", guest: 3141, host: 3141 # devpi Access

    # consifure the parameters for VirtualBox provider
    config.vm.provider "virtualbox" do |vb|
        vb.memory = "1024"
        vb.cpus = 1
        vb.customize ["modifyvm", :id, "--ioapic", "on"]
    end
    config.vm.provision "shell", inline: <<-SHELL
      zypper --non-interactive install python3 python3-setuptools python3-pip
      zypper --non-interactive install docker
      systemctl enable docker
      usermod -G docker -a $USER
      systemctl restart docker
    SHELL
end
EOF
```

Thereafter run the following command which allows you to install an SSH key on a remote server's authorized keys and it facilitates SSH key login, which removes the need for a password for each login, thus ensuring a password-less, automatic login process.

```bash
# password: vagrant
ssh-copy-id vagrant@192.168.50.4
```

Once the vagrant box is up, use the ping module to ping all the nodes in your inventory:

```bash
ansible all -m ping
```

You should see output for each host in your inventory, similar to the image below:
![image](https://user-images.githubusercontent.com/7910856/122216743-fd0b3900-ceac-11eb-8eaf-099c2c71c837.png)

#### Ansible Roles

According to the [docs](https://docs.ansible.com/ansible/latest/user_guide/playbooks_reuse_roles.html):
>Roles let you automatically load related vars, files, tasks, handlers, and other Ansible artefacts based on a known file structure. After you group your content into roles, you can easily reuse them and share them with other users.

>An Ansible role has a defined directory structure with eight main standard directories. You must include at least one of these directories in each role. You can omit any directories the role does not use. 

Using the `ansible-galaxy` CLI tool that comes bundled with Ansible, you can create a role with the `init` command. For example, the following will create a role directory structure called `pypi_server` in the current working directory:

```bash
ansible-galaxy init pypi_server
```

See [Directory Structure](#directory-structure) above.

By default Ansible will look in each directory within a role for a `main.yml `file for relevant content:

- `defaults/main.yml`: default variables for the role.
- `files/main.yml`: files that the role deploys.
- `handlers/main.yml`: handlers, which may be used within or outside this role.
- `meta/main.yml`: metadata for the role, including role dependencies.
- `tasks/main.yml`: the main list of tasks that the role executes.
- `templates/main.yml`: templates that the role deploys.
- `vars/main.yml`: other variables for the role.


### Playbook

We defined our playbook which deploys the PyPI server below.

```
cat >> up_pypi.yml <<EOF
---
- name: configure and deploy a PyPI server
  hosts: pypi_server
  roles:
    - role: pypi_server
      vars:
        fqdn: # Fully qualified domain name
        fqdn_port: 80
        host_ip: "{{ hostvars[groups['pypi_server'][0]].ansible_default_ipv4.address }}"
        nginx_reverse_proxy: reverse_proxy
EOF
```

I found these posts relevant to the way we set up our `nginx_reverse_proxy`:
- [NGINX Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [How to Set Up an Nginx Reverse Proxy](https://www.hostinger.com/tutorials/how-to-set-up-nginx-reverse-proxy/)
- [How to setup Nginx Reverse Proxy](https://linuxconfig.org/how-to-setup-nginx-reverse-proxy)
- [How to Deploy NGINX Reverse Proxy on Docker](https://phoenixnap.com/kb/docker-nginx-reverse-proxy)
- [Setting up a Reverse-Proxy with Nginx and docker-compose](https://www.domysee.com/blogposts/reverse-proxy-nginx-docker-compose)

### Plays

**`files/`**: 

This is a simple tester for PyPI upload procedures. I modified [simple_test](https://pypi.org/project/simple_test) package that was downloaded from [https://pypi.org](https://pypi.org)

Download: [simple_test-1.0.zip](https://files.pythonhosted.org/packages/48/1d/73ed6695f69be0f5b3d752b6223e82304239c151cec71a38891b240a4d9c/simple_test-1.0.zip)

**`defaults/main.yml`**:

These are default variables for the role and they have the lowest priority of any variables available and can be easily overridden by any other variable, including inventory variables. They are used as default variables in the `tasks`

```
cat >> defaults/main.yml << EOF
---
container_name : pypi_server
base_image : << Your Docker Registry>>/pypi_server:latest

devpi_client_ver: '5.2.2'

devpi_port: 3141
devpi_user: devpi
devpi_group: devpi

devpi_folder_home: ./.devpi
devpi_nginx: /var/data/nginx

EOF
```

**`tasks/main.yml`**: 

In this `main.yml` file we have a list of tasks that the role executes in sequence (and the whole play fails if any of these tasks fail):

- Install `apt` and `python` packages.
    + Update apt cache and install `python3-pip`.
    + Install `ansible-docker` dependencies.
- Start `devpi` and configure `nginx` routings.
    + Start `devpi` server on `docker` container.
    + Pause for 30 seconds to ensure server is up.
    + Confirm if `docker` container is up.
    + Create PyPI user and an index.
    + Template `nginx` reverse proxy config.
    + Check if `nginx` reverse proxy is up.
    + Reload `nginx` reverse proxy.
- Check if PyPI server is running!
    + Install `python` dependencies locally in a virtual environment.
    + Check if `devpi` index is up and confirm `nginx` routing!
    + Login to `devpi` as PyPI user.
    + Find path to `simple-test` package.
    + Upload `simple-test` package to `devpi`.
    + Check if package was uploaded.
    + Install `python` package from PyPI server.
    + Garbage cleaning.

**Note:** These tasks are executed on the remote server, in this case, a vagrant box.

Below is the `main.yml` which details the configuration, deployment and testing of the PyPI server (in a vagrant box).

```
cat >> tasks/main.yml << EOF
---
- name: Install apt and python packages
  block:
  - name: update apt-cache and install python3-pip.
    apt:
      name: python3-pip
      state: latest
      update_cache: yes

  - name: install ansible-docker dependencies.
    pip:
      name: docker-py
      state: present

  become: yes
  tags: [devpi, packages]

- name: start devpi and configure Nginx routings
  block:
  - name: start devpi server on the docker container.
    community.docker.docker_container:
      name: "{{ container_name }}"
      image: "{{ base_image }}"
      volumes:
      - "{{ devpi_folder_home }}:/root/.devpi"
      ports:
      - "{{ devpi_port }}:{{ devpi_port }}"
      restart_policy: on-failure
      restart_retries: 10
      state: started

  - name: pause for 30 seconds to ensure server is up.
    pause:
      seconds: 30

  - name: "confirm if {{ container_name }} docker is up"
    community.docker.docker_container:
      name: "{{ container_name }}"
      image: "{{ base_image }}"
      state: present

  - name: create pypi user and an index.
    shell: "docker exec -ti {{ container_name }} /bin/bash -c '/data/create_pypi_index.sh'"
    register: command_output
    failed_when: "'Error' in command_output.stderr"

  - name: template nginx reverse proxy config
    template:
      src: "nginx-pypi.conf.j2"
      dest: "{{ devpi_nginx }}/{{ fqdn }}.conf"

  - name: "check if {{ nginx_reverse_proxy }} is up"
    community.docker.docker_container_info:
      name: "{{ nginx_reverse_proxy }}"
    register: result

  - name: "reload {{ nginx_reverse_proxy }}: nginx service"
    shell: "docker exec -ti {{ nginx_reverse_proxy }} bash -c 'service nginx reload'"
    when: result.exists

  - name: pause for 30 seconds to ensure nginx is reloaded.
    pause:
      seconds: 30

  tags: [docker, nginx]

- name: check if pypi server is running!
  delegate_to: localhost
  connection: local
  block:
  - name: install python dependencies locally in a virtual environment
    pip:
      name: devpi-client
      version: "{{ devpi_client_ver }}"
      virtualenv: /tmp/venv
      virtualenv_python: python3
      state: present

  - name: "check if devpi's index is up and confirm nginx routing!"
    shell: "/tmp/venv/bin/devpi use http://{{ fqdn }}/pypi/trusty"

  - name: login to devpi as pypi user
    shell: "/tmp/venv/bin/devpi login pypi --password="

  - name: find path to simple-test package
    find:
      paths: "."
      patterns: '*.zip'
      recurse: yes
    register: output

  - name: upload simple-test package to devpi
    shell: "/tmp/venv/bin/devpi upload {{ output.files[0]['path'] }}"

  - name: check if package was uploaded
    shell: "/tmp/venv/bin/devpi test simple-test"

  - name: install python package from pypi server
    pip:
      name: pip
      virtualenv: /tmp/venv
      extra_args: >
        --upgrade
        -i  http://{{ fqdn }}/pypi/trusty
        --trusted-host {{ fqdn }}

  - name: garbage cleaning
    file:
      path: "/tmp/venv"
      state: absent

  tags: [tests]
EOF
```


**`templates/`**:

Ansible uses [Jinja2 templating](https://jinja2docs.readthedocs.io/) to enable dynamic expressions and access to variables.

Below is an [Nginx](https://nginx.org/en/) templated config file used for routing from localhost to a dedicated [fqdn (Fully qualified domain name
)](https://en.wikipedia.org/wiki/Fully_qualified_domain_name)


```
cat >> nginx-pypi.conf.j2 <<EOF
server {
    server_name {{ fqdn }};
    listen 80;

    gzip             on;
    gzip_min_length  2000;
    gzip_proxied     any;
    gzip_types       application/json;

    proxy_read_timeout 60s;
    client_max_body_size 70M;

    # set to where your devpi-server state is on the filesystem
    root {{ devpi_folder_home }};

    # try serving static files directly
    location ~ /\+f/ {
        # workaround to pass non-GET/HEAD requests through to the named location below
        error_page 418 = @proxy_to_app;
        if ($request_method !~ (GET)|(HEAD)) {
            return 418;
        }

        expires max;
        try_files /+files$uri @proxy_to_app;
    }
    # try serving docs directly
    location ~ /\+doc/ {
        # if the --documentation-path option of devpi-web is used,
        # then the root must be set accordingly here
        root {{ devpi_folder_home }};
        try_files $uri @proxy_to_app;
    }
    location / {
        # workaround to pass all requests to / through to the named location below
        error_page 418 = @proxy_to_app;
        return 418;
    }
    location @proxy_to_app {
        proxy_pass http://{{ host_ip }}:{{ devpi_port }};
        proxy_set_header X-outside-url $scheme://$http_host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
```

#### Makefile
Below is a snippet from our Makefile, which makes it a lot easier to install dependencies and set up a PyPI server. This means that instead of typing the whole `pip` or `ansible-playbook` commands to install dependencies and bring up a PyPI server, we can run something like:

```bash
make install_pkgs pypi
```

You can also check out my over-engineered Makefile [here](https://github.com/mmphego/Generic_Makefile).

```
cat >> Makefile << EOF 
.DEFAULT_GOAL := help

define PRINT_HELP_PYSCRIPT
import re, sys
print("Please use `make <target>` where <target> is one of\n")
for line in sys.stdin:
    match = re.match(r'^([a-zA-Z_-]+):.*?## (.*)$$', line)
    if match:
        target, help = match.groups()
        if not target.startswith('--'):
            print(f"{target:20} - {help}")
endef

export PRINT_HELP_PYSCRIPT

help:
    python3 -c "$$PRINT_HELP_PYSCRIPT" < $(MAKEFILE_LIST)

install_pkgs:  ## Install Ansible dependencies locally.
    python3 -m pip install -r ansible-requirements-freeze.txt

lint: *.yml  ## Lint all yaml files
    echo $^ | xargs ansible-playbook -i host_inventory --syntax-check

pypi: ## Setup and start PyPI server
    ansible-playbook -i host_inventory -Kk up_pypi.yml
EOF
```


## Final Testing

To ensure deterministic `pypi_server` builds, I ran/did the following:

- [x] Stopped `pypi_server` container, delete `pypi_server` on server
- [x] Ran a CI job that builds and pushes Docker images to our local docker registry.
- [x] Started `pypi_server` container by executing `make pypi` whilst in the current working directory (ansible roles) on an ansible dedicated server.
- [x] Verified if `pypi.domain` fqdn is up (`curl http://pypi.domain && dig pypi.domain`) 
- [x] In a virtual environment, installed a random Python package then rebuilt the wheel before pushing it to `pypi.domain`

# Conclusion
Congratulations!!!

Accessing your FQDN you should see the devpi home page listing your indices:
![image](https://user-images.githubusercontent.com/7910856/122233152-1cf62900-cebc-11eb-979c-474ed3465823.png)

Assuming that everything was set up correctly. You now have a local/private PyPI server running in a Docker container that is under config management, thus ensuring deterministic builds and a single command can tear it down or bring it up.

This was a great Ansible and Nginx learning curve for me and if you have reached the end of this post. I appreciate you!

# Reference

- [Ansible](https://docs.ansible.com/ansible/latest/index.html)
- [Intro to playbooks](https://docs.ansible.com/ansible/latest/user_guide/playbooks_intro.html)
- [Ansible-devpi](https://github.com/dhellmann/ansible-devpi)
- [Nginx](https://nginx.org/en/)
