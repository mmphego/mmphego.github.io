---
layout: post
title: "How An EC2 Instance Became My Go-To Remote Development Solution Using Terraform"
date: 2024-08-18 14:09:37.000000000 +02:00
tags:
- AWS
- Remote Development
- Terraform
---
# How An EC2 Instance Became My Go-To Remote Development Solution Terraform.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2024-08-18-How-An-EC2-Instance-Became-My-Go-To-Remote-Development-Solution.png" | absolute_url }})
{: refdef}

<<TIME TO READ>>

---

# The Story

Due to strict network security policies enforced by tools like ZScaler causing endless installation failures and security warnings for Python dependencies on local development machine (work laptop). The constant need to reconfigure settings and whitelist packages to bypass these restrictions did not only cause disruption but also pose potential risks to my work laptops security. Faced with these challenges and the alternative being carrying 2x laptops left me with a bitter taste on my mouth. I considered an alternative solution, initially working on a development container. However, even with containers, security warnings persisted. Finally, I decided to shift my development work to a remote environment using an EC2 instance which offered me a more stable and secure solution without constant security warnings.

In this post, I'll share details on how I setup an EC2 instance as a remote development environment using [Terraform](https://www.terraform.io/). This setup has been a ket part of my personal Data Engineering End-to-End project I have been working on and my ongoing learning journey.

## The How

### Prerequisite

- **AWS account**: Account needs to have the appropriate permissions to create and manage resources.
- **AWS CLI**: The AWS command-line interface tool allows us to interact with AWS services.
- **Terraform**: This infrastructure-as-code tool helps define and manage the cloud resources.
- **An SSH Client**

This post assumes you are familiar with the tools mentioned above and/or have installed them.



## The Walk-through

### Connecting to the Instance with VS Code

- **Configure SSH Access:**
  - Ensure your EC2 instance has SSH access enabled on port 22 for your security group.
  - If you haven't already, create an SSH key pair on your local machine using `ssh-keygen` command.
- **Install the Remote SSH Extension:**
  - Open VS Code and navigate to the Extensions tab (`Ctrl+Shift+X`).
  - Search for **"Remote-SSH"** extension and install it.
- **Configure VS Code Remote Settings:**
  - Open the Command Palette (`Ctrl+Shift+P`).
  - Search for "Remote-SSH: Open SSH Configure File" and select it.
  - Choose an option to create a new SSH configuration file (usually the default option is recommended). This file will store your EC2 instance connection details.
- **Add Your EC2 Instance Configuration:**
  - The configuration file will open in your VS Code editor.
  - Add a new configuration for your EC2 instance following the format below, replacing placeholders with your actual values:

  ```bash
  Host "your_instance_hostname", // Replace with your EC2 instance hostname or IP address
    HostName "your_instance_hostname", // Replace with your EC2 instance hostname or IP address
    IdentityFile "~/.ssh/your_key_pair.pem" // Replace with the path to your private key file
    User "your_username", // Replace with your username on the EC2 instance (e.g., ubuntu)
  ```

- **Connect to Your Remote Environment:**
  - Click on the Remote Status bar indicator (left corner of VS Code) or navigate to the Command Palette again.
  - Search for "Remote-SSH: Connect to Host" and select it.
  - Choose the name you assigned to your EC2 instance configuration in the previous step.

Once connected, your VS Code workspace will switch to the remote environment on your EC2 instance. You should see the hostname of the EC2 instance in the status bar.

For more details on Remote Development using SSH, read:<https://code.visualstudio.com/docs/remote/ssh>


## Reference

- []()
- []()
