---
layout: post
title: "How I Setup Jenkins On Docker Container Using Ansible (Part 3)"
date: 2022-03-21 05:45:52.000000000 +02:00
tags:
- Jenkins
- Docker
- Ansible
- DevOps
- Makefile
- Python
---
# How I Setup Jenkins On Docker Container Using Ansible (Part 3)

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2022-03-21-How-I-setup-Jenkins-on-Docker-container-using-Ansible.png" | absolute_url }})
{: refdef}

<<TIME TO READ>>

---

# The Story

This post continues from [How I Setup Jenkins On Docker Container Using Ansible (Part 2)]({{ "/blog/2022/05/09/How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-2.html" | absolute_url }})

In this post, I will try to detail how to we deployed Jenkins environment using Ansible and configure Jenkins Jobs after system initialization.

## TL;DR

## The How

Now that we have our EC2 instance and a Docker image, we can start creating our Ansible playbook that will be used to deploy the Jenkins container.

## The Walk-through

The setup is divided into 3 sections, [Instance Creation]({{ "/blog/2022/05/09/How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-1.html" | absolute_url }}), [Containerization]({{ "/blog/2022/05/09/How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-2.html" | absolute_url }}) and [Automation]({{ "/blog/2022/03/21/How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-3.html" | absolute_url }}).

This post-walk-through mainly focuses on [***automation***](#create-ansible-playbook)

### Create Ansible Playbook

But before continue, the directory structure shown below should resemble what we should have once we are done with the walk-through.

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

The following sections will explain some of the files and directories we will be creating.

#### Dependencies

First, we need to create a list of dependencies to ensure that our host contains Ansible and it's plugins.

```bash
mkdir -p ~/tmp/jenkins-ansible && cd "$_"
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
cat > requirements.yaml <<"EOF"
collections:
  - name: ansible.posix
  - name: community.docker
  - name: community.general
EOF
```

Read more about the above Ansible plugins in the following links:

- [Ansible-Posix](https://docs.ansible.com/ansible/latest/collections/ansible/posix/index.html)
- [Ansible-Docker](https://docs.ansible.com/ansible/latest/collections/community/docker/index.html)
- [Ansible-General](https://docs.ansible.com/ansible/latest/collections/community/general/index.html)

#### Makefile

Then, let's create a `Makefile` that will be used to run the Ansible playbook and other mundane commands.
The snippet below is from our `Makefile`, which makes it a lot easier to install dependencies and deploy our environment. This means that instead of typing the whole `pip` or `ansible-playbook` commands to install dependencies and bring up a Jenkins server, we can run something like:

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

# If `venv/bin/python` exists, it is used. If not, use PATH to find python.
SYSTEM_PYTHON  = $(or $(shell which python3), $(shell which python))
PYTHON         = $(wildcard venv/bin/python)
VENV           = venv/bin/

.SILENT: --check-installed-packages
--check-installed-packages:
        if [ ! -x "$$(command -v $(VENV)ansible-playbook)" ]; then \
                $(MAKE) install_pkgs; \
        fi;

help:
        python3 -c "$$PRINT_HELP_PYSCRIPT" < $(MAKEFILE_LIST)

install_pkgs:  ## Install Ansible dependencies locally.
        test -d venv || virtualenv venv
        (\
          . venv/bin/activate; \
          $(PYTHON) -m pip install -r ansible-requirements-freeze.txt; \
        )

install_ansible_plugins:  ## Install Ansible plugins
        $(VENV)ansible-galaxy install -r requirements.yaml

lint: *.yml  ## Lint all yaml files
        find roles/ -name '*.yml' -exec $(VENV)ansible-playbook -i host_inventory --syntax-check {} \;
        ansible-lint -p -v *.yml

jenkins_dev: --check-installed-packages  ## Setup and start Jenkins CI - Dev environment
        $(VENV)ansible-playbook -i host_inventory up_jenkins_ec2.yml
EOF
```

{ % endraw %}

Now run the following commands to replace the spaces with tabs and to make the file executable:

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
export EC2_JENKINS_HOST=jenkins_ec2
cat > host_inventory <<EOF
[${EC2_JENKINS_HOST}]
ec2-54-210-189-63.compute-1.amazonaws.com
<<replace-with-ec2-host-or-ip>>.compute-1.amazonaws.com

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
source venv/bin/activate
ansible-playbook -i host_inventory test_connection.yml
rm -rf test_connection.yml
```

You should see the following output:

```bash
PLAY [jenkins_ec2] *******************************************************************

TASK [Gathering Facts] ***************************************************************
ok: [<<replace-with-ec2-host-or-ip>>.compute-1.amazonaws.com]

TASK [debug] *************************************************************************
ok: [<<replace-with-ec2-host-or-ip>>.compute-1.amazonaws.com] => {
    "msg": "Ansible is working!"
}

PLAY RECAP ***************************************************************************
<<replace-with-ec2-host-or-ip>>.compute-1.amazonaws.com : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
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
rm -rf files jenkins_dev/handlers jenkins_dev/meta jenkins_dev/templates jenkins_dev/tests jenkins_dev/.travis.yml
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
cat > ../up_jenkins_ec2.yml <<EOF
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
    jenkins_container_name: "jenkins_dev"
EOF
```

{% endraw %}

---

### Plays

**`jenkins_dev/defaults/main.yml`**:

These are default variables for the role and they have the lowest priority of any variables available and can be easily overridden by any other variable, including inventory variables. They are used as default variables in the `tasks`

```bash
cat > jenkins_dev/defaults/main.yml << "EOF"
---
home_dir: /opt/jenkins
backup_dir: /var/backups/jenkins_home
workspace_dir: /tmp/jenkins_workspace
EOF
```

**`jenkins_dev/tasks/main.yml`**:

In this `main.yml` file we have a list of tasks that the role executes in sequence (and the whole play fails if any of these tasks fail):

---

- Configure locale
  - set timezone
  - Set localedef compile local
  - Generate Locale
  - Set locals
- Install dependencies
  - Install some general useful packages.
  - install pip
  - install pip dependencies
- Install and configure docker
  - install pre-requisites for docker apt repository
  - add docker gpg key for apt
  - add docker apt repo
  - install docker
  - ensure systemd override config dir exists
  - configure systemd overrides (enable remote access over tcp)
  - reload systemd
  - ensure docker group exists
  - add user(s) to docker group
  - reset connection to make usermod take effect
  - restart docker service
  - smoke test docker installation
  - delete docker test image
  - share correct host dns config with containers
  - restart docker service again
- Configure jenkins enviroment and services
  - ensure home, workspace and backup directories exists
  - restart docker service
  - start jenkins docker container

**Note:** These tasks are executed on the remote server, in this case, the ec2 instance.

Below is the `main.yml` which details the configuration and deployment of the Jenkins server on our EC2 instance.

{% raw %}

```bash
cat > jenkins_dev/tasks/main.yml << "EOF"
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

- name: Install dependencies
  block:
    - name: Install some general useful packages.
      apt:
        update_cache: yes
        autoclean: yes
        pkg:
          - build-essential
          - dnsutils
          - git
          - python3
          - python3-dev
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

- name: Install and configure docker
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
      copy:
        dest: /etc/systemd/system/docker.service.d/override.conf
        content: |
          [Service]
          ExecStart=
          ExecStart=/usr/bin/dockerd -H fd:// -H unix:///var/run/docker.sock -H tcp://0.0.0.0:{{ tcp_listen_port }}

    - name: reload systemd
      shell: "systemctl daemon-reload"

    - name: ensure docker group exists
      shell: "groupadd docker"
      ignore_errors: yes

    - name: add user(s) to docker group
      shell: "usermod -aG docker {{ item }}"
      with_items: "{{ docker_users }}"

    - name: reset connection to make usermod take effect
      meta: reset_connection

    - name: restart docker service
      service:
        name: docker
        state: restarted

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
      # notify: restart docker (TODO: Add in the handler/main.yml)

    - name: restart docker service again
      service:
        name: docker
        state: restarted

  become: true

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
      become: true

    - name: restart docker service
      service:
        name: docker
        state: restarted
      become: true

    - name: start jenkins docker container
      docker_container:
        name: "{{ container_name }}"
        image: "{{ base_image }}"
        user: 0
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

**`jenkins_dev/vars/main.yml`**:

The `vars/main.yml` file contains the variables that are used to configure the Jenkins server.

```bash
cat > jenkins_dev/vars/main.yml <<"EOF"
---
tcp_listen_port: 4243
docker_version: 18.06.3~ce~3-0~ubuntu
docker_users:
  - ansible
container_name: "{{ jenkins_container_name }}"
base_image: amakhaba/jenkins-image:latest
EOF
```

### Deploy Jenkins

Once, all the required files are in place, we can check for any linting/syntax errors in the playbook.

```bash
make lint
```

If there are no errors, you can fix the syntax errors and run the linter again.

**Note:** This is command can be added into your CI/CD pipeline to ensure that the playbook is valid before running it.

After the playbook is valid, we can run the playbook.

```bash
make jenkins_dev
```

This will configure locale, install debian, python dependencies & configure docker and finally start the jenkins container.

You should see the following output:

```bash
venv/bin/ansible-playbook -i host_inventory up_jenkins_ec2.yml

PLAY [jenkins_ec2] **************************************************************************************************************************************************************

TASK [Gathering Facts] **********************************************************************************************************************************************************
ok: [<<ec2-or-host-ip>>.compute-1.amazonaws.com]

TASK [Verify that enviromental variables have been provided] ********************************************************************************************************************
ok: [<<ec2-or-host-ip>>.compute-1.amazonaws.com] => (item=jenkins_container_name)

TASK [jenkins_dev : set timezone] ***********************************************************************************************************************************************
ok: [<<ec2-or-host-ip>>.compute-1.amazonaws.com]

TASK [jenkins_dev : Set localedef compile local] ********************************************************************************************************************************
changed: [<<ec2-or-host-ip>>.compute-1.amazonaws.com]
...
TASK [jenkins_dev : ensure home, workspace and backup directories exists] *******************************************************************************************************
ok: [<<ec2-or-host-ip>>.compute-1.amazonaws.com] => (item=/opt/jenkins)
ok: [<<ec2-or-host-ip>>.compute-1.amazonaws.com] => (item=/tmp/jenkins_workspace)
ok: [<<ec2-or-host-ip>>.compute-1.amazonaws.com] => (item=/var/backups/jenkins_home)

TASK [jenkins_dev : restart docker service] *************************************************************************************************************************************
changed: [<<ec2-or-host-ip>>.compute-1.amazonaws.com]

TASK [jenkins_dev : start jenkins docker container] *****************************************************************************************************************************
changed: [<<ec2-or-host-ip>>.compute-1.amazonaws.com]

PLAY RECAP **********************************************************************************************************************************************************************
<<ec2-or-host-ip>>.compute-1.amazonaws.com : ok=26   changed=14   unreachable=0    failed=0    skipped=0    rescued=0    ignored=1
```

#### Verify Jenkins is running

Once the Jenkins container is running, we can verify that it is running by running the following command:

```bash
curl -svo /dev/null <<ec2-or-host-ip>>.compute-1.amazonaws.com:8080
```

You should see the following output:

```bash
*   Trying <public-ec2-ip>:8080...
* TCP_NODELAY set
* Connected to <<ec2-or-host-ip>>.compute-1.amazonaws.com (<public-ec2-ip>) port 8080 (#0)
> GET / HTTP/1.1
> Host: <<ec2-or-host-ip>>.compute-1.amazonaws.com:8080
> User-Agent: curl/7.68.0
> Accept: */*
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Date: Mon, 23 May 2022 07:54:14 GMT
< X-Content-Type-Options: nosniff
< Content-Type: text/html;charset=utf-8
< Expires: Thu, 01 Jan 1970 00:00:00 GMT
< Cache-Control: no-cache,no-store,must-revalidate
< X-Hudson-Theme: default
< Referrer-Policy: same-origin
< Cross-Origin-Opener-Policy: same-origin
< Set-Cookie: JSESSIONID.66ccc5a8=node0fb2asft1tfpx18c3hcfc0ytp57.node0; Path=/; HttpOnly
< X-Hudson: 1.395
< X-Jenkins: 2.321
< X-Jenkins-Session: bf3e9bdd
< X-Frame-Options: sameorigin
< X-Instance-Identity: MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhcd8NDL/PZM3LyfTj6rpZVCPqpTUfXAnSJItZ0XdCmk+J/O8jItxazaA3gEdK9cSTIH2ypGZUo+lSo5Yotcm9cyZIbj7vUpQgU8c6h866m//HeyRKt/ow2PeuI2FQE49CxV/YQZNYAA1/8WkWLRH/1ARIGcXRLmqBkCyhTDyBI1P959tylSvFbSbyHoqeLGHihzn0hoE8GSfuMFx2g72lSWqxEqw7GCouJlxzdNTAmsFJ2JOzAE1bQzDwJOFnhFNmo7hNEJKSxnJ5ly4xKzq9ej0875ccP6eP95VhYZtW0wZU4eCYXT0WEHLZeFxmbyVo0NFo8KmtZtYvHoqcE5/DQIDAQAB
< Content-Length: 15077
< Server: Jetty(9.4.43.v20210629)
<
{ [7433 bytes data]
* Connection #0 to host <<ec2-or-host-ip>>.compute-1.amazonaws.com left intact
```

If you see the above output, Jenkins is running. You can open the Jenkins UI by visiting the following URL:

```bash
<<ec2-or-host-ip>>.compute-1.amazonaws.com:8080
```

And you will see the following UI:

![2022-05-23_09-32](https://user-images.githubusercontent.com/7910856/169767081-a49517f8-bbbf-456c-aa34-77ad4647fbd8.png)

#### Troubleshooting

Should, you encounter any issues opening the Jenkins UI, this is a good place to verify if your EC2 instance's security group is configured correctly. Read more about [Amazon EC2 security groups for Linux instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html)

- Go to the AWS console and navigate to your EC2 instance.
- Find and Click the ***Security*** tab that your instance is apart of
![2022-05-23_10-08](https://user-images.githubusercontent.com/7910856/169773556-6094eac1-6acf-4671-b244-4a38b9841abd.png)
- Find and Click the ***Security Groups*** link
- Click on ***Inbound Rules***, then click on the ***Edit Inbound Rule*** button
![2022-05-23_09-23](https://user-images.githubusercontent.com/7910856/169766276-e08eca35-31ba-4a8d-8574-2f282350b402.png)
- Click on the ***Add rule*** button and,
- Use the drop down and add ***Custom TCP*** (port 8080) to the list
![2022-05-23_09-24](https://user-images.githubusercontent.com/7910856/169766272-926fda00-127e-4334-b990-3484a73ffdf0.png)
- Click on the ***Save*** button

That's it! You should now be able to open the Jenkins UI.

### Step 3

- build jobs

...

## Reference

- <https://www.geeksforgeeks.org/how-to-setup-jenkins-in-docker-container/>
- <https://www.digitalocean.com/community/tutorials/how-to-automate-jenkins-setup-with-docker-and-jenkins-configuration-as-code>
- <https://linoxide.com/setup-jenkins-docker/>
- <https://blog.visionify.ai/how-to-setup-jenkins-ci-system-with-docker-fdf9d664da3b>
