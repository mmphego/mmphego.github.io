---
layout: post
title: "How I Setup Jenkins On Docker Container Using Ansible (Part 1)"
date: 2022-05-09 12:23:50.000000000 +02:00
tags:
- Ansible
- AWS
- DevOps
- Docker
- Jenkins
---
# How I Setup Jenkins On Docker Container Using Ansible (Part 1)

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2022-05-09-How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-1.png" | absolute_url }})
{: refdef}

7 Min Read

---

# The Story

Recently, my team found themselves in a situation where they needed to have a staging or development Jenkins environment. The motivation behind the need for a new environment was that we needed a backup Jenkins environment and a place where new Jenkins users could get their hands dirty with Jenkins without having to worry about changes to the production environment and most importantly we needed to ensure that our Jenkins environment is stored as code and could be easily replicated.

For this task, I decided to pair with my padawan/mentee (@AneleMakhaba) as he was a good fit for the task (and I wanted to disseminate the knowledge as well) which had been in the backlog for a while.

I thought this meme was relevant to the task.

![](https://user-images.githubusercontent.com/7910856/122241859-29ca4b00-cec3-11eb-94ca-ba484c3bb733.png)

Our initial approach to the task was to:

- Create a Docker image that would be used for our Jenkins environment which includes all the necessary dependencies and configuration files.
  - The configuration should be based on the production environment.
- Explore the "As code paradigm":
  - Create and version control ***Jenkins Configuration*** using [JCaC(Jenkins Configuration as Code[)](https://www.jenkins.io/projects/jcasc/), which is a plugin for Jenkins that provides the ability to define this whole configuration as a simple, human-friendly, plain text YAML syntax.
  - Create and version control ***Jenkins Job configuration*** using [Jenkins Job Builder](https://jenkins-job-builder.readthedocs.io/en/latest/), which is a Python package with the ability to store Jenkins jobs in a YAML format.
- Deploy a new Jenkins instance (dev-environment) with a single command
- Future work includes the ability to backup and restores Jenkins job history to the newly deployed environment with a single command.

---

[Anele Makhaba](https://za.linkedin.com/in/anele-makhaba-a36692161) recently gave a Lunch 'n Learn talk that summarises this post. The talk explores the following:

- Why do we need to configure Jenkins as Code?
- Managing Jenkins as Code
- Jenkins infrastructure as Code
- Jenkins Jobs as Code
- Some of the benefits of ***'as code'*** paradigm, and a demo

{:refdef: style="text-align: center;"}
<iframe width="100%" height="415" src="https://www.youtube.com/embed/wEL1KcKTjUw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
{: refdef}

---

This collaborated blog post is divided into 3 sections, [Instance Creation]({{ "/blog/2022/05/09/How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-1.html" | absolute_url }}), [Containerization]({{ "/blog/2022/05/09/How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-2.html" | absolute_url }}) and [Automation]({{ "/blog/2021/06/15/How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible.html" | absolute_url }}) to avoid a very long post and,

In this post, we will detail the steps that we undertook to create an environment ([EC2 [instance](https://aws.amazon.com/ec2/instance-types/)) that will host our Jenkins instance.

**Note:** We did not use any AWS services to host our Jenkins environment at our workplace, instead we used [Proxmox](https://www.proxmox.com/en/) containers.

Thank your Anele Makhaba (https://za.linkedin.com/in/anele-makhaba-a36692161), for your collaboration in writing this post.

---

## TL;DR

- Create an EC2 instance with the following specifications:
  - Instance type:`t2.micro`
  - Instance name: `jenkins-server`
  - Instance key pair: `jenkins-ec2`
  - AMI: `ami-09d56f8956ab235b3` (Ubuntu 20.04 LTS)
- SSH into the instance and create an `ansible` user with `sudo` rights.
- Copy the local ssh key to the instance and add it to the `ansible` user's `authorized_keys` file.

## The How

This is the first post in the series of posts that will detail the steps that we undertook to create an environment ([EC2 instance](https://aws.amazon.com/ec2/instance-types/)) for running Jenkins CI. The instance was launched via the AWS Console, a future post will detail the same steps using [Terraform](https://www.terraform.io/) for deterministic orchestrations.

## The Walk-through

This post-walk-through mainly focuses on ***instance creation***. If you would like to read more about the ***containerization*** click [here]({{ "/blog/2022/05/09/How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-2.html" | absolute_url }}) and [here]({{ "/blog/2021/06/15/How-I-setup-a-private-PyPI-server-using-Docker-and-Ansible.html" | absolute_url }}) for ***automation*** walk-through.

### Create an EC2 instance

To create an EC2 instance that will be used to run the Jenkins container head over to the [AWS Console](https://console.aws.amazon.com/ec2/) and create a new instance.

- On console, search for **EC2** and select it, then locate the **"Launch Instance"** button.
![image](https://user-images.githubusercontent.com/7910856/167109925-8509860a-1ee5-436c-8892-5a320827d41f.png)

- After selecting the **"Launch Instance"** button, add the **name of your instance** (I chose **Jenkins-server**) then select the **"Ubuntu"** option for the AMI (Amazon Machine Image).
![image](https://user-images.githubusercontent.com/7910856/167110033-a0953334-0a0b-406e-8168-f431624cb121.png)

- Choose an instance of your choice (for this post we chose a `t2.micro`), then select the `Create new key pair` button (these keys will be used to SSH into our instance later)
![image](https://user-images.githubusercontent.com/7910856/167110250-17cdc8d8-38be-418a-8ecc-f528df8bf361.png)

- After the instance is created we will need to wait for it to be ready and then we will be able to SSH into it by clicking on the **"Connect"** button and,
![image](https://user-images.githubusercontent.com/7910856/167112330-f82f2df3-0f25-408a-af39-fb67a87e66db.png)

- Follow the instructions to SSH into the instance.
![image](https://user-images.githubusercontent.com/7910856/167112430-d48bac13-f099-425a-ba6c-7d5e41dcc0e0.png)

Now, open a new terminal window on the host and SSH into the instance to ensure that everything is working as expected.

![image](https://user-images.githubusercontent.com/7910856/167112879-30d25b3f-c232-4f11-bf90-38eea7ce45c3.png)

### Create an Ansible user

**Note:** This is an optional step as we can use the default EC2 user in Ansible. Due to security reasons, it is recommended to create a dedicated Ansible user with sudo rights and only authorized access to the instance.

#### Generate the ssh-key for your user

First, we need to generate an ssh-key for our Ansible user from our localhost. This key will help ease the SSH connection to the instance. The following command will generate an ssh-key for the user `ansible` on localhost:

```bash
ssh-keygen -t rsa -b 4096 -C "ansible-user"
chmod 400 ~/.ssh/id_rsa
```

We can leave everything as default - a pair of private/public keys will be generated in `~/.ssh` as `id_rsa` (the private key) and `id_rsa.pub` (the public key).

Read more about [SSH Public and Private Key](https://docs.rockylinux.org/pt/guides/security/ssh_public_private_keys/)

We need to copy the contents of the public key - `id_rsa.pub` that looks like this:

```bash
cat ~/.ssh/id_rsa.pub

ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDAudXEIP2qNrYDOVdS5T7ZB7...............
ansible-user
```

Once we have our ssh-key, we can SSH into the EC2 instance.

```bash
ssh -i "jenkins-ec2.pem" ubuntu@<<ec2-host-or-ip>>.compute-1.amazonaws.com
```

Then we can create the ansible user and assign it ***sudo rights*** (I know) on the EC2 instance:

```bash
sudo su -
adduser ansible
echo "ansible ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
mkdir -p /home/ansible/.ssh
cd /home/ansible/.ssh
```

Then paste the public key, and contents that we generated earlier on the host environment into the `authorized_keys` file and save.

```bash
vi authorized_keys
```

This will ensure that we can SSH into the instance without a password, and we can run Ansible commands without being prompted for a password each time.

**Note:** This is not the best security practice, but it is a good starting point.

Going back to the host environment, we can test the SSH connection to the EC2 instance using the ansible user that we just created:

![image](https://user-images.githubusercontent.com/7910856/167115045-cfea6afa-c896-463f-938b-e7003d0fd212.png)

Once you have a completed instance that you can SSH into, then you can create a Jenkins server on it. The post [How I setup Jenkins on Docker container using Ansible Part 2]({{ "/blog/2022/05/09/How-I-setup-Jenkins-on-Docker-container-using-Ansible-Part-2.html" | absolute_url }}) will detail the steps to create a Jenkins server on an EC2 instance.

## Conclusion

Congratulations! You have successfully created an EC2 instance that will run the Jenkins environment. You can now use the instance to run Ansible playbooks and containers. Another avenue to explore is [Terraform](https://www.terraform.io/) for deterministic deployment instead of relying on the AWS Console. This will be covered in future posts.

## Reference

- [Ansible](https://www.ansible.com/)
- [AWS Console](https://console.aws.amazon.com/ec2/)
- [EC2 instance](https://aws.amazon.com/ec2/instance-types/)
- [Jenkins](https://jenkins.io/)
- [SSH Public and Private Key](https://docs.rockylinux.org/pt/guides/security/ssh_public_private_keys/)
- [Terraform](https://www.terraform.io/)
