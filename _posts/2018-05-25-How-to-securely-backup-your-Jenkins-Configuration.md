---
layout: post
title:  "How to securely backup your Jenkins Configuration"
date: 2018-05-25 11:14:30.000000000 +02:00
tags:
- Docker
- JenkinsCI
- Continuous Integration
---


# How to securely backup your Jenkins Configuration

The reason you ended up on this post is either because you once made some changes on your Jenkins configuration and failed to revert back the changes which led to you having to reinstall Jenkins out of frustrations Or you just want to keep a your configurations version controlled as we all know that keeping important files in version control is critical, as it ensures problematic changes can be reverted and can serve as a backup mechanism as well.

Most of my Code and resources are often kept in version control, but in most cases before it was easy to forget especially about Jenkins server itself! A system re-installation made me a fall victim and lost my information mostly about setting up Jenkins and and and.

Hence, I decided to document it both for myself and the person reading this post. Thank me later!

It’s pretty simple to create a repository preferably private - you will never know who is watching, but it isn’t obvious which parts of your ```$JENKINS_HOME``` you’ll want to backup. You’ll also want to have some automation so new projects get added to the repository, and deleted ones get removed. Luckily we came up with a great tool to handle this.

## Assumptions
Assumptions are as follows:
 - The script assumes that the Jenkins-backup git-repo (preferably private) has already been created and checked out for the first time. 
- The [appropriate SSH keys](https://help.github.com/articles/connecting-to-github-with-ssh) (or other automatic authentication method) has been configured.
- Jenkins is running successfully and user has sudo rights

## Jenkins Git Config Script

Copy the code and save.
```
vim $JENKINS_HOME/jenkins-git-config.sh
```

Script below will commit the complete Jenkins config (including plugins and deletions) while ignoring various unwanted Jenkins droppings.

```bash
#!/bin/sh

# Assumes that the git repo is already configured with an upstream and an ssh
# key for authentication.

# Stole bits from:
# https://github.com/zeroem/jenkins-configuration-versioning/blob/master/jenkins_scm.sh
# https://gist.github.com/550369 
# http://jenkins-ci.org/content/keeping-your-configuration-and-data-subversion
# http://stackoverflow.com/questions/27609679/deal-with-jenkins-password-encryption-when-stored-in-a-scm
# http://serverfault.com/questions/291218/what-are-the-jenkins-hudson-key-files-for

set -e              # Abort on errors

if [ -z "$JENKINS_HOME" ]; then
    echo "error: JENKINS_HOME is not set"
    exit 1
fi

cd $JENKINS_HOME

# make sure we're in a git working directory
if [ ! -d .git ]; then
    echo "error: there is no .git directory here. Make sure you're in the right place."
    exit 1
fi

# Try and pull changes. Any changes here Would indicate that someone manually
# edited the config outside of jenkins and pushed. Hopefully this is not a
# problem :)
git pull

# Only add job credentials if they exist
find  -regex '\./jobs/.*/.*\.credentials' -print0 | xargs -r -0 git add

# only add user configurations if they exist
if [ -d users ]; then
    user_configs=`ls users/*/config.xml`
    if [ -n "$user_configs" ]; then
    git add users/*/config.xml
    fi
fi

# Add general configurations, job configurations, and user content
git add -- *.xml jobs/*/*.xml userContent/* \
    plugins/*.jpi* plugins/*.hpi*

# Add various credentials
git add -- *.key* secrets


# mark as deleted anything that's been, well, deleted
git ls-files --deleted -z | xargs -r -0 git rm

# Commit if there is anything to commit
git diff --exit-code && git diff --cached --exit-code ||\
    git commit -m "Automated CBF Jenkins commit"
# And push
git push

```

## Backup Config everyday!
Now the trick is, to create a Jenkins job that will run every single day. This build will execute our script which will check for any new changes, commit and push.
That way if your builds start failing or you install a dud plugin you can always check out the last known stable commit.

Pretty Sleek!!!

### Automagic Backup Build/Job

I have named mine, *'Commit_Jenkins_Config'*
![Jenkins Home Page](https://raw.githubusercontent.com/mmphego/mmphego.github.io/master/assets/jenkins_admin.png)

and configured it to trigger/run daily.
![Build Triggers](https://raw.githubusercontent.com/mmphego/mmphego.github.io/master/assets/jenkins_build_triggers.png)

Added the code, to be executed in a shell

```bash
set -e
bash $JENKINS_HOME/jenkins-git-config.sh
```

![execute shell](https://raw.githubusercontent.com/mmphego/mmphego.github.io/master/assets/Jenkins_build_script.png)

When done, run a build and see if it will backup successfully.
![Jenkins Config Build](https://raw.githubusercontent.com/mmphego/mmphego.github.io/master/assets/jenkins_admin_build.png)

My build has been running successfully, since with minor failures due to [Docker](https://www.docker.com/) DNS related issues, which I will be documented soon - by soon I mean probably never!!!!.
![Jenkins Commit History](https://raw.githubusercontent.com/mmphego/mmphego.github.io/master/assets/jenkins_commit_hist.png)


Done!
