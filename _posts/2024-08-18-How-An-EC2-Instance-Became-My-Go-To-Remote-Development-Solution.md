---
layout: post
title: "How An EC2 Instance Became My Go-To Remote Development Solution Using Terraform"
date: 2024-08-18 14:09:37.000000000 +02:00
tags:
- AWS
- Remote Development
- Terraform
---
# How An EC2 Instance Became My Go-To Remote Development Solution Terraform

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

### Architectural Diagram

To better understand the setup, refer to the architectural diagram below:

![Data-Engineering-Project-Remote Development Instance Arch drawio](https://github.com/user-attachments/assets/4288bd6c-bb65-4949-ba55-fd9ae41ae6c8)

The diagram above illustrates an AWS setup for a remote development environment consisting of an EC2 with automatic cost optimization. The instance is located in a public subnet and is periodically monitored by a Lambda function triggered by [CloudWatch Events](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cwe-now-eb.html). If the instance is below a certain threshold defined during provisioning then the lambda function sends a `stop-instance` command via [SSM](https://docs.aws.amazon.com/systems-manager/latest/userguide/ssm-agent.html)

### Directory Structure

The directory structure below gives a clear view of how the Terraform configuration is organized:

```bash
>> $ tree -L 4
.
├── elastic_ip.tf
├── iam_role.tf
├── instance.tf
├── internet_gateway.tf
├── lambda.tf
├── lambda_function
│   └── lambda_function.py
├── lambda_function_payload.zip
├── outputs.tf
├── provider.tf
├── routing_table.tf
├── scripts
│   └── ec2-manager.py
├── security_groups.tf
├── ssh_key_pairs.tf
├── subnets.tf
├── terraform.tfvars
├── userdata.sh.tpl
├── variables.tf
└── vpcs.tf
```

- [Providers](https://developer.hashicorp.com/terraform/language/providers)
  - `provider.tf`: Configures the provider (e.g. AWS, Azure and/or GCP) and its settings.
- Network Configurations
  - `vpcs.tf`: Defines [Virtual Private Cloud](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html) (VPC) settings.
  - `subnets.tf`: Configures subnets within the VPC.
  - `routing_table.tf`: Sets up routing tables for network traffic.
  - `internet_gateway.tf`: Configures the Internet Gateway for VPC connectivity.
  - `elastic_ip.tf`: Manages Elastic IP addresses for public accessibility.
- Security and Access:
  - `security_groups.tf`: Defines security groups for controlling inbound and outbound traffic.
  - `ssh_key_pairs.tf`: Manages SSH key pairs for secure access to EC2 instances.
  - `iam_role.tf`: Configures IAM roles and policies for permissions and access control.
- [EC2 Instance Configuration](https://registry.terraform.io/providers/hashicorp/aws/2.36.0/docs/resources/instance):
  - `instance.tf`: Defines the EC2 instance, including its type and configurations.
  - `userdata.sh.tpl`: Provides a template script for initializing the instance (user data).
- Lambda Function:
  - `lambda.tf`: Configures the Lambda function and its triggers.
  - `lambda_function/lambda_function.py`: Contains the Lambda function code.
- Scripts:
  - `scripts/ec2-manager.py`: A custom script for managing the EC2 instance.
- [Outputs](https://developer.hashicorp.com/terraform/language/values/outputs):
  - `outputs.tf`: Defines outputs to provide information about the deployed resources.
- [Variables](https://developer.hashicorp.com/terraform/language/values/variables)
  - `variables.tf`: Defines variables used across the Terraform configuration.
  - `terraform.tfvars`: Contains values for the variables defined in `variables.tf`.

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
