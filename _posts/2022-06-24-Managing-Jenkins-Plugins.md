---
layout: post
title: "Managing Jenkins Plugins"
date: 2022-06-24 08:04:13.000000000 +02:00
tags:
- Jenkins
- DevOps
---
# Managing Jenkins Plugins

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2022-06-24-Managing-Jenkins-Plugins.png" | absolute_url }})
{: refdef}

3 Min Read

---

# The Story

I (well We, @AneleMakhaba and I) needed a way to get a list of all plugins installed on our production Jenkins instance in the format `<plugin>: <version>`.

The motivation for that was to be able to install all plugins on our production Jenkins instance to our development Jenkins instance (from a `Dockerfile`). As I was working on that, I noticed that the Jenkins API didn't provide a simplified way to get a list of all plugins installed on a Jenkins instance.

This post is just a note to myself, if I ever need to get a list of all plugins installed on a Jenkins instance.

## TL;DR

```bash
JENKINS_HOST="jenkins_username:jenkins_token@<JENKINS_URL>"
curl -sSL "http://$JENKINS_HOST/pluginManager/api/xml?depth=1&xpath=/*/*/shortName|/*/*/version&wrapper=plugins" | \
    perl -pe 's/.*?<shortName>([\w-]+).*?<version>([^<]+)()(<\/\w+>)+/\1 \2\n/g' | \
    sed 's/ /:/' > jenkins_plugins.txt
```

## The How

In addition to Jenkin's fundamental capabilities, extension may be used to increase its capability. Jenkins plugins carry out the same tasks in this situation in accordance with user-specific requirements. Plugins provide Jenkins access to new features. Jenkins offers more than a thousand plugins that are useful for connecting to various pieces of software and outside connectors.

The [Jenkins plugin repository](https://plugins.jenkins.io/) provides a list of over 1000+ plugins that are accessible. Only a small percentage are well maintained and tested, and even fewer are verified and/or compatible plugins - fully tested to interoperate with the rest of the [CloudBees Assurance Program (CAP)](https://go.cloudbees.com/docs/cloudbees-documentation/assurance-program/) plugins (and their dependencies) and with a certain LTS version of Jenkins.

The image below, shows the jenkins console you can navigate to the button "Manage jenkins" which is on the left side of the console. Once you click on that, you will land on another page where you can see lots of functionality which you can manage if you are the admin of the system. One we are highlighting here is about "Manage Plugins" functionality. By clicking on it you will be able to see plugins which can be integrated, which are already integrated and which need to be updated.

![image](https://user-images.githubusercontent.com/7910856/175473578-2b426473-6b18-44b7-ad0f-93c3c26b00dc.png)

## The Walk-through

**Note:** Using Jenkins UI to install plugins is not advised (or best practice). Instead the use of source control, where each new plugin and plugin upgrade can be tracked as commits, is one of the best ways to maintain your plugins.

In my opinion, using a customized Docker image (as described in [How I Setup Jenkins On Docker Container Using Ansible (Part 2)]()) that contains the plugins you absolutely must have is the best way to accomplish this. To ensure that your Jenkins master container image starts with all the plugins you want, the Jenkins docker project offers a script for pre-installing plugins from a simple `jenkins_plugins.txt` file.
As a result, testing plugin updates is much simpler, and all of your plugin updates are tracked as code commits.

Below is a simple `jenkins_plugins.txt` file containing an extensive list of the pinned plugins installed in the container:

```bash
cat > jenkins_plugins.txt << EOF
ansicolor:1.0.1
ant:1.13
antisamy-markup-formatter:2.7
authentication-tokens:1.4
blueocean-autofavorite:1.2.5
blueocean-bitbucket-pipeline:1.25.2
blueocean-commons:1.25.2
blueocean-config:1.25.2
blueocean-core-js:1.25.2
blueocean-dashboard:1.25.2
blueocean-display-url:2.4.1
blueocean-events:1.25.2
blueocean-git-pipeline:1.25.2
blueocean-github-pipeline:1.25.2
blueocean-i18n:1.25.2
blueocean-jira:1.25.2
blueocean-jwt:1.25.2
blueocean-personalization:1.25.2
blueocean-pipeline-api-impl:1.25.2
blueocean-pipeline-editor:1.25.2
blueocean-pipeline-scm-api:1.25.2
blueocean-rest-impl:1.25.2
blueocean-rest:1.25.2
blueocean-web:1.25.2
blueocean:1.25.2
branch-api:2.7.0
build-failure-analyzer:2.2.0
build-monitor-plugin:1.13+build.202203020040
cobertura:1.17
code-coverage-api:2.0.4
docker-commons:1.19
docker-java-api:3.1.5.2
docker-plugin:1.2.6
docker-workflow:1.28
git-changelog:3.21
git-client:3.11.0
git-parameter:0.9.15
git-server:1.10
git:4.10.3
github-api:1.301-378.v9807bd746da5
github-branch-source:2.11.4
github-oauth:0.37
github:1.34.2
htmlpublisher:1.29
jdk-tool:1.5
jira:3.7
job-dsl:1.78.3
ldap:2.8
list-git-branches-parameter:0.0.9
lockable-resources:2.14
log-parser:2.2
logging:1.0.0
mailer:408.vd726a_1130320
mapdb-api:1.0.9.0
matrix-auth:3.0.1
matrix-project:1.20
mattermost:3.1.1
maven-plugin:3.17
mercurial:2.16
metadata:1.1.0b
metrics:4.1.6.1
momentjs:1.1.1
pam-auth:1.7
parameterized-trigger:2.43
pipeline-build-step:2.16
pipeline-github-lib:36.v4c01db_ca_ed16
pipeline-graph-analysis:188.v3a01e7973f2c
pipeline-input-step:446.vf27b_0b_83500e
pipeline-milestone-step:100.v60a_03cd446e1
pipeline-model-api:2.2064.v5eef7d0982b_e
pipeline-model-definition:2.2064.v5eef7d0982b_e
pipeline-model-extensions:2.2064.v5eef7d0982b_e
pipeline-rest-api:2.22
pipeline-stage-step:291.vf0a8a7aeeb50
pipeline-stage-tags-metadata:2.2064.v5eef7d0982b_e
pipeline-stage-view:2.22
pipeline-utility-steps:2.12.0
plain-credentials:1.8
plot:2.1.10
plugin-util-api:2.14.0
popper-api:1.16.1-2
popper2-api:2.11.2-1
prism-api:1.26.0-2
promoted-builds:867.v7c3a_b_83a_eb_79
publish-over:0.22
resource-disposer:0.17
role-strategy:3.2.0
run-condition:1.5
saferestart:0.3
scm-api:595.vd5a_df5eb_0e39
script-security:1138.v8e727069a_025
slack:602.v0da_f7458945d
snakeyaml-api:1.29.1
sse-gateway:1.25
ssh-agent:1.24.1
ssh-credentials:1.19
ssh-slaves:1.33.0
ssh-steps:2.0.0
sshd:3.1.0
subversion:2.15.2
testInProgress:1.4
workflow-aggregator:2.6
workflow-api:1138.v619fd5201b_2f
workflow-basic-steps:2.24
workflow-cps:2659.v52d3de6044d0
workflow-durable-task-step:1121.va_65b_d2701486
workflow-job:1167.v8fe861b_09ef9
workflow-multibranch:711.vdfef37cda_816
workflow-scm-step:2.13
workflow-step-api:622.vb_8e7c15b_c95a_
workflow-support:813.vb_d7c3d2984a_0
ws-cleanup:0.40
EOF
```

The plugin's list was generated from an existing Jenkins instance as follows:

- Logging into the Jenkins UI (<http://jenkins_url/user/jenkins_username/configure>) and generate a token used for authentication on the CLI.

```bash
JENKINS_USERNAME=<username>
JENKINS_TOKEN=<token>
JENKINS_URL=<jenkins-url>

JENKINS_HOST="${JENKINS_USERNAME}:${JENKINS_TOKEN}@${JENKINS_URL}"
```

- Using the `curl` command query the Jenkins host to get a list of all plugins (versions) installed, and redirect the output to a file (`jenkins_plugin.txt`).

```bash
curl -sSL "http://$JENKINS_HOST/pluginManager/api/xml?depth=1&xpath=/*/*/shortName|/*/*/version&wrapper=plugins" | \
    perl -pe 's/.*?<shortName>([\w-]+).*?<version>([^<]+)()(<\/\w+>)+/\1 \2\n/g' | \
    sed 's/ /:/' > jenkins_plugins.txt
```

The output of the above command is a list of plugins and their versions which is shown above.

## Reference

- [Jenkins Plugins Index](https://plugins.jenkins.io/)
- [Jenkins Plugins: The Good, the Bad and the Ugly](https://technologists.dev/posts/jenkins-plugins-good-bad-ugly/)
- [Plugin Tutorial](https://www.jenkins.io/doc/developer/tutorial/)
