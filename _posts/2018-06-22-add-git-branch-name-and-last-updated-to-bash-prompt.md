---
layout: post
title: "Add Git branch name and last updated to bash prompt"
date: 2018-06-22 12:02:12.000000000 +02:00
tags:
- Bash
- Hacks
- Tips/Tricks
- Git
- Linux/Ubuntu
---

# Add Git branch name and last updated to bash prompt

In order to add branch name to bash prompt we have to edit the PS1 variable(set value of PS1 in ```~/.bashrc```).

## What is PS1 (Not confuse it with PlayStation One ;-)
PS1 denotes Prompt String 1. It is the one of the prompt available in Linux/UNIX shell. When you open your terminal, it will display the content defined in PS1 variable in your bash prompt.

[For more info read!!!!](https://askubuntu.com/a/186804/445204)

## Display git branch name and last time it was updated

Add following lines to your ```~/.bashrc``` and then source it.
{% raw %}
```bash
function cd {
    # The 'builtin' keyword allows you to redefine a Bash builtin without
    # creating a recursion. Quoting the parameter makes it work in case there are spaces in
    # directory names.
    builtin cd "$@"
    ls -thor
}

git_branch () {
    git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/(\1)/'
    }

git_last_update () {
    git log 2> /dev/null | grep ^Date | head -n 1 | cut -f4- -d' '
    }

export PS1="\[\033[0;32m\]\[\033[0m\033[0;38m\]\u\[\033[0;36m\]@\[\033[0;36m\]\h:\w\[\033[0;32m\] \$(git_branch) \$(git_last_update)\n\[\033[0;32m\]└─\[\033[0m\033[0;31m\] [\D{%F %T}] \$\[\033[0m\033[0;32m\] >>>\[\033[0m\] "

```
{% endraw %}
Let me unpack what is going on with the code above. The ```cd``` function redefines ```cd``` in such a way that every time I change director, it automagically lists the contents of the directory. The ```git_branch()``` function extract the branch name and the ```git_last_update()``` function extract the date and time of the last update  when your are in git repository. This function output used in PS1 variable in order to prompt the branch name and last update.
{% raw %}
In above PS1 we defined following properties
- ```\[\033[0;32m\]\[\033[0m\033[0;38m\]\u\[\033[0;36m\]@\[\033[0;36m\]\h``` - user, host name and its displaying colour
- ```\w\[\033[0;32m\]``` - current working directory and its displaying colour
- ``\$(git_branch) \$(git_last_update)``- git branch name and last update with its displaying colour
- ```└─\[\033[0m\033[0;31m\] [\D{%F %T}] \$\[\033[0m\033[0;32m\] >>>\[\033[0m\] ``` - current date, time and >>> (denoting your command goes here!) and its displaying colour
{% endraw%}
Now when cd to a git repository from the terminal it will display currently checked out git branch and last update in the prompt.

Below is an example output of my bash prompt after I added these changes to my ```~/.bashrc```

![Git Branch Name]({{ "/assets/git_branch_name.png" | absolute_url }})
