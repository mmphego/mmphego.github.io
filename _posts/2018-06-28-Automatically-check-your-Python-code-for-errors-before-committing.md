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
## Updated 2018-07-16

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
 #!/usr/bin/env bash
# Git pre-commit hook, that will automagically flake8 or PEP8 format your code.
# Author: Mpho Mphego <mpho112@gmail.com>

set -i
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
BLUE=$(tput setaf 4)
NORMAL=$(tput sgr0)

# Allows us to read user input below, assigns stdin to keyboard
exec < /dev/tty

branch=$(git rev-parse --abbrev-ref HEAD | grep  -e 'master')
if [ $? -eq 0 ]; then
    printf "${RED}Please switch to another branch other than master\n"
    printf "You can by-pass this hook by appending -n or --no-verify\n";
    printf "eg: git commit -a --no-verify\n ";
    printf " -----------NOT RECOMMENDED----------- ${NORMAL}\n";
    exit 1
fi

for file in $(git diff --cached --name-only --diff-filter=ACM | grep -e '\.py$'); do
    printf "${GREEN}Checking $file for syntax errors${NORMAL}\n"
    $(which pycompile) $file
    $(which flake8) $file --max-line-length=100 --ignore=E501,E303,F405,F403 --count;
    if [ $? != 0 ]; then
        printf "${RED}Fails PyFlake check!\n\n"
        printf "Do you wish to fix the errors yourself or you want them automagically fixed?\n"
        printf "Enter Yes -> 1 or No -> 2${NORMAL}\n"
        select yn in "Yes" "No"; do
        case $yn in
                Yes ) $(which autopep8) -i -a -a $file;
                     printf "${GREEN}FIXED....${NORMAL}\n";
                     break;;
                No ) printf "${RED}You can by-pass this hook by appending -n or --no-verify\n";
                     printf "eg: git commit -a --no-verify\n ";
                     printf " -----------NOT RECOMMENDED----------- ${NORMAL}\n";
                     exit 1;;
            esac
        done
    else
        printf "${GREEN}Passed PyFlake code check.${NORMAL}\n"
        exit 0
    fi
done
exit 0

```

 - Once you've created the file, you have to make it executable.
```
$ chmod u+x ~/.git-hooks/hooks/pre-commit
```

- Git initialise all repositories that you want checked before commit.
``` $ git init```

- Now every time you commit, your code is checked with flake8, and if it doesn’t pass, your commit is rejected - you'll be prompted to fix your code like image below.

![Git pre-commit]({{ "/assets/git-pre-commit.png" | absolute_url }})

That's it!!

## Force everyone to comply!!!

If you want all your colleagues to go through the same ordeal, here's a good trick.


Something to remember: *Good code is code that I wrote, and Bad code is code that you wrote -- Unknown*

```bash
# Code is very rough on the edges, but it does the job
sudo su # With great power, comes great responsibilities.
pip install -U pip autopep8 flake8
for i in $(find / -type d -name '.git');
    do cd $i && cd ..;
    git init;
done


for i in $(find / -type d -name '.git'); do
    # For all those pricks, that decides to remove your hook - change file attributes that way not even sudo with rm!!!!
    chattr +i $i/hooks/pre-commit;
    # confirm that it was initialised.
    head -2 $i/hooks/pre-commit;
    printf "$i\n\n";
done
```

git commit prompt should look similar to this...
![Git pre-commit]({{ "/assets/git-pre-commit_update.png" | absolute_url }})