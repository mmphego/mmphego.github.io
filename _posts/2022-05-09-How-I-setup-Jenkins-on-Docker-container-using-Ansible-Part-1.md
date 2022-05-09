---
layout: post
title: "How I Setup Jenkins On Docker Container Using Ansible-Part-1"
date: 2022-05-09 12:23:50.000000000 +02:00
tags:
- Jenkins
- Docker
- Ansible
- DevOps
---
# How I Setup Jenkins On Docker Container Using Ansible-Part-1

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2022-05-09-How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-1.png" | absolute_url }})
{: refdef}

<<TIME TO READ>>

---

# The Story

Recently, my team found themselves in a situation where they needed to have a staging or development Jenkins environment. The motivation behind the need for a new environment was that, we needed a backup Jenkins environment and a place where new Jenkins users could get their hands dirty with Jenkins without having to worry about changes to the production environment.
For this task, I decided to pair with my padawan (@AneleMakhaba) as he was a good fit for the task which had been in the backlog for a while.

![](https://user-images.githubusercontent.com/7910856/122241859-29ca4b00-cec3-11eb-94ca-ba484c3bb733.png)

The objective of the task was to:

- Create a Docker image that would be used for our Jenkins environment which includes all the necessary dependencies and configuration files.
- Explore the "As code paradigm":
  - Create and store Jenkins Configuration using [JCaC(Jenkins Configuration as Code)](https://www.jenkins.io/projects/jcasc/)
  - Create and store Jenkins Job configuration using [Jenkins Job Builder](https://jenkins-job-builder.readthedocs.io/en/latest/) Python package with ability to restore the configurations during deployment.
- Deploy new jenkins instance (dev-enviroment) as code.
- Future work includes, the ability to backup and restore jenkins job history to the newly deployed environment with a single command.

This blog post is divided into 3 sections, [Instance Creation]({{ "/blog/.<>html" | absolute_url }}), [Containerization][here]({{ "/blog/<>.html" | absolute_url }}) and [Automation]({{ "/blog/2021/06/15/How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible.html" | absolute_url }}) to avoid a very long post and,

In this post, we will detail the steps that we undertook to create an environment ([EC2 instance](https://aws.amazon.com/ec2/instance-types/)) which will host our Jenkins instance.

<!-- In this post, we will detail the steps we took to create the environment and deploy it as code on an [EC2 instance](https://aws.amazon.com/ec2/instance-types/) using Ansible. -->

---

## TL;DR

- Create an EC2 instance with the following specifications:
  - Instance type:`t2.micro`
  - Instance name: `jenkins-server`
  - Instance key pair: `jenkins-ec2`
  - AMI: `ami-09d56f8956ab235b3` (Ubuntu 20.04 LTS)
- SSH into the instance and create an `ansible` user with `sudo` rights.
- Copy local ssh key to the instance and add it to the `ansible` user's `authorized_keys` file.

## The How

## The Walk-through

### Prerequisites

If you already have [Docker](https://docs.docker.com/get-docker/) and [Docker-Compose]() installed and configured you can skip this step else you can search for your installation methods.

```bash
sudo apt install docker.io
# The Docker service needs to be set up to run at startup.
sudo systemctl start docker
sudo systemctl enable docker
python3 -m pip install docker-compose
```

The setup is divided into 3 sections, [Instance Creation]({{ "/blog/.<>html" | absolute_url }}), [Containerization][here]({{ "/blog/<>.html" | absolute_url }}) and [Automation]({{ "/blog/2021/06/15/How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible.html" | absolute_url }}).

This post-walk-through mainly focuses on automation. Go [here]([here]({{ "/blog/2021/06/15/How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible.html" | absolute_url }})) for the containerisation.

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
echo "ansible ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
mkdir -p /home/ansible/.ssh
cd /home/ansible/.ssh
```

Then paste the public key contents that we generated earlier on the host environment into the `authorized_keys` file and save.

```bash
vi authorized_keys
```

Going back to the host environment, we can test the SSH connection to the EC2 instance using the ansible user that we just created:

![image](https://user-images.githubusercontent.com/7910856/167115045-cfea6afa-c896-463f-938b-e7003d0fd212.png)

## Reference

- []()
- []()
