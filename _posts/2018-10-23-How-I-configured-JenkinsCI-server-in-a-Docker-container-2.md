---
layout: post
title: "How I configured Jenkins CI server in a Docker container (2 of 2)"
date: 2018-10-23 17:15:20.000000000 +02:00
tags:
- Python
- JenkinsCI
- Docker
- Jira
- Tips/Tricks
- Linux/Ubuntu
---
# How I configured Jenkins CI server in a Docker container (2 of 2)

I haven't had time to complete my Jenkins CI Docker container series, but lets put it all together.
In this post, I will dive down as to how I managed to automate the installation of Jenkins and SonarQube, and I will also add a demo video on how I got everything to work flawlessly.

Check out my repository for more details: [https://github.com/ska-sa/CBF-Tests-Automation](https://github.com/ska-sa/CBF-Tests-Automation)

## Putting It All Together!

I created a simple *Makefile* that makes use of commands to control your Jenkins Docker container and other cool things. You can find it here:
[Makefile](https://github.com/ska-sa/CBF-Tests-Automation/blob/master/Makefile)

I will also, paste the content here such that I can explain what is going on.

### My Automagic Makefile
```bash
export JENKINS_USER=jenkins
export HOSTNAME=$(shell hostname -i)

help:
    @echo "Please use \`make <target>' where <target> is one of"
    @echo "  bootstrap          One-liner to make everything work!!!"
    @echo "  checkJava          to check/install Java runtime."
    @echo "  docker         to build a cbf-test/jenkins docker container"
    @echo "  build              to build a docker container, configure jenkins local volume, configure sonarqube and portainer"
    @echo "  install            to check and install Java and Python dependencies."
    @echo "  fabric         to configure jenkins local volume and other dependencies"
    @echo ""
    @echo "  run                to run pre-built jenkins container"
    @echo "  start              to start an existing jenkins container"
    @echo "  stop               to stop an existing jenkins container"
    @echo ""
    @echo "  log                to see the logs of a running container"
    @echo "  shell                  to execute a shell on jenkins container"
    @echo ""
    @echo "  sonar                  to run sonarqube container"
    @echo "  sonar_start            to start sonarqube container"
    @echo "  sonar_stop             to stop sonarqube container"
    @echo ""
    @echo "  portainer              to run portainer container"
    @echo "  portainer_start            to start portainer container"
    @echo "  portainer_stop         to stop portainer container"
    @echo ""
    @echo "  start_all              to start all containers defined"
    @echo "  stop_all           to stop all containers defined"
    @echo ""
    @echo "  clean                  to stop and delete jenkins container"
    @echo "  superclean             to clean and delete jenkins user and /home/jenkins"

checkJava:
    bash -c "./.checkJava.sh" || true

install: checkJava
    sudo pip install fabric==1.12.2
    @echo

docker:
    @docker build -t ska-sa-cbf/${JENKINS_USER} .

sonar:
    @docker run --restart=on-failure:10 -d --name sonarqube -p 9000:9000 -p 9092:9092 sonarqube

portainer:
    @docker volume create --name=portainer_data
    @docker run --restart=on-failure:10 -d --name portainer -p 9001:9000 -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer

fabric:
    @echo "Running Fabric on $(HOSTNAME)"
    @fab -H ${HOSTNAME} setup_cbftest_user
    @fab -H ${HOSTNAME} setup_jenkins_user
    @fab -H ${HOSTNAME} -u ${USER} checkout_cbf_jenkins_config

build: docker fabric sonar portainer

run:
    @sudo /etc/init.d/jenkins-swarm-client.sh start || true;
    @docker run --restart=on-failure:10 -d --name=${JENKINS_USER} -p 8080:8080 -p 50000:50000 -v /home/${JENKINS_USER}:/var/jenkins_home ska-sa-cbf/${JENKINS_USER}

bootstrap: install build run

start:
    @sudo /etc/init.d/jenkins-swarm-client.sh start || true
    @docker start ${JENKINS_USER} || true

stop:
    @sudo /etc/init.d/jenkins-swarm-client.sh stop || true
    @docker stop ${JENKINS_USER} || true

portainer_start:
    @docker start portainer || true

portainer_stop:
    @docker stop portainer || true

sonar_start:
    @docker start sonarqube || true

sonar_stop:
    @docker stop sonarqube || true

stop_all: stop portainer_stop sonar_stop

start_all: start portainer_start sonar_start

clean: stop_all
    @docker rm -v ${JENKINS_USER} || true
    @docker rm -v sonarqube || true
    @docker rm -v portainer || true
    @docker volume rm portainer || true

superclean: clean
    @docker rmi ska-sa-cbf/${JENKINS_USER} || true
    @docker rmi portainer/portainer || true
    @sudo userdel -f -r ${JENKINS_USER} || true
    @sudo rm -rf /etc/init.d/jenkins-swarm-client.sh || true

log:
    @docker logs -f ${JENKINS_USER}

shell:
@docker exec -it ${JENKINS_USER} /bin/bash
```

### Into the rabbit hole, we dive...

In the initial post - I drew myself up a plan as follows:
Reasons why I decided to set up a Jenkins server via Docker to address some key points:
- **I wanted all Jenkins configurations to be available on my local machine (maintained by a jenkins user, uuid: 1000), version controlled and preferably on a private repository.**
    - Created a private repository on GitHub(It can also be public), such that I can at least keep my secret files that aren't supposed to be of public knowledge. [GitLab](gitlab.com) and [Bitbucket](bitbucket.org) offers free private repositories, if one does not want to pay [GitHub](github.com).
- **I wanted all tests to be run by a specific user with limited rights.**
    - A script that creates two new local system users, namely: *Jenkins* and *cbf-test* with limited rights
- **I wanted Jenkins to automatically run tests when a git commit/change is experienced and file a [Jira](https://www.atlassian.com/software/jira) ticket or email when build fails.**
    - GitHooks: A detailed post on Git hooks that can be accessed [here.]({{ "/blog/2018/06/28/Automatically-check-your-Python-code-for-errors-before-committing.html" | absolute_url }})*
- **I wanted the ability to run the build server locally on my machine when I'm experimenting with new features or configurations.**
    - Added Jenkins configurations to a private report. A detailed post on Jenkins config backup can be accessed [here]({{"/blog/2018/05/25/How-to-securely-backup-your-Jenkins-Configuration.html" | absolute_url }})
- **I wanted to easily be able to set up a build server in a new environment easily with minimal commands.**
    - Executing, *make bootstrap* command, will
        1. Check if the correct Java environment is installed, else it will install Java 8.
        2. Install Python package called [Fabric](https://www.fabfile.org/) - library designed to execute shell commands remotely over SSH
        3. Build a Jenkins Docker container from [Dockerfile](https://github.com/ska-sa/CBF-Tests-Automation/blob/master/Dockerfile), Execute Python Fabric file that creates *cbf-test*, *jenkins* user and checks out Githubs private repo(containing Jenkins configuration, which was previously pushed to Github - Assuming there's one already)
        4. Pull and run the latest image of [SonarQube](https://www.sonarqube.org/) and [Portainer](https://www.portainer.io/)
        5. Execute [Jenkins Swarm Client](https://wiki.jenkins.io/display/JENKINS/Swarm+Plugin) script, and run Jenkins container with your *jenkins* user home directory mounted.
- **I have severe OCD when it comes to bad code quality, so I want to integrate continuous code quality inspection**
    - Added [SonarQube](https://www.sonarqube.org/) for code quality inspection, a detailed post on how I configured *SonarQube* can be accessed [here]({{"/blog/2018/09/14/How-I-configured-SonarQube-for-Python-code-analysis.html" | absolute_url}})

## Demo
Demo is 4x the normal speed - for obvious reasons.
Click the gif, enjoy and Thanks for watching!

[![Demo]({{ "/assets/output.gif" | absolute_url }})](https://www.youtube.com/watch?v=uK2Qlv3v6jk)

## Conclusion

Hopefully one can easily see how easy it is to set-up and run Jenkins with Docker. I’ve tried to make it as basic as possible with minimal options to take the default Jenkins container and make it a little more usable. There are other options where one can initialise Jenkins container with pre-installed plugins and etc.

By making our own Dockerfile file, we were able to make our life a little easier. We set up a convenient place to store the configuration and by running a swarm client we were able to have our artifacts and files stored in our user who is designed to run tests. We moved our default settings into the Dockerfile and now we can store this in source control as a good piece of self-documentation.

By making our own Dockerfile we have explored and achieved these concepts:
- Preserving Jenkins Job and Plugin data
- Docker Data Persistence with Volumes
- Making a Data-Volume container
- Sharing data in volumes with other containers
- Control over Jenkins and Swarm client versions, custom apt packages, Python packages and plug-in installations

Taking control of your Docker images isn’t that hard. At a minimum, paying attention to your dependencies and where they come from can help you understand what goes into making your containers work. Additionally, if you do so, you can find some opportunities to make your image lighter weight and save some disk space by removing things you don’t need to install. You also lower your risk of a dependency breaking on you.

On the other hand, you take on significant responsibility - you won’t get automatic updates and you’ll have to follow along with changes to things like the Jenkins image. Whether or not this is a benefit to you depends on your personal development policies.

Regardless of whether you choose to own your image, I do recommend that you follow the same basic practices here whenever you pick up a new Dockerfile. Find the Docker image it inherits from by using Dockerhub to help you follow the inheritance chain. Be aware of all the Dockerfiles in the chain and what they use. You should always be aware of what your images contain - after all this is stuff running on your network, on your servers. At a minimum it helps you find the base operating system but you can also learn a lot about the ecosystem of Docker images out there and learn some interesting practices.

At this point you should have a fully functional Jenkins master server image set and the basics of your own Jenkins environment.

- [Ref: Maxfield Stewart, engineering.riotgames.com](https://engineering.riotgames.com/news/taking-control-your-docker-image)

### Useful Links
- [https://thepracticalsysadmin.com/setting-up-a-github-webhook-in-jenkins/](https://thepracticalsysadmin.com/setting-up-a-github-webhook-in-jenkins/)
- [https://live-rg-engineering.pantheon.io/news/putting-jenkins-docker-container](https://live-rg-engineering.pantheon.io/news/putting-jenkins-docker-container)
- [https://github.com/boxboat/jenkins-demo/blob/develop/docs/part1-jenkins-setup.md](https://github.com/boxboat/jenkins-demo/blob/develop/docs/part1-jenkins-setup.md)
- [www.donaldsimpson.co.uk/category/jenkins/page/2/](www.donaldsimpson.co.uk/category/jenkins/page/2/)

