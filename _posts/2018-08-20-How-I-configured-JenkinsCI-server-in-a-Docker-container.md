---
layout: post
title: "How I configured Jenkins CI server in a Docker container (1 of 3)"
date: 2018-08-20 10:15:20.000000000 +02:00
tags:
- Python
- JenkinsCI
- Docker
- Jira
- Tips/Tricks
- Linux/Ubuntu
---
# How I configured Jenkins CI server in a Docker container (1 of 2)

This will be a 3 part article on how, I’ve set up a Jenkins server in a Docker container, with support for Jenkins swarm client - for continuous integration and testing.
In this post, I will go through the software installation, on the next post I will detail the set up and the last post will demonstrate the final system.

*Note: This post contains Linux commands, and was written for a Debian based system. If you are using Mac/Windows your mileage may vary.*

A basic understanding of Continuous Integration/Deployment/Testing is required before proceeding unless like me, you want to learn by breaking stuff.
A great article I recommend reading is one from our friends at @digitalocean: [Introduction to Continuous Integration Delivery and Deployment](https://www.digitalocean.com/community/tutorials/an-introduction-to-continuous-integration-delivery-and-deployment)

If you are also unfamiliar with what Jenkins is - I strongly recommend firstly reading up on what Jenkins is. You can find plenty of documentation at the [official Jenkins](Jenkins.io) website.

The Jenkins build server will be running in a Docker container, I would also strongly recommend firstly reading up on what [Docker](https://docker.com) is. You can find plenty of documentation on the [official Docker Documentation](https://docs.docker.com/) website.

## The WHY!

Reasons why I decided to set up a Jenkins server via Docker to address some key points:
- I want all Jenkins configurations to be available on my local machine (maintained by a jenkins user, uuid: 1000), version controlled and preferably on a private repository.
- I want all tests to be run by a specific user with limited rights.
- I want Jenkins to automatically run tests when a git commit/change is experienced and file a [Jira](https://www.atlassian.com/software/jira) ticket or email when build fails.
    - *Side Note: I have written a detailed post on Git hooks that can be accessed [here.]({{ "/blog/2018/06/28/Automatically-check-your-Python-code-for-errors-before-committing.html" | absolute_url }})*
- I want the ability to run the build server locally on my machine when I'm experimenting with new features or configurations.
- I want to easily be able to set up a build server in a new environment easily with minimal commands.
- I have severe OCD when it comes to bad code quality, so I want to integrate continuous code quality inspection

*NOTE: For this post, I want to get a Jenkins server, managed with Docker, to the point where I can easily set up and teardown a container locally.*

*For my reference, I’m using Linux Debian Wheezy, Git 1.9.1, Docker for Debian 1.9.1, Java 1.8, Jenkins 2.89 and Jenkins swarm client 2.0*

## The HOW!

Before we have a complete Jenkins build running on Docker container - We need JDK/JRE and Docker installed.

### Docker
We will need to install Docker, I have (in the past) written a detailed installation instruction that can be accessed on this [link]({{ "/blog/2018/03/09/installing-docker-on-ubuntu-and-how-to-use-it-without-sudo.html" | absolute_url }}).

### Java

Jenkins swarm client (another fancy way of calling slave nodes) requires Java8 Runtime installed. You can find more informations about Jenkins swarm client plugin [here](https://wiki.jenkins.io/display/JENKINS/Swarm+Plugin) and you can find plenty of documentation about Java Runtime Environment on the [Official Oracle](www.oracle.com/technetwork/java/javase/overview/index.html) website.

@digitalocean [website](https://www.digitalocean.com/community/tutorials/how-to-install-java-with-apt-on-ubuntu-18-04) has a great tutorial on how to setup Java with apt in @ubuntu 18.04 else, if you do not want to be opening multiple tabs - you can just follow some steps, I have added below.

- Step 1 - Search OpenJDK Packages
OpenJDK packages are available under native apt repositories. You can simply use *apt-cache search* command to search available java version for your Ubuntu system.

```
sudo apt-cache search openjdk
```

As per above output, you can see openjdk-8-* is available in the package manager.


![Java packages]({{ "/assets/java-apt.png" | absolute_url }})

- Step 2 – Install JAVA (OpenJDK)

Use the below command to install OpenJDK on your Debian based systems using the package manager from the default repository. The below commands will install Java Development Kit (JDK) and Java Runtime Environment (JRE) both on your system. You can install JRE package only to setup Runtime Environment only.

OpenJDK 8

```bash
sudo apt-get update && sudo apt-get install openjdk-8-jre openjdk-8-jdk
```

- Step 3 - Configure Default Java Version

After installation the installation is complete, configure default Java if you have multiple versions and verify the installed version of Java on your system.

```bash
sudo update-alternatives --config java
java -version
```


![OpenJDK]({{ "/assets/openjdk.png" | absolute_url }})
