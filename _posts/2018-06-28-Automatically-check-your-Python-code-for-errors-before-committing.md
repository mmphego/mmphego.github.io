---
layout: post
title: "Automatically check your Python code for errors before committing"
date: 2018-06-28 16:53:51.000000000 +02:00
tags:
- Bash
- Hacks
- Tips/Tricks
- Git
- Linux/Ubuntu
---

# Automatically check your Python code for errors before committing

Last night I had the opportunity to attend a [Devops for the lone developer:meetup.com](https://www.meetup.com/Cape-Town-DevOps/events/251507121/) and one of the points I took closer to heart was, "Lint your code before committing" - well something along those lines.


In this post, I will show you how to improve the quality of your Python code by checking it for issues with [flake8](http://flake8.pycqa.org/en/latest/) and [pycompile](https://docs.python.org/2/library/py_compile.html) before committing it with [git's pre-commit hooks](https://githooks.com/).

A Git pre-commit hook (globally) is much easier than tools like [Hound](https://www.houndci.com/) on the remote server, because it will reject the commit outright, so you can just go back and correct the files before committing.

To enable this feature is pretty much simple and straight forward, and I will list all the necessary steps below.

- First lets create a global git-hooks dir and add it to git config.

    ```bash
    $ mkdir -p ~/.git-hooks/hooks
    $ git config --global init.templatedir '~/.git-hooks'
    ```
- Create a *pre-commit* file and copy/paste the code below: ```$ vim ~/.git-hooks/hooks/pre-commit```

    ```bash
    #!/bin/bash
    set -i # Fail upon an error
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    NORMAL=$(tput sgr0)
    # Never push to master
    branch=$(git rev-parse --abbrev-ref HEAD | grep  -e 'master')
    if [ $? -eq 0 ]; then
     printf "${RED}Please switch to another branch other than master${NORMAL}\n"
     exit 1
    fi
    # iterate through all cached files ie git add
    for file in $(git diff --cached --name-only --diff-filter=ACM | grep -e '\.py$'); do
        # Compile for errors, similar to python -m $file
        pycompile $file
        # Ignoring few errors: http://flake8.pycqa.org/en/3.1.1/user/ignoring-errors.html#changing-the-ignore-list
        flake8 $file  --ignore=E501,E303,E265,E128,F405,F403 --max-line-length=110 --count;
        if [ $? != 0 ]; then
            printf "${RED}Fails PyFlake check. Please Fix it.${NORMAL}\n"
            exit 1
        else
            printf "${GREEN}Passed PyFlake code check.${NORMAL}\n"
            exit 0
        fi
    done
    exit 0
    ```
 - Once you've created the file, you have to make it executable.

    ``` $ chmod u+x ~/.git-hooks/hooks/pre-commit```

- Git initialise all repositories that you want checked before commit.

    ``` $ git init```

- Now every time you commit, your code is checked with flake8, and if it doesn’t pass, your commit is rejected - you'll be prompted to fix your code like image below.

![Git pre-commit]({{ "/assets/git-pre-commit.png" | absolute_url }})


That's it!!
