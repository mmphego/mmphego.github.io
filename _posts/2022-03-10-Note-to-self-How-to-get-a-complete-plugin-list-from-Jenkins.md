---
layout: post
title: "Note To Self: How To Get A Complete Plugin List From Jenkins"
date: 2022-03-08 08:39:14.000000000 +02:00
tags:
- Continuous Integration
- DevOps
- Docker
- Jenkins
---
# Note To Self: How To Get A Complete Plugin List From Jenkins

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2022-03-10-Note-to-self-How-to-get-a-complete-plugin-list-from-Jenkins.png" | absolute_url }})
{: refdef}

3 Min Read

---

# The Story

I needed a way to get a list of all plugins installed on our production Jenkins instance in the format `<plugin>: <version>`. The motivation for that was to be able to install all plugins on our production Jenkins instance to our development Jenkins instance(from a Dockerfile). As I was working on that, I noticed that the Jenkins API didn't provide a simplified way to get a list of all plugins installed on a Jenkins instance.

This post is just a note to myself, if I ever need to get a list of all plugins installed on a Jenkins instance.

## The Walk-through

First, I logged in to the Jenkins instance and generate a token which I can use to authenticate myself on the CLI.
Goto: <http://JENKINS_URL/user/USERNAME/configure>

Then I generated a token and got a `token-id`.

```bash
JENKINS_USERNAME=<username>
JENKINS_TOKEN=<token>
JENKINS_HOST="${JENKINS_USERNAME}:${JENKINS_TOKEN}@<jenkins-url>:<port>"
```

After that defining my variables, I used the `curl` command to get a list of all plugins installed on the Jenkins instance, and redirected the output to a file.

```bash
curl -sSL "http://$JENKINS_HOST/pluginManager/api/xml?depth=1&xpath=/*/*/shortName|/*/*/version&wrapper=plugins" | perl -pe 's/.*?<shortName>([\w-]+).*?<version>([^<]+)()(<\/\w+>)+/\1 \2\n/g' | sed 's/ /:/' > plugins.txt
```

The output of the above command is a list of plugins and their versions.

```bash
$ cat plugins.txt

job-dsl:1.78.3
pipeline-stage-view:2.22
logging:1.0.0
all-changes:1.5
pyenv-pipeline:2.1.2
token-macro:277.v7c8f82a_d66b_3
blueocean-core-js:1.25.2
command-launcher:1.6
pubsub-light:1.16
windows-slaves:1.8
github:1.34.2
copyartifact:1.46.2
blueocean-dashboard:1.25.2
```

Now that I have the list of plugins written to file, I can add the file to my `Dockerfile`:

```bash
FROM jenkins/jenkins:2.321
...

# install plugins
# hadolint ignore=DL3059
COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN /usr/local/bin/install-plugins.sh < /usr/share/jenkins/ref/plugins.txt
```

Now, each time I build the Jenkins image from my Dockerfile, all the plugins will be automagically installed on the Jenkins instance.

Done!!!
