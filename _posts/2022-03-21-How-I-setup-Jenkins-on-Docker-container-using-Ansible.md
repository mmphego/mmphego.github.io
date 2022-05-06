---
layout: post
title: "How I Setup Jenkins On Docker Container Using Ansible"
date: 2022-03-21 05:45:52.000000000 +02:00
tags:
-
-
-
---
# How I Setup Jenkins On Docker Container Using Ansible

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2022-03-21-How-I-setup-Jenkins-on-Docker-container-using-Ansible.png" | absolute_url }})
{: refdef}

<<TIME TO READ>>

---

# The Story

Recently, my team found themselves in a situation where they needed to have a staging or development Jenkins environment. The motivation behind the need for a new environment was that, we needed a backup Jenkins environment and a place where new Jenkins users could get their hands dirty with Jenkins without having to worry about changes to the production environment.
For this task, I decided to pair with my padawan (@AneleMakhaba) as he was a good fit for the task which had been in the backlog for a while.

![](https://user-images.githubusercontent.com/7910856/122241859-29ca4b00-cec3-11eb-94ca-ba484c3bb733.png)

The objective of the task was to:

- Create a Docker container that would be able to run Jenkins on a local machine
- Explore the "As code paradigm":
  - Create and store Jenkins Configuration using [JCaC(Jenkins Configuration as Code)](https://www.jenkins.io/projects/jcasc/)
    - Create and store Jenkins Job configuration using [Jenkins Job Builder](https://jenkins-job-builder.readthedocs.io/en/latest/) Python package with ability to restore the configurations during deployment.
- Deploy new jenkins instance (dev-enviroment) as code.
- Future work included, the ability to backup and restore jenkins job history to the newly deployed environment.

In this post, we will detail the steps we took to create the environment and deploy it as code on an [EC2 instance](https://aws.amazon.com/ec2/instance-types/) using Ansible.

---

## TL;DR

- Create a Docker container that would be able to run Jenkins on a local machine with configuration.

## The How

{:refdef: style="text-align: center;"}
<iframe width="100%" height="315" src="https://www.youtube.com/embed/wEL1KcKTjUw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
{: refdef}

## The Walk-through

### Step 1: Create an EC2 instance

#### Create an EC2 instance

We will need to create an EC2 instance that will be used to run the Jenkins container. Headover to the [AWS Console](https://console.aws.amazon.com/ec2/) and create a new instance.

See screenshots below on how to create an EC2 instance.

- On console search for EC2 and select the "Launch Instance" button.
![image](https://user-images.githubusercontent.com/7910856/167109925-8509860a-1ee5-436c-8892-5a320827d41f.png)
- After selecting the "Launch Instance" button, add a name of your instance (in my case Jenkins-server) then select the "Ubuntu" option.
![image](https://user-images.githubusercontent.com/7910856/167110033-a0953334-0a0b-406e-8168-f431624cb121.png)
- Choose an instance of your choice, for this post we chose a `t2.micro`, there after select the `Create new key pair` button (these keys will be used when we SSH into our instance later)
![image](https://user-images.githubusercontent.com/7910856/167110250-17cdc8d8-38be-418a-8ecc-f528df8bf361.png)

After the instance is created, we will need to wait for it to be ready and then we will be able to SSH into it by clicking on the "Connect" button.
![image](https://user-images.githubusercontent.com/7910856/167112330-f82f2df3-0f25-408a-af39-fb67a87e66db.png)
and follow the instructions to SSH into the instance as shown in the image below.
![image](https://user-images.githubusercontent.com/7910856/167112430-d48bac13-f099-425a-ba6c-7d5e41dcc0e0.png)

Now, ssh into the instance to ensure that everything is working as expected.

![image](https://user-images.githubusercontent.com/7910856/167112879-30d25b3f-c232-4f11-bf90-38eea7ce45c3.png)

#### Create an ansible user

**Note** this is an optional step as we can use the default EC2 user in Ansible as well, but I like creating a specific user for Ansible maily for security reasons.

##### Generate ssh-key for your user

We'll be needing this key pair to connect to the EC2 instance.

In the host environment, we will create an ssh-key that will be used for your Ansible user:

```bash
ssh-keygen -t rsa -b 4096 -C "ansible-user"
chmod 400 ~/.ssh/id_rsa
```

We can leave everything as default - a pair of private/public keys will be generated in `~/.ssh` as `id_rsa` (the private key) and `id_rsa.pub` (the public key).

We need to copy the contents of the public key - `id_rsa.pub` that looks like this:

```bash
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDAudXEIP2qNrYDOVdS5T7ZB7...............
ansible-user
```

Once we have our ssh-key, we can SSH into the EC2 instance.

```bash
ssh -i "jenkins-ec2.pem" ubuntu@<<ec2-host-or-ip>>.compute-1.amazonaws.com
```

Then we can create the ansible user on the EC2 instance:

```bash
sudo su -
adduser ansible
mkdir -p /home/ansible/.ssh
cd /home/ansible/.ssh
```

Then paste the public key contents that we generated earlier on the host environment into the `authorized_keys` file and save.

```bash
vi authorized_keys
```

Going back to the host environment, we can test the SSH connection to the EC2 instance using the ansible user that we just created:

![image](https://user-images.githubusercontent.com/7910856/167115045-cfea6afa-c896-463f-938b-e7003d0fd212.png)

### Step 2: Create Ansible Playbook

Now that we have our EC2 instance, we can start creating our Ansible playbook that will be used to deploy the Jenkins container.

But before we do, let's explore our directory structure as this will help us to understand the Ansible playbook later.

#### Directory Structure

```bash
tree -L 3
.
├── ansible.cfg
├── ansible-requirements-freeze.txt
├── host_inventory
├── Makefile
├── requirements.yml
├── roles
│   └── jenkins_dev
│       ├── defaults
│       ├── tasks
│       └── vars
└── up_jenkins_ec2.yml

5 directories, 6 files
```

The following sections will explains some of the files and directories we will be creating.

#### Dependencies

First, we need to create a list of dependencies to ensure that our host contains Ansible and it's plugins.

```bash
cat > ansible-requirements-freeze.txt <<"EOF"
# Frozen requirements for Ansible
ansible==4.8.0
ansible-core==2.11.8
bcrypt==3.2.0
cffi==1.15.0
cryptography==36.0.1
Jinja2==3.0.3
MarkupSafe==2.0.1
packaging==21.3
paramiko==2.9.2
pycparser==2.21
PyNaCl==1.5.0
pyparsing==3.0.7
PyYAML==6.0
resolvelib==0.5.4
six==1.16.0
EOF
```

Create a list of Ansible plugins that will be required on our EC2 instance.

```bash
cat > requirements.yml <<"EOF"
collections:
  - name: ansible.posix
  - name: community.docker
  - name: community.general
EOF
```

#### Makefile

First, let's create a Makefile that will be used to run the Ansible playbook. The snippet below is from our Makefile, which makes it a lot easier to install dependencies and deploy our environment. This means that instead of typing the whole `pip` or `ansible-playbook` commands to install dependencies and bring up a Jenkins server, we can run something like:

```bash
make install_pkgs install_ansible_plugins
```

The above command will install all the dependencies that we need to run the Ansible playbook, but first we need to generate the `Makefile` below.

{ % raw %}

```bash
cat > Makefile <<"EOF"
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

.SILENT: --check-installed-packages
--check-installed-packages:
        if [ ! -x "$$(command -v ansible-playbook)" ]; then \
                $(MAKE) install_pkgs; \
        fi;

help:
        python3 -c "$$PRINT_HELP_PYSCRIPT" < $(MAKEFILE_LIST)

install_pkgs:  ## Install Ansible dependencies locally.
        python3 -m pip install -r ansible-requirements-freeze.txt

install_ansible_plugins:  ## Install Ansible plugins
        ansible-galaxy install -r requirements.yml

lint: *.yml  ## Lint all yaml files
        echo $^ | xargs ansible-playbook -i host_inventory --syntax-check

jenkins_dev: --check-installed-packages  ## Setup and start Jenkins CI - Dev environment
        ansible-playbook -i host_inventory -Kk up_jenkins_ec2.yml
EOF
```

{ % endraw %}

Now run the following commands to replace the spaces with tabs:

```bash
unexpand Makefile > Makefile.new
mv Makefile.new Makefile
```

You can also check out my over-engineered Makefile [here](https://github.com/mmphego/Generic_Makefile).

#### Ansible Configuration

Certain settings in Ansible are adjustable via a configuration file (`ansible.cfg`). The stock configuration is sufficient for most users, but in our case, we wanted certain configurations. Below is a sample of our `ansible.cfg`

```bash
cat >> ansible.cfg << EOF
[defaults]
inventory=host_inventory
EOF
```

If installing Ansible from a package manager such as `apt`, the latest `ansible.cfg` file should be present in `/etc/ansible`.

If you installed Ansible from `pip` or the source, you may want to create this file to override default settings in Ansible.

```bash
wget https://raw.githubusercontent.com/ansible/ansible/devel/examples/ansible.cfg
```

#### Setting up machine to run your commands from inventory

Ansible reads information about which machines you want to manage from your inventory. Although you can pass an IP address to an ad-hoc command, you need inventory to take advantage of the full flexibility and repeatability of Ansible. The Ansible inventory file defines the hosts and groups of hosts upon which commands, modules, and tasks in a playbook will run on.

Setup the `host_inventory` file that will be used by Ansible to connect to our EC2 instance.

```bash
mkdir -p ~/tmp/jenkins-ansible && cd "$_"
export EC2_JENKINS_HOST=jenkins_ec2
cat > host_inventory <<EOF
[${EC2_JENKINS_HOST}]
<<ec2-host-or-ip>>.compute-1.amazonaws.com

[${EC2_JENKINS_HOST}:vars]
ansible_user=ansible
ansible_ssh_private_key_file=/home/{{ ansible_user }}/.ssh/ansible-user
EOF
```

Let's create a simple Ansible playbook on the host, that will test our connection to the EC2 instance. [Sanity Check]

```bash
cat > test_connection.yml <<EOF
---
- hosts: ${EC2_JENKINS_HOST}
  tasks:
      - debug: msg="Ansible is working!"
EOF
ansible-playbook -i host_inventory test_connection.yml
rm -rf test_connection.yml
```

You should see the following output:

```bash
PLAY [jenkins_ec2] **************************************************************************************************************************************************************

TASK [Gathering Facts] **********************************************************************************************************************************************************
ok: [<<ec2-host-or-ip>>.compute-1.amazonaws.com]

TASK [debug] ********************************************************************************************************************************************************************
ok: [<<ec2-host-or-ip>>.compute-1.amazonaws.com] => {
    "msg": "Ansible is working!"
}

PLAY RECAP **********************************************************************************************************************************************************************
<<ec2-host-or-ip>>.compute-1.amazonaws.com : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

Now, that our ansible playbook works, we can move on to the next step.

#### Ansible Roles

According to the [docs](https://docs.ansible.com/ansible/latest/user_guide/playbooks_reuse_roles.html):

>Roles let you automatically load related vars, files, tasks, handlers, and other Ansible artefacts based on a known file structure. After you group your content into roles, you can easily reuse them and share them with other users.

>An Ansible role has a defined directory structure with eight main standard directories. You must include at least one of these directories in each role. You can omit any directories the role does not use.

Using the `ansible-galaxy` CLI tool that comes bundled with Ansible, you can create a role with the `init` command. For example, the following will create a role directory structure called `jenkins_dev` in the current working directory:

```bash
mkdir -p roles && cd "$_"
ansible-galaxy init jenkins_dev
rm -rf files handlers meta templates tests
```

See [Directory Structure](#directory-structure) above.

By default Ansible will look in each directory within a role for a `main.yml`file for relevant content:

- `defaults/main.yml`: default variables for the role.
- `files/main.yml`: files that the role deploys.
- `handlers/main.yml`: handlers, which may be used within or outside this role.
- `meta/main.yml`: metadata for the role, including role dependencies.
- `tasks/main.yml`: the main list of tasks that the role executes.
- `templates/main.yml`: templates that the role deploys.
- `vars/main.yml`: other variables for the role.

But for the sake of simplicity, we will remove some of the default directories as we will not be using them.

### Playbook

We defined our playbook which deploys the Jenkins server below.

{% raw %}

```bash
cat >> up_jenkins_ec2.yml <<"EOF"
---
- hosts: ${EC2_JENKINS_HOST}
  pre_tasks:
    - name: Verify that enviromental variables have been provided
      assert:
        quiet: true
        that: "{{item}} != ''"
        fail_msg: "Required variable {{ vars[ item ].split(',')[-1].split(')')[0] }} has not been provided"
      loop:
        - jenkins_container_name

  roles:
    - role: jenkins_dev
      vars:
        home_dir: /opt/jenkins
        backup_dir: /var/backups/jenkins_home
        workspace_dir: /tmp/jenkins_workspace
  vars:
    ansible_python_interpreter: "/usr/bin/python3"
    jenkins_container_name: "{{ lookup('env', 'JENKINS_CONTAINER_NAME') or 'jenkins_dev' }}"
EOF
```

{% endraw %}

@amakhaba, run `make dev_jenkins` to test the playbook.

---

### Plays

**`defaults/main.yml`**:

These are default variables for the role and they have the lowest priority of any variables available and can be easily overridden by any other variable, including inventory variables. They are used as default variables in the `tasks`

```bash
cat > defaults/main.yml << "EOF"
---
home_dir: /opt/jenkins
backup_dir: /var/backups/jenkins_home
workspace_dir: /tmp/jenkins_workspace
EOF
```

**`tasks/main.yml`**:

In this `main.yml` file we have a list of tasks that the role executes in sequence (and the whole play fails if any of these tasks fail):

- ensure home, workspace and backup directories exists
- restart docker service
- start jenkins docker container

**Note:** These tasks are executed on the remote server, in this case, a vagrant box.

Below is the `main.yml` which details the configuration and deployment of the Jenkins server on our EC2 instance.

{% raw %}

```bash
cat > tasks/main.yml << "EOF"
---
- name: Configure locale
  block:
    - name: set timezone
      timezone:
        name: Africa/Johannesburg

    - name: Set localedef compile local
      command: localedef -c -i en_ZA -f UTF-8 en_ZA.UTF-8

    - name: Generate Locale
      command: locale-gen en_ZA.UTF-8

    - name: Set locals
      command: update-locale LANG="en_ZA.UTF-8"
  become: true
  become_user: root

- name: Configure packages
  block:
    - name: Install some general useful packages.
      apt:
        update_cache: yes
        autoclean: yes
        pkg:
          - build-essential
          - dnsutils
          - git
          - python-dev
          - python3-dev
          - python3.9-dev
          - software-properties-common
          - vim
      state: present

  - name: install pip
    shell: "curl https://bootstrap.pypa.io/pip/get-pip.py -o /tmp/get-pip.py && python3 /tmp/get-pip.py "
    become: yes
    ignore_errors: yes

  - name: install pip dependencies
    shell: "python3 -m pip install --upgrade {{item}}"
    with_items:
      - docker>=5.8.0
      - pip
      - requests
      - setuptools
      - wheel

  become: true
  become_user: root

- name: Configure docker
  block:

  - name: install pre-requisites for docker apt repository
    apt:
      name:
        - apt-transport-https
        - ca-certificates
        - curl
        - gnupg-agent
        - software-properties-common
      state: present

  - name: add docker gpg key for apt
    apt_key:
      url: https://download.docker.com/linux/ubuntu/gpg
      id: 9DC858229FC7DD38854AE2D88D81803C0EBFCD88
      state: present

  - name: add docker apt repo
    apt_repository:
      repo: "deb [arch=amd64] https://download.docker.com/linux/ubuntu {{ansible_distribution_release}} stable"
      state: present

  - name: install docker
    apt:
      pkg:
        - docker-ce
        - docker-ce-cli
        - containerd.io
      update_cache: yes
      state: present

  - name: ensure systemd override config dir exists
    file:
      path: /etc/systemd/system/docker.service.d
      state: directory

  - name: configure systemd overrides (enable remote access over tcp)
    template:
      src: systemd_docker_override.conf
      dest: /etc/systemd/system/docker.service.d/override.conf
    notify: reload systemctl

  - name: ensure docker group exists
    shell: "groupadd docker"
    ignore_errors: yes
    become: yes

  - name: add user(s) to docker group
    shell: "usermod -aG docker {{ item }}"
    with_items: "{{ docker_users }}"
    become: yes

  - name: reset connection to make usermod take effect
    meta: reset_connection

  - name: restart docker service
    service:
      name: docker
      state: restarted

  - name: update docker directory permissions
    shell: "chown -R {{ item }}:{{ item }} /home/{{ item }}/.docker"
    with_items: "{{ docker_users }}"
    become: yes

  - name: smoke test docker installation
    shell: docker run --rm hello-world
    become_user: "{{ item }}"
    with_items: "{{ docker_users }}"

  - name: delete docker test image
    shell: docker rmi hello-world
    become_user: "{{ item}}"
    with_items: "{{ docker_users }}"

  - name: share correct host dns config with containers
    file:
      path: /etc/resolv.conf
      src: /run/systemd/resolve/resolv.conf
      state: link
    notify: restart docker

- name: Configure jenkins enviroment and services
  block:
  - name: ensure home, workspace and backup directories exists
    file:
      path: "{{ item }}"
      state: directory
      owner: "{{ ansible_user }}"
      group: "{{ ansible_user }}"
      mode: "0755"
    with_items:
      - "{{ home_dir }}"
      - "{{ workspace_dir }}"
      - "{{ backup_dir }}"

  - name: restart docker service
    service:
      name: docker
      state: restarted

  - name: start jenkins docker container
    docker_container:
      name: "{{ container_name }}"
      image: "{{ base_image }}"
      volumes:
        - "{{ home_dir }}:/var/jenkins_home"
        - "{{ backup_dir }}:/var/backups/jenkins_home"
        - "{{ workspace_dir }}:/var/jenkins_home/workspace"
        - "/etc/timezone:/etc/timezone"
        - "/etc/localtime:/etc/localtime"
      published_ports:
        - 8080:8080
        - 50000:50000
      state: started
      restart: yes
      timeout: 120
EOF
```

{% endraw %}

**`vars/main.yml`**:

{ % raw %}

```bash
cat > vars/main.yml <<"EOF"
---
tcp_listen_port: 4243
docker_version: 18.06.3~ce~3-0~ubuntu
docker_users:
  - ansible
container_name: "{{ jenkins_container_name }}"
base_image: our_jenkins_image:latest"

EOF
```

{% endraw %}

### Test Ansible

...

### Step 3

...

### Step 3

- build jobs

...

## Reference

- <https://www.geeksforgeeks.org/how-to-setup-jenkins-in-docker-container/>
- <https://www.digitalocean.com/community/tutorials/how-to-automate-jenkins-setup-with-docker-and-jenkins-configuration-as-code>
- <https://linoxide.com/setup-jenkins-docker/>
- <https://blog.visionify.ai/how-to-setup-jenkins-ci-system-with-docker-fdf9d664da3b>
