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
ssh -i "jenkins-ec2.pem" ubuntu@my-ec2-host-or-ip.compute-1.amazonaws.com
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

### Step 2

- Pre configuration:
  - Export docker(HUB & Registry) credentials
  - Export jenkins contrainer name
  - Export jenkins url to point the instance to.

...

### Step 3

...

## Reference

- <https://www.geeksforgeeks.org/how-to-setup-jenkins-in-docker-container/>
- <https://www.digitalocean.com/community/tutorials/how-to-automate-jenkins-setup-with-docker-and-jenkins-configuration-as-code>
- <https://linoxide.com/setup-jenkins-docker/>
- <https://blog.visionify.ai/how-to-setup-jenkins-ci-system-with-docker-fdf9d664da3b>
