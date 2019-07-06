---
layout: post
title: "Automating The Creation Of Projects With Python"
date: 2019-07-06 11:50:18.000000000 +02:00
tags:
- Python
- Tips/Tricks
- Automation
---
# Automating The Creation Of Projects With Python

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2019-07-06-Automating-the-creation-of-projects-with-Python.jpg" | absolute_url }})
{: refdef}

-----------------------------------------------------------------------------------------

# The Story

As a developer who always has fresh new app/package ideas, I got bored of doing the same thing every single time - the whole task of creating a project directory, `README.md` and extra files. I got so used to the repetition to the point where it was just in my subconscious, until I just had enough.

Hence this post, in this post I will try to detail a trick I have added in [my dot-files](http://bit.ly/2FR2AEt). The function/trick automates the process of creating new projects and currently only supports Python, MicroPython and Arduino projects.

In the past, I wrote a post detailing how I increased my productivity using my dotfiles, check it out [here](http://bit.ly/2G3DoL5)

**DISCLAIMER:**
If you want to give these dotfiles a try, you should first fork this repository,
review the code, and remove things you don’t want or need. Don’t blindly use my settings unless you know what that entails.

# The How

I use [cookiecutter](https://github.com/audreyr/cookiecutter) a CLI utility that creates projects from templates, for both the Python and MicroPython projects, and [Platformio](https://platformio.org/) for the Arduino related projects. After a successful project creation, the function executes a Python script which uses [PyGithub](https://github.com/PyGithub/PyGithub/) to create a repository on Github, then creates an automated commit and pushes my changes to Github. Finally opens the project folder in [sublime text](https://www.sublimetext.com/) for me to continue with my work.

# The Walk-through

First let's install cookiecutter and pygithub

```bash
pip install -U cookiecutter pygithub
```

## PyGitHub

Once pygithub is installed, either you can generate a token or use your username & password.
If you opt for using the token, go [here](https://github.com/settings/tokens/new) to generate your token.

Once you have your token, we can test connecting to github using [pygithub](https://github.com/PyGithub/PyGithub/). This should list all your repositories.

### Usage

Run command in your python environment:

```python
from github import Github

# First create a Github instance:

# using username and password
g = Github("user", "password")
# or using an access token
g = Github("access_token")

# Then play with your Github objects:
for repo in g.get_user().get_repos():
    print(repo.name)
```

## Cookiecutter

Now that we have [PyGithub](https://github.com/PyGithub/PyGithub/) set up, we can test [cookiecutter](https://github.com/audreyr/cookiecutter). There's a pantry full of cookiecutters templates for you to choose on, you can find them [here](https://github.com/cookiecutter/cookiecutter#a-pantry-full-of-cookiecutters)

I personally forked the [Cookiecutter template for a Python package.](https://github.com/audreyr/cookiecutter-pypackage), and modified it to suite my needs.

I added few features such as:

- Testing setup with `unittest` and/or `py.test`
- [Travis-CI](http://travis-ci.org/): Ready for Travis Continuous Integration testing
- [Codacy](https://app.codacy.com/): Automated your code quality
- [Github CHANGELOG Generator](https://github.com/mmphego/my-dockerfiles/tree/master/git-changelog-generator): Generate changelog with ease.
- Some README badges and etc.

If you fancy using my template go here: [cookiecutter-python-package](http://bit.ly/30bylje) template

### Usage
Run cookiecutter, this will create a skeleton Python package with everything you need. Follow the prompts.
```bash
cookiecutter https://github.com/mmphego/cookiecutter-python-package
```

# The Implementation

Below you will find the bash-function implementation for creating my project with ease, It is pretty self-explanatory.

```bash
create_project () {
# Easily create a project x in current dir using cookiecutter templates

    PACKAGES=("pygithub" "cookiecutter" "platformio")
    PACKAGE_DIR=""
    export DESCRIPTION="description goes here!"
    PYTHON2_PIP="python2 -W ignore::DeprecationWarning -m pip -q --disable-pip-version-check"
    PYTHON3_PIP="python3 -W ignore::DeprecationWarning -m pip -q --disable-pip-version-check"
    IDE="subl"

    for pkg in "${PACKAGES[@]}"; do
        if ! ${PYTHON3_PIP} freeze | grep -i "${pkg}" >/dev/null 2>&1; then
            ${PYTHON3_PIP} install -q --user "${pkg}" >/dev/null 2>&1;
        elif ! ${PYTHON2_PIP} freeze | grep -i "${pkg}" >/dev/null 2>&1; then
            ${PYTHON3_PIP} install -q --user "${pkg}" >/dev/null 2>&1;
        fi
    done

    read -p "What is the language you using for the  (or type of) project? " LANG
    if [[ "${LANG}" =~ ^([pP])$thon ]]; then
        gecho "Lets build your Python project, Please follow the prompts."
        cookiecutter https://github.com/mmphego/cookiecutter-python-package
        PACKAGE_DIR=$(ls -tr --color='never' | tail -n1)
        export DESCRIPTION=$(grep -oP '(?<=DESCRIPTION = ).*' setup.py)
        cd -- "${PACKAGE_DIR}"
    elif [[ "${LANG}" =~ ^([uU])$python ]]; then
        gecho "Lets build your Micropython project, Please follow the prompts."
        cookiecutter https://github.com/mmphego/cookiecutter-micropython
        PACKAGE_DIR=$(ls -tr --color='never' | tail -n1)
        cd -- "${PACKAGE_DIR}"
        export DESCRIPTION=$(grep -oP '(?<=DESCRIPTION = ).*' setup.py)
    elif [[ "${LANG}" =~ ^([Aa])$duino ]]; then
        gecho "Lets build your Arduino project, Please follow the prompts."
        read -p "Enter name of the project directory? " PACKAGE_DIR
        read -p "Enter type of board (nodemcu/uno)? " BOARD
        read -p "What IDE would you like to use vscode/atom/vim? " IDE
        read -p "Enter the description of the project? " DESCRIPTION
        export DESCRIPTION="${DESCRIPTION}"
        mkdir -p "${PACKAGE_DIR}"
        python2 -m platformio init -s -d ${PACKAGE_DIR} -b ${BOARD} --ide ${IDE}
        cd -- "${PACKAGE_DIR}"
    fi

############################################################

    if [[ "${PACKAGE_DIR}" == "$(basename $(pwd))" ]];then

        git init -q

        python3 -c """
from configparser import ConfigParser
from pathlib import Path
from os import getenv
from subprocess import check_output

from github import Github

try:
    token = check_output(['git', 'config', 'user.token'])
    token = token.strip().decode() if type(token) == bytes else token.strip()
except Exception:
    p = pathlib.Path('.gitconfig.private')
    config.read(p.absolute())
    token = config['user']['token']

proj_name = Path.cwd().name
g = Github(token)
user = g.get_user()
user.create_repo(
    proj_name,
    description=getenv('DESCRIPTION', 'Description goes here!'),
    has_wiki=False,
    has_issues=True,
    auto_init=False)
print('Successfully created repository %s' % proj_name)
"""

        git add .  > /dev/null 2>&1
        git commit -q -nm "Automated commit" > /dev/null 2>&1
        git remote add origin "git@github.com:$(git config user.username)/${PACKAGE_DIR}.git" > /dev/null 2>&1
        git push -q -u origin master > /dev/null 2>&1
        "${IDE}" .
    fi
}
```

# Demo

Also I have challenged myself to VLog my work at least twice in a month (I am being optimistic). Below is a demo I made showing my function implementation and a code walk-through, so please subscribe and smash that notification bell so that you get the content while it is fresh.

<p align="center"><iframe width="560" height="315" src="https://www.youtube.com/embed/oy4EqUjabrE" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></p>
Thank you for watching.


# Reference

- [My Dotfiles](http://bit.ly/2FR2AEt)
- [Direct link to the `create_project` function](http://bit.ly/2xAG7qB)
- [cookiecutter](https://github.com/audreyr/cookiecutter)
- [PyGithub](https://github.com/PyGithub/PyGithub/)
- [Codacy](https://app.codacy.com/)

