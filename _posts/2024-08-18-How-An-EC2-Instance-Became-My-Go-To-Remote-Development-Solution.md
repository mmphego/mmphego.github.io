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

8 Min Read

---

# The Story

Due to strict network security policies enforced by tools like ZScaler causing endless installation failures and security warnings for Python dependencies on local development machine (work laptop). The constant need to reconfigure settings and whitelist packages to bypass these restrictions did not only cause disruption but also pose potential risks to my work laptops security. Faced with these challenges and the alternative being carrying 2x laptops left me with a bitter taste on my mouth. I considered an alternative solution, initially working on a development container. However, even with containers, security warnings persisted. Finally, I decided to shift my development work to a remote environment using an EC2 instance which offered me a more stable and secure solution without constant security warnings.

A remote development environment, such as an EC2 instance, offers several  advantages.

- First, it provides enhanced security and isolation. By separating development activities from your local machine, you reduce the risk of security breaches and maintain a controlled environment for managing dependencies.
- Also, remote environments allow for precise resource management. You can allocate resources based on your project's specific needs, which is particularly beneficial for handling resource-intensive tasks that might otherwise strain your local hardware such as running multiple Docker containers (Airflow, PySpark and etc)
- Lastly, remote environments ensure consistency across different workstations since the infrastructure is defined in code. This uniformity helps prevent the common issue of "it works on my machine" making it easier for teams to collaborate effectively.

In this post, I'll share details on how I setup an EC2 instance as a remote development environment using [Terraform](https://www.terraform.io/). This setup has been a ket part of my personal Data Engineering End-to-End project I have been working on and my ongoing learning journey.

Special thanks to  [Ayanda Shiba](https://za.linkedin.com/in/ayanda-shiba) and [Theo Mamoswa](https://za.linkedin.com/in/theo-mamoswa-02103768), whose collaboration and insights were invaluable throughout this process. [Ayanda Shiba](https://za.linkedin.com/in/ayanda-shiba) and [Theo Mamoswa](https://za.linkedin.com/in/theo-mamoswa-02103768), whom I had the pleasure of mentoring, played a significant role in refining the setup and ensuring its effectiveness. Their contributions were instrumental in shaping the final solution detailed below.

# The How

## Prerequisite

- **AWS account**: Account needs to have the appropriate permissions to create and manage resources.
- **AWS CLI**: The AWS command-line interface tool allows us to interact with AWS services.
- **Terraform**: This infrastructure-as-code tool helps define and manage the cloud resources.
- **An SSH Client**

This post assumes familiarity with these tools and their installation.

# The Walk-through

## Architectural Diagram

To better understand the setup, refer to the architectural diagram below:

![Data-Engineering-Project-Remote Development Instance Arch drawio](https://github.com/user-attachments/assets/4288bd6c-bb65-4949-ba55-fd9ae41ae6c8)

The diagram above illustrates an AWS setup for a remote development environment consisting of an EC2 with automatic cost optimization. The instance is located in a public subnet and is periodically monitored by a Lambda function triggered by [CloudWatch Events](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cwe-now-eb.html). If the instance is below a certain threshold defined during provisioning then the lambda function sends a `stop-instance` command via [SSM](https://docs.aws.amazon.com/systems-manager/latest/userguide/ssm-agent.html)

## Setting Up Your EC2 Instance with Terraform

[Terraform](https://www.terraform.io/) manages our infrastructure on AWS and all the configurations is defined in code. This approach ensures a clean, consistent, and dependency-controlled provisioning process by leveraging virtual environments within Terraform.

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

### File Breakdown

Here's a breakdown of the Terraform configurations files illustrated above.

#### **Providers:**

- `provider.tf`: Configures the provider (e.g. AWS, Azure and/or GCP) and its settings. See <https://developer.hashicorp.com/terraform/language/providers>

```bash
$ cat provider.tf
terraform {
required_providers {
    aws = {
    source = "hashicorp/aws"
    # https://registry.terraform.io/providers/hashicorp/aws/5.37.0
    version = "~> 5.37.0"
    }
}

required_version = ">= 1.2.0"
}

provider "aws" {
region  = var.region
profile = var.profile
}
```

The AWS provider is configured to use version `5.37.0` and specifies that the AWS `region` and `profile` are derived from variables `var.region` and `var.profile`.

#### **Network Configurations:**

- `vpcs.tf`: Defines [Virtual Private Cloud](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html) (VPC) settings.
- `subnets.tf`: Configures subnets within the VPC.
- `routing_table.tf`: Sets up routing tables for network traffic.
- `internet_gateway.tf`: Configures the Internet Gateway for VPC connectivity.
- `elastic_ip.tf`: Manages Elastic IP addresses for public accessibility.

```bash
cat vpcs.tf subnets.tf routing_table.tf internet_gateway.tf elastic_ip.tf

# ------------ VPC ------------
resource "aws_vpc" "dev_instance_vpc" {
  cidr_block           = var.network_cidr
  enable_dns_hostnames = true

  tags = {
    Name = "${var.tag_name} VPC"
  }
}
# ------------ Subnets ------------
# Subnets with routes to the internet
resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.dev_instance_vpc.id
  cidr_block        = var.public_subnet_cidr_block
  availability_zone = var.availability_zone
  # cidr_block        = cidrsubnet(aws_vpc.dev_instance_vpc.cidr_block, 4, 2)
  # Double check this by going through the logs:  https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/subnet

  tags = {
    Name = "${var.tag_name}: Public Subnet"
  }
}
# ------------ Routing Table ------------
# Route table with a route to the internet
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.dev_instance_vpc.id

  tags = {
    Name = "Public Subnet Route Table"
  }
}

resource "aws_route" "public_internet_gateway" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.dev_instance_igw.id
}

# Associate public route table with the public subnets
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
# ------------ Internet Gateway ------------
# Internet gateway to reach the internet
resource "aws_internet_gateway" "dev_instance_igw" {
  vpc_id = aws_vpc.dev_instance_vpc.id
}

# ------------ Elastic IP ------------
resource "aws_eip" "dev_instance_eip" {
  instance   = aws_instance.Remote_Dev_Instance.id
  domain     = "vpc"
  depends_on = [aws_internet_gateway.dev_instance_igw, aws_instance.Remote_Dev_Instance]

  tags = {
    Name = "${var.tag_name}: EIP"
  }
}

resource "aws_eip_association" "eip_assoc" {
  instance_id   = aws_instance.Remote_Dev_Instance.id
  allocation_id = aws_eip.dev_instance_eip.id
}
```

The config above, sets up a VPC with DNS hostnames enabled, creating the base network layer. A public subnet is also created within this VPC. We then configure the routing tables and routes to the internet via an Internet Gateway, ensuring that instances in the public subnet can access the internet. We provision the Internet Gateway for VPC connectivity, and setup a static public IP address. Finally, associating it with the EC2 instance for consistent public accessibility.

#### **Security and Access:**

- `security_groups.tf`: Defines security groups for controlling inbound and outbound traffic.

  ```bash
  $ cat security_groups.tf

  # ------------ Security Groups ------------
  # Create a security group for our instance
  resource "aws_security_group" "dev_instance_security_group" {
    name   = var.dev_instance_security_group
    vpc_id = aws_vpc.dev_instance_vpc.id

    # Incoming traffic
    ingress {
      description = "Allow SSH access to the instance"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      # cidr_blocks = [var.network_cidr]
      # This is not secure for production environments.
      # Use a bastian host with more restrictions
      cidr_blocks = ["0.0.0.0/0"] # Allow all outbound traffic
    }

    ingress {
      description = "Allow HTTP access to the instance"
      from_port   = 8080
      to_port     = 8080
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"] # Allow all outbound traffic
    }

    # Outgoing traffic
    egress {
      from_port   = 0
      protocol    = "-1"
      to_port     = 0
      cidr_blocks = ["0.0.0.0/0"] # Allow all outbound traffic
    }

    tags = {
      Name = "allow network traffic"
    }
  }
  ```

  The config above, focuses on the `security_groups.tf` file that defines the security groups that control inbound and outbound traffic for our EC2 instance. We create a security group with rules that allow SSH access on port 22 and HTTP access to port 8080 (For Airflow UI) from any IP Address.

  **Note:** This open access is primarily for the project development where SSH security concerns are minimal since access is managed through key pairs.
  For future implementations, we recommend restricting SSH access to specific IP addresses or using a bastion host to enhance security.

- `ssh_key_pairs.tf`: Manages SSH key pairs for secure access to EC2 instances.

  ```bash
  $ cat ssh_key_pairs.tf

  # ------------ Key-Pair ------------
  resource "tls_private_key" "dev_key" {
    algorithm = "RSA"
    rsa_bits  = 4096
  }

  resource "aws_key_pair" "generated_key" {
    key_name   = var.generated_key_name
    public_key = tls_private_key.dev_key.public_key_openssh
    tags = {
      Name = "${var.tag_name}: Key Pairs"
    }
  }

  # Not recommended
  resource "local_file" "ssh_key" {
    filename        = "${aws_key_pair.generated_key.key_name}.pem"
    content         = tls_private_key.dev_key.private_key_pem
    file_permission = "0400"
  }
  ```

  The `ssh_key_pairs.tf` file above manages the creation of SSH key pairs for secure access to the EC2 instances. We generate a new RSA key pair and use it to create an AWS key pair resource. The private key is saved locally for easy access.

  **Note:** For future implementations, it is crucial to manage private keys securely and following best practices (MFA, Key rotation and Secure Storage).

- `iam_role.tf`: Configures IAM roles and policies for permissions and access control.

  ```bash
  $ cat iam_role.tf

  # ------------ IAM ------------
  # IAM Role for EC2 with SSM SendCommand permission

  resource "aws_iam_role" "ec2_ssm_role" {
    name = "ec2-ssm-role"
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = "sts:AssumeRole"
          Effect = "Allow"
          Principal = {
            Service = "ec2.amazonaws.com"
          }
        }
      ]
    })
  }

  # IAM Role Policy for SSM SendCommand

  resource "aws_iam_role_policy" "ssm_send_command_policy" {
    name       = "ssm-send-command-policy"
    role       = aws_iam_role.ec2_ssm_role.id
    depends_on = [aws_vpc.dev_instance_vpc]
    policy     = <<EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "ssmmessages:SendCommand"
        ],
        "Resource": [
          "arn:aws:ssm:${var.region}:${aws_vpc.dev_instance_vpc.owner_id}:instance/*"
        ]
      }
    ]
  }
  EOF
  }

  resource "aws_iam_role_policy_attachment" "ssm_send_command_policy" {
    role       = aws_iam_role.ec2_ssm_role.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  }

  # Create IAM Instance Profile
  resource "aws_iam_instance_profile" "ec2_ssm_profile" {
    name = "ec2-ssm-instance-profile"
    role = aws_iam_role.ec2_ssm_role.name
  }

  # ---------------------------------------------------------------
  # IAM Role for Lambda

  resource "aws_iam_role" "lambda_role" {
    name = "lambda-role-ssm"
    path = "/service-role/"
    assume_role_policy = jsonencode(
      {
        Statement = [
          {
            Action = "sts:AssumeRole"
            Effect = "Allow"
            Principal = {
              Service = "lambda.amazonaws.com"
            }
          },
        ]
        Version = "2012-10-17"
      }
    )
  }

  # ---------------------------------------------------------------
  # IAM Role for Lambda logging
  resource "aws_iam_policy" "lambda_logging" {
    name        = "lambda_logging"
    path        = "/"
    description = "IAM policy for logging from a lambda"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ]
          Effect   = "Allow"
          Resource = "arn:aws:logs:*:*:*"
        }
      ]
    })
  }

  resource "aws_iam_role_policy_attachment" "lambda_logs" {
    role       = aws_iam_role.lambda_role.name
    policy_arn = aws_iam_policy.lambda_logging.arn
  }

  resource "aws_cloudwatch_log_group" "lambda_log_group" {
    name              = "/aws/lambda/${var.lambda_function_name}"
    retention_in_days = 3
  }

  # IAM additional policies for Lambda
  data "aws_iam_policy" "ssm_access" {
    arn = "arn:aws:iam::aws:policy/AmazonSSMFullAccess"
  }

  data "aws_iam_policy" "ec2_readonly_access" {
    arn = "arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess"
  }

  data "aws_iam_policy" "lambda_execution_acces" {
    arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  }

  resource "aws_iam_role_policy_attachment" "ssm_access_role_attachment" {
    role       = aws_iam_role.lambda_role.name
    policy_arn = data.aws_iam_policy.ssm_access.arn
  }
  resource "aws_iam_role_policy_attachment" "ec2_readonly_access_role_attachment" {
    role       = aws_iam_role.lambda_role.name
    policy_arn = data.aws_iam_policy.ec2_readonly_access.arn
  }
  resource "aws_iam_role_policy_attachment" "lambda_execution_acces_role_attachment" {
    role       = aws_iam_role.lambda_role.name
    policy_arn = data.aws_iam_policy.lambda_execution_acces.arn
  }
  ```

  The `iam_role.tf` file above configures IAM roles and policies required for managing various permissions and access control. We are setting up IAM roles for our EC2 instances and Lambda functions, attaching the necessary policies to grant permissions for SSM (AWS System Manager) commands and logging (via CloudWatch). The EC2 role is assigned permissions to interact with SSM, while the Lambda role has permissions for logging and accessing EC2 and SSM resources.

#### **EC2 Instance Configuration:**

- `instance.tf`: Defines the EC2 instance, including its type and configurations.

  ```bash
  $ cat instance.tf

  # ------------ EC2 Instance ------------
  data "template_file" "userdata" {
    template = file("${path.module}/userdata.sh.tpl")
    vars = {
      github_auth_token = var.github_auth_token,
      github_repo_branch = var.github_repo_branch,
      github_repo_name = var.github_repo_name
    }
  }

  resource "aws_instance" "Remote_Dev_Instance" {
    ami           = var.ami
    instance_type = var.instance_type

    root_block_device {
      volume_size = var.root_storage_size
      volume_type = var.root_storage_type
    }

    subnet_id                   = aws_subnet.public.id
    vpc_security_group_ids      = [aws_security_group.dev_instance_security_group.id]
    associate_public_ip_address = true

    user_data = data.template_file.userdata.rendered

    key_name = var.generated_key_name
    # This approach guarantees that the key pair is generated and
    # available before the instance launch, preventing potential
    # errors due to missing key pairs.
    depends_on = [
      aws_key_pair.generated_key
      , aws_iam_instance_profile.ec2_ssm_profile
    ]

    iam_instance_profile = aws_iam_instance_profile.ec2_ssm_profile.name

    tags = {
      Name = "${var.tag_name}"
    }
  }

  # Terraform module to configure AWS SSM Default Host Management
  # Read more: https://docs.aws.amazon.com/systems-manager/latest/userguide/managed-instances-default-host-management.html
  module "ssm_default_host_management_role" {
    source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role"
    version = "5.20.0"

    create_role = true

    trusted_role_services = [
      "ssm.amazonaws.com"
    ]

    role_name         = "AWSSystemsManagerDefaultEC2InstanceManagementRole"
    role_requires_mfa = false

    custom_role_policy_arns = [
      "arn:aws:iam::aws:policy/AmazonSSMManagedEC2InstanceDefaultPolicy",
    ]
  }

  resource "aws_ssm_service_setting" "default_host_management" {
    setting_id    = "arn:aws:ssm:${var.region}:${aws_vpc.dev_instance_vpc.owner_id}:servicesetting/ssm/managed-instance/default-ec2-instance-management-role"
    setting_value = "service-role/AWSSystemsManagerDefaultEC2InstanceManagementRole"
    depends_on    = [aws_vpc.dev_instance_vpc]
  }
  ```

  The configuration above, defines an EC2 instance with specific settings including AMI, instance type, and storage. The instance is configured to use a `user-data` script during instance initialization, which is provided by the `userdata.sh.tpl` file detailed below. The instance is also associated with a security group and an IAM instance profile for permissions defined above. The setup includes integration with [AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html) for ensuring the instance is managed efficiently.

- `userdata.sh.tpl`: Provides a template script for initializing the instance (`userdata`).

  ```bash
  $ cat userdata.sh.tpl

  #!/usr/bin/env bash

  # Log file to track the execution of the user data script
  touch /tmp/userdata_script.log
  echo "Starting user data script execution: $(date)" >> /tmp/userdata_script.log

  # Update package list and install necessary packages
  apt-get update -qq
  apt-get install -y \
      build-essential \
      ca-certificates \
      curl \
      glibc-source \
      libc6 \
      libstdc++6 \
      lsb-release \
      net-tools \
      gnupg \
      python3-pip\
      python3-venv \
      tar

  # Set up Docker repository and install Docker
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -qq
  apt-get install -y \
      containerd.io \
      docker-buildx-plugin \
      docker-ce \
      docker-ce-cli \
      docker-compose \
      docker-compose-plugin

  # Set up Docker group and start Docker service
  su - ubuntu
  groupadd docker
  sudo usermod -aG docker ubuntu
  sudo systemctl enable docker
  sudo service docker start

  # Set up Python environment and project repository
  cd /home/ubuntu
  python3 -m venv /home/ubuntu/.pyenv
  .pyenv/bin/python -m pip install -U pip
  git clone -b ${github_repo_branch} "https://oauth2:${github_auth_token}@github.com/${github_repo_name} /home/ubuntu/Data-Engineering-Project"
  .pyenv/bin/python -m pip install -r /home/ubuntu/Data-Engineering-Project/requirements.out

  # Set permissions and ownership for project files
  sudo chown -R ubuntu:ubuntu /home/ubuntu/Data-Engineering-Project
  sudo chmod -R a+rwx /home/ubuntu/.pyenv

  # Add Python virtual environment activation to .bashrc for convenience
  echo 'source /home/ubuntu/.pyenv/bin/activate' >> /home/ubuntu/.bashrc

  # Create a script to check for active SSH connections on port 22
  echo '#!/usr/env bash' > /home/ubuntu/check_ssh_connections.sh
  echo 'netstat -an | grep "ESTABLISHED" | grep ":22 "' >> /home/ubuntu/check_ssh_connections.sh
  chmod a+x /home/ubuntu/check_ssh_connections.sh

  # TODO: Parameterize should I not want to also run Airflow on startup
  # Create directories for Airflow configuration and set permissions
  mkdir -p /home/ubuntu/Data-Engineering-Project/004_Orchestration/AirFlow/{dags,logs,plugins,config}
  chmod -R 777 /home/ubuntu/Data-Engineering-Project/004_Orchestration/AirFlow/{dags,logs,plugins,config}

  # Configure and run Airflow using Docker Compose
  echo -e "AIRFLOW_UID=$(id ubuntu -u)" >> /home/ubuntu/Data-Engineering-Project/004_Orchestration/AirFlow/.env
  echo -e "AIRFLOW_GID=0" >> /home/ubuntu/Data-Engineering-Project/004_Orchestration/AirFlow/.env
  chmod -R 777 /home/ubuntu/Data-Engineering-Project/004_Orchestration/AirFlow/{dags,logs,plugins,config}
  docker-compose -f /home/ubuntu/Data-Engineering-Project/004_Orchestration/AirFlow/airflow-docker-compose.yaml up airflow-init
  docker-compose -f /home/ubuntu/Data-Engineering-Project/004_Orchestration/AirFlow/airflow-docker-compose.yaml up -d

  # Perform system upgrade and clean up
  sudo apt upgrade -y
  sudo apt-get autoclean
  sudo apt-get autoremove

  # Log completion of the user data script
  echo "User data script execution complete: $(date)" >> /tmp/userdata_script.log
  ```

  The `userdata.sh.tpl` file provides a script to set up the EC2 instance upon launch. It installs all the necessary packages, sets up Docker, configures Python environments, clones the provided project repository and deploys project-specific Python packages.
  The script also includes configurations for running Airflow using Docker and performs system maintenance tasks.

The combination of `instance.tf` and `userdata.sh.tpl` ensures that the EC2 instance is properly configured and ready for use in the development environment. Ensuring that all package dependencies are installed, repository is installed and Airflow is configured during instance initialization.

#### **Lambda Function:**

- `lambda.tf`: Configures the Lambda function and its triggers.

  ```bash
  $ cat lambda.tf

  # ------------ Lambda ------------
  data "archive_file" "lambda" {
    type        = "zip"
    source_file = "lambda_function/lambda_function.py"
    output_path = "lambda_function_payload.zip"
  }

  resource "aws_lambda_function" "stop_instance" {
    architectures = [
      "x86_64",
    ]
    description      = "An AWS Lambda function that automatically stops an EC2 instance if there hasn't been an SSH connection to it in over x minutes."
    function_name    = var.lambda_function_name
    handler          = "lambda_function.lambda_handler"
    memory_size      = 128
    package_type     = "Zip"
    role             = aws_iam_role.lambda_role.arn
    filename         = "lambda_function_payload.zip"
    runtime          = "python3.10"
    skip_destroy     = false
    source_code_hash = data.archive_file.lambda.output_base64sha256

    tags = {
      "lambda-console:blueprint" = "stop-instance-lambda"
    }
    timeout = 300

    ephemeral_storage {
      size = 512
    }

    logging_config {
      log_format = "Text"
    }
    depends_on = [
      aws_iam_role_policy_attachment.lambda_logs,
      aws_cloudwatch_log_group.lambda_log_group,
    ]
  }

  # CloudWatch Events rule to trigger an AWS Lambda function at regular intervals
  resource "aws_cloudwatch_event_rule" "stop_instance" {
    description         = "Trigger an AWS Lambda function at regular intervals"
    name                = "stop_instance"
    schedule_expression = "rate(${var.lambda_event_rate})"
  }

  resource "aws_cloudwatch_event_target" "check_instance_every_x_minutes" {
    rule = aws_cloudwatch_event_rule.stop_instance.name
    arn  = aws_lambda_function.stop_instance.arn

    # Pass the event data as a JSON string
    input = jsonencode({
      "tag_key" : "Name",
      "tag_value" : aws_instance.Remote_Dev_Instance.tags.Name
    })

    depends_on = [
      aws_instance.Remote_Dev_Instance,
      aws_cloudwatch_event_rule.stop_instance,
      aws_lambda_function.stop_instance,
    ]
  }

  resource "aws_lambda_permission" "allow_cloudwatch_to_call_stop_instance" {
    statement_id  = "AllowExecutionFromCloudWatch"
    action        = "lambda:InvokeFunction"
    function_name = aws_lambda_function.stop_instance.function_name
    principal     = "events.amazonaws.com"
    source_arn    = aws_cloudwatch_event_rule.stop_instance.arn
  }
  ```

  The `lambda.tf` file defines the Lambda function and its event-rule triggers. It packages the Lambda code into a zip file, configures the Lambda function with required properties, and sets up a CloudWatch Events rule to trigger the function at regular intervals. Permissions are also configured to allow CloudWatch to invoke the Lambda function.

- `lambda_function/lambda_function.py`: Contains the Lambda function written in Python.

  ```bash
  $ cat lambda_function/lambda_function.py

  import logging
  import time

  import boto3

  # Initialize AWS clients
  ec2_client = boto3.client("ec2")
  ssm_client = boto3.client("ssm")

  # Configure logging
  logging.basicConfig(level=logging.INFO)
  logger = logging.getLogger()


  def wait_for_command_invocation(command_id, instance_id, max_retries=5, wait_interval=4):
      for _ in range(max_retries):
          try:
              get_cmd_invocation = ssm_client.get_command_invocation(
                  CommandId=command_id, InstanceId=instance_id
              )
              if get_cmd_invocation["Status"] in ["Success", "Failed"]:
                  return get_cmd_invocation
              time.sleep(wait_interval)
          except Exception as e:
              logger.error(f"Could not get command invocation: {str(e)}")
              time.sleep(wait_interval)
      raise RuntimeError(f"Command {command_id} failed after {max_retries} retries.")


  def check_recent_ssh_connection(instance_id):
      try:
          response = ssm_client.send_command(
              InstanceIds=[instance_id],
              DocumentName="AWS-RunShellScript",
              Parameters={"commands": ["bash /home/ubuntu/check_ssh_connections.sh"]},
          )
          command_id = response["Command"]["CommandId"]

          invocation_response = wait_for_command_invocation(command_id, instance_id)
          standard_output_content = invocation_response.get("StandardOutputContent", "")

          return "tcp" in standard_output_content
      except Exception as e:
          logger.error(f"Failed to check SSH connection: {str(e)}")
          return False


  def get_instance_id(reservations):
      return [
          instance["InstanceId"]
          for reservation in reservations
          for instance in reservation["Instances"]
          if instance["State"]["Name"] == "running"
      ]


  def lambda_handler(event, context):
      tag_key = event.get("tag_key")
      tag_value = event.get("tag_value")

      if not tag_key or not tag_value:
          logger.error("Missing tag_key or tag_value in the event")
          return

      custom_filter = [{"Name": f"tag:{tag_key}", "Values": [tag_value]}]
      try:
          reservations = ec2_client.describe_instances(Filters=custom_filter)["Reservations"]
          instance_ids = get_instance_id(reservations)

          if len(instance_ids) != 1:
              logger.info("No or multiple instances found. Skipping stop.")
              return

          instance_id = instance_ids[0]
          if not check_recent_ssh_connection(instance_id):
              logger.info(f"No SSH connection detected on instance {instance_id}. Stopping instance.")
              ec2_client.stop_instances(InstanceIds=[instance_id])
          else:
              logger.info(f"Instance {instance_id} has had an SSH connection. Skipping stop.")
      except Exception as e:
          logger.error(f"Error in lambda_handler: {str(e)}")
  ```

  The Lambda function above, checks if an EC2 instance with a specific tag name has had recent SSH connections by executing a script `check_ssh_connections.sh` via SSM. It retrieves instance IDs based on tags, checks SSH activity, and stops the instance if no recent connections are detected. The function handles edge cases where no or multiple instances are found and manages retries for command execution. This setup helps automate the management of EC2 instances to optimize resource usage and costs.

#### **Scripts:**

- `scripts/ec2-manager.py`: A custom script for managing the EC2 instance.

  ```bash
  import argparse
  import logging

  import boto3


  def parse_arguments():
      """Parses command-line arguments using argparse."""
      parser = argparse.ArgumentParser(description="Manage EC2 instances based on tags")
      parser.add_argument(
          "action",
          choices=["start", "stop"],
          help="Action to perform (start or stop)",
      )
      parser.add_argument(
          "--tag-name", default="Name", help="Tag name to match (Default: %(default)s)"
      )
      parser.add_argument(
          "--tag-value",
          default="Dev Remote Instance",
          help="Tag value to match (Default: %(default)s",
      )
      parser.add_argument(
          "--log-level",
          choices=["debug", "info", "warning", "error", "critical"],
          default="info",
          help="Logging level (Default: %(default)s)",
      )
      return parser.parse_args()


  def get_instances(client, tag_name, tag_value):
      """Retrieves EC2 instances matching the specified tag."""
      filters = [{"Name": f"tag:{tag_name}", "Values": [tag_value]}]
      reservations = client.describe_instances(Filters=filters)["Reservations"]
      return reservations


  def manage_instances(client, action, instance_id, state):
      """Starts or stops an EC2 instance based on action and current state."""
      if (state == "running" and action == "stop") or (
          state == "stopped" and action == "start"
      ):
          if action == "start":
              response = client.start_instances(InstanceIds=[instance_id])
              logging.info(f"Starting instance {instance_id}")
          else:
              response = client.stop_instances(InstanceIds=[instance_id])
              logging.info(f"Stopping instance {instance_id}")
          return response
      else:
          logging.info(f"Instance {instance_id} is already {state}")
          return None


  def main():
      args = parse_arguments()
      logging.basicConfig(level=getattr(logging, args.log_level.upper()))

      client = boto3.client("ec2")

      reservations = get_instances(client, args.tag_name, args.tag_value)
      if not reservations:
          logging.info("No instances found with matching tag.")
          return

      for reservation in reservations:
          for instance in reservation["Instances"]:
              instance_id = instance["InstanceId"]
              state = instance["State"]["Name"]
              manage_instances(client, args.action, instance_id, state)


  if __name__ == "__main__":
      main()
  ```

  The script provided above needs to be executed manually once the development instance is no longer needed, it allows you to manually start or stop your EC2 instance based on tags, which can be useful for managing your development environment. Further ensuring that resources are managed effectively.

#### **Outputs:**

- `outputs.tf`: Defines outputs to provide information about the deployed resources.

  ```bash
  # ------------ Outputs ------------

  output "public_dns" {
    description = "Public DNS name of the EC2 instance"
    value       = aws_instance.Remote_Dev_Instance.public_dns
  }

  output "public_ip" {
    description = "Public IP address of the EC2 instance"
    value       = aws_instance.Remote_Dev_Instance.public_ip
  }

  output "instance_connection_parameters" {
    description = "SSH connection parameters for the EC2 instance"
    value       = "-i ${aws_key_pair.generated_key.key_name}.pem ubuntu@${aws_instance.Remote_Dev_Instance.public_dns}"
  }
  ```

  The `outputs.tf` config above, defines outputs that are printed to STDOUT once the EC2 instance is deployed. It includes the public DNS name and public IP address which is essential for remote access. Additionally, it also provides the SSH connection paramater string for connecting to the EC2 instance, which details the command needed to connect to the instance using SSH, including the keypair and username.

  Usage: `ssh $(terraform output -raw instance_connection_parameters)`, this will connect to the EC2 instance.

#### **Variables:**

- `variables.tf`: Defines variables used across the Terraform configuration.

  ```bash

  # ------------ Variables ------------
  variable "generated_key_name" {
    type        = string
    default     = "remote-dev-instance-tf-key-pair"
    description = "Key-pair generated by Terraform"
  }

  variable "ami" {
    type = string
    # List of available AMIs can be found here: https://cloud-images.ubuntu.com/locator/ec2/
    default     = "ami-0e95d283a666c6ea0"
    description = "AMI ID for Ubuntu 22.04 LTS"
  }

  variable "instance_type" {
    type        = string
    default     = "t2.medium"
    description = "EC2 instance type"
  }

  variable "region" {
    type    = string
    default = "eu-west-1"
  }

  variable "network_cidr" {
    default     = "10.0.0.0/16"
    description = "CIDR block for the VPC"
  }

  variable "public_subnet_cidr_block" {
    default     = "10.0.1.0/24"
    description = "CIDR block for the public subnet"
  }

  variable "availability_zone" {
    default     = "eu-west-1a"
    description = "Availability zone to deploy the resources"
  }

  variable "tag_name" {
    description = "Tag name for all resources"
    default     = "Remote Dev Instance"
  }

  variable "dev_instance_security_group" {
    type        = string
    default     = "terraform-security-group"
    description = "Allow HTTP/SSH traffic from interweb"
  }

  variable "profile" {
    type        = string
    default     = "Terraform_credentials"
    description = "profile for terraform credentials"
  }

  variable "root_storage_size" {
    type        = number
    default     = 20
    description = "AWS root storage size"
  }

  variable "root_storage_type" {
    type        = string
    default     = "gp2"
    description = "root storage type"
  }

  variable "lambda_function_name" {
    type        = string
    default     = "stop_instance"
    description = "Lambda function that stop instance if it's running and with no SSH connection"
  }

  variable "lambda_event_rate" {
    type        = string
    default     = "rate(30 minute)"
    description = "Lambda event rate"
  }

  variable "github_auth_token" {
    type        = string
    description = "GitHub token used for authentication"
    sensitive   = true
  }

  variable "github_repo_branch" {
    type        = string
    description = "GitHub repository branch"
    default     = "main"
  }

  variable "github_repo_name" {
    type        = string
    description = "GitHub repository name"
    default     = ""
  }
  ```

  The `variables.tf` config above, defines various variaobles that customize the deployment of our EC2 instance and other related resources. These variables enable flexibility and resusability of the terraform scripts.

- `terraform.tfvars`: Contains values for the variables defined in `variables.tf`. This files behaves like a `.env` file where one would define or store sensitive information that they do not wish to version control or if one is working on multiple environment without wanting to make changes on the `variables.tf` file.

### Deploying the EC2 instance

Once we have defined our configuration and resources required for our EC2 instance, we can initialize Terraform thereafter deploy our instance.

#### Initialize Terraform

- Initialize Terraform: download the required provider plugins:

  ```bash
  terraform init
  ```

- Review the `terraform.tfvars` file and update the variables with your desired values. You can customize parameters such as region, database instance identifier, instance class, storage size, and more in this file.

  See examples of variables you can set manually: `./variables.tf`

- Review the changes that will be made:

  ```bash
  terraform plan
  ```

- When satisfied with the resources to be deployed, apply the Terraform config to create the resources:

  ```bash
  terraform apply
  ```

You will be prompted to confirm the resources creation, Type in `yes` and hit `Enter`

- Once resources are created, Terraform will display the following as per `outputs.tf` file:
  - Public DNS name
  - Public IP address of the EC2 instance and,
  - The SSH connection parameters for the EC2 instance.

- Navigate to your aws console to check your instance running or run the following command to check the status of the instance:

  ```bash
  aws ec2 describe-instance-status --include-all-instances
  ```

- To test, if the instance is running, connect to the new public DNS and verify your config:

  ```bash
  ssh $(terraform output -raw instance_connection_parameters)
  ```

- Once logged in, you will need to configure Git:

```bash
git config --global user.email "<your email>@gmail.com"
git config --global user.name "Your name"
```

#### Check whether the user data script was ran successfully during initialization

You can verify using the following steps:

Check the log of your user data script in:

- `less /var/log/cloud-init.log` and
- `less /var/log/cloud-init-output.log`

You can see all logs of your user data script, and it will also create the `/etc/cloud` folder.

## Connecting to the Instance with VS Code

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

For more details on Remote Development using SSH, read: <https://code.visualstudio.com/docs/remote/ssh>

### Managing the EC2 Instance

#### Start/Stop Instance Manually

When you are done using the instance ensure that it is stopped, to avoid incurring costs when the instance is not in use.
Run the script provided with the desired action and optional arguments:

  ```bash
  python scripts/ec2-manager.py start   # Start instances with the matching tag.
  python scripts/ec2-manager.py stop    # Stop instances with the matching tag.

  # Optionally specify tag details:
  python scripts/ec2-manager.py stop --tag-name MyCustomTag --tag-value my-instance

  # Optionally control logging verbosity:
  python scripts/ec2-manager.py start --log-level debug
  ```

#### Automatic Stop Instance (Cost Management)

Every 30 minutes, a **CloudWatch Events rule** triggers an **AWS Lambda function**, this function will perform the following steps:

- Runs a command via **AWS Systems Manager (SSM)** on the EC2 instance to check for active SSH connections.
- Parses the command output to determine if there has been any SSH activity within the last 30 minutes.
- If there hasn't been any SSH activity the EC2 instance is stopped.

#### Clean Up

To avoid incurring charges, ensure that you have destroyed your infrastructure after use - should you wish not to use it anymore:

```bash
terraform destroy
```

# Conclusion

Setting up a remote development instance using Terraform not only simplifies the provisioning of resources but also enhances the scalability and managebility of your complete instrastructure. By leveraging infrustructure as code (IaC), you ensure consistancy and detemenistic deployments, minimize clickops and make your environment reproducible.

In this blog post, we explored the process of setting up an EC2 for development purposes from defining various resources to provisioning them via Terraform as well as managing them effeciently. We also intergrated various services such as AWS Lambda, SSM and CloudWatch Events for cost management ensuring that our instance is stopped when not in-use.

As you continue to refine your environment, also consider integrating additional AWS services or automating more aspects of your infrastructure management including cost optimization and management.

# References

- [Terraform](https://developer.hashicorp.com/terraform)
- [AWS System Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/ssm-agent.html)
- [CloudWatch Events](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cwe-now-eb.html)
