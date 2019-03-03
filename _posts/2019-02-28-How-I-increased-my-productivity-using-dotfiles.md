---
layout: post
title: "How I increased my productivity using dotfiles"
date: 2019-02-28 12:54:20.000000000 +02:00
tags:
- Linux/Ubuntu
- Tips/Tricks
- dotfiles
---
# How I increased my productivity using dotfiles

**TLDR**; *You can set up a new system using dotfiles and an installation script in minutes. It’s not hard to create your own repository, and you’ll learn a ton along the road. This is truly more about the journey than the destination!*

There is no frustrating feeling like the feeling of starting all over again especially when it comes to a fresh OS install or having your hard-drive crashing on you which then results in reinstalling your OS all over again!

And you think to yourself, OMG! my aliases, system settings and configuration files, every little helper file and script **GONE, just like that!**

That new fresh OS install on your new computer is a shell of its former self, everything fresh out of the box - **How annoyed you will/would be.**
{:refdef: style="text-align: center;"}
<div><img src="https://i1.kym-cdn.com/photos/images/original/000/107/432/i_hug_that_feel.png" alt="" style="width: 350px;"/></div>
{: refdef}

Your heart warms as you think back to the comfort and productivity that came with your computer before. If only there was a way to take everything you know and love on the go and never to worry about the agony of reinstalling everything...

**Thankfully, there is!**

Overtime I got annoyed and frustrated to the point where I created my own linux setting up script that auto-installs everything I needed from packages, dotfiles, configuration files and settings.

If you would like to check it out, [[new-computer](https://github.com/mmphego/new-computer/)] - should you have nice ideas to share or want to collaborate, feel free to send me a tweet @OrifhaMpho or [fork and send me a PR!](https://github.com/mmphego/new-computer/)

## Automate Everything!

There are two parts to this:
*   The first is a repository/backup of [my dotfiles & configs](https://github.com/mmphego/dot-files).

    This repository contains, and track changes for most of my important files in my `/home` partition, such as `.bashrc`, `.bash_aliases`, and other related files.

    Dotfiles are used to customize your system. The `"dotfiles"` name is derived from the configuration files in Unix-like systems that start with a dot (e.g. `.bash_profile` and `.gitconfig`). For normal users, this indicates these are not regular documents, and by default are hidden in directory listings. For power users, however, they are a core tool belt.
    Backing my dotfiles to GitHub keeps everything neatly tracked and version controlled.

*    The second [repository](https://github.com/mmphego/new-computer) packs a punch, it contains a script which when ran it will install every little package, configs, [githooks](https://github.com/mmphego/git-hooks) and [dotfiles](https://github.com/mmphego/dot-files), I need for my day-to-day productivity from academic, work-related to entertainment.
`installer.sh` is what makes this all magically work.
I will document it in detail on the next post.


## My Dotfiles

### An Example Dotfiles Repository

For this post, I’m just going to list a subset of my own [dotfiles repo](https://github.com/mmphego/dot-files).

**Current Structure**

Below is the structure of my dotfiles repository. It’s also what we’ll use in our walk-through below.
```shell
.
├── .config
│   ├── Code
│   │   └── User
│   ├── gummi
│   │   ├── gummi.cfg
│   │   ├── snippets.cfg
│   │   └── welcome.tex
│   ├── Mendeley Ltd.
│   │   └── Mendeley Desktop.conf
│   ├── ranger
│   │   ├── bookmarks
│   │   ├── commands_full.py
│   │   ├── commands.py
│   │   ├── history
│   │   ├── rc.conf
│   │   ├── rifle.conf
│   │   ├── scope.sh
│   │   └── tagged
│   ├── redshift.conf
│   ├── Slack
│   │   └── local-settings.json
│   ├── sublime-text-3
│   │   ├── Packages
│   │   ├── TrailingSpaces
│   │   └── WordHighlight
│   ├── terminator
│   │   └── config
│   └── xfce4
│       ├── helpers.rc
│       ├── help.rc
│       ├── panel
│       ├── terminal
│       ├── xfce4-screenshooter
│       ├── xfce4-taskmanager.rc
│       └── xfconf
├── .dotfiles
│   ├── .bash_aliases
│   ├── .bash_functions
│   ├── .bashrc
│   ├── .docker_aliases
│   ├── .dotfiles_setup.sh
│   ├── .git-completion.bash
│   ├── .gitconfig
│   ├── .gitignore
│   ├── .nanorc
│   ├── .profile
│   └── .travis.conf
├── .ipython
│   └── profile_default
│       ├── db
│       ├── ipython_config.py
│       ├── ipython_kernel_config.py
│       ├── log
│       ├── pid
│       └── startup
├── LICENSE
├── My-Git-Repos.txt
├── Pictures
│   ├── glasses-and-computer-screen.jpg
│   ├── vertical_background.jpeg
│   └── wallpaper.jpg
├── README.md
└── .travis.yml
```



#### Diving deep into the dotfiles

We will take a look at the following examples:
* *.dotfiles/.profile*
* *.dotfiles/.bashrc*
* *.dotfiles/.bash_aliases*
* *.dotfiles/.bash_functions*
* *.dotfiles/.docker_aliases*

------------------------------

***.profile***

This file is located in your `/home` directory is loaded first upon login, it is either called `.profile` or `.bash_profile`.
What to put in the `.profile` is truly up-to the individual and it can be expanded significantly. I personally like to keep my `.profile` as small possible and only have things I need to be ran once.
For example, I define all my colors and color functions in my `.profile`

{% raw %}
```shell
case ${TERM} in
    '') ;;
  *)
    # Define a few Colours
    BLACK="$(tput -T xterm setaf 0)"
    BLACKBG="$(tput -T xterm setab 0)"
    # ....
esac

# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
    . "$HOME/.bashrc"
    fi
fi

# set PATH so it includes user's private bin directories
PATH="$HOME/.venv/bin:$HOME/bin:$HOME/.local/bin:$PATH"
export PATH="$HOME/.poetry/bin:$PATH"

recho() {
    echo "${RED}$1${NC}"
}

gecho() {
    echo "${GREEN}$1${NC}"
}

export -f recho
export -f gecho
```
{% endraw %}
Full example: my [.profile](https://github.com/mmphego/dot-files/blob/master/.dotfiles/.profile)

If you want to dive into startup scripts a bit more, Peter Ward explains about [Shell startup scripts](http://blog.flowblok.id.au/2013-02/shell-startup-scripts.html).


***.bashrc***

`.bashrc` is a shell script that Bash runs whenever it is started interactively ie when you open a new terminal. It initializes an interactive shell session.
For example, I define my [PS1](https://www.linuxnix.com/linuxunix-shell-ps1-prompt-explained-in-detail/), shell options, keybindings, aliases, functions and custom message.

![home]({{ "/assets/screenshot.png" | absolute_url }})


{% raw %}
```shell
__git_status_info() {
    STATUS=$(git status 2>/dev/null |
    awk '
    /^On branch / {printf($3)}
    /^Changes not staged / {printf("|?Changes unstaged!")}
    /^Changes to be committed/ {printf("|*Uncommitted changes!")}
    /^Your branch is ahead of/ {printf("|^Push changes!")}
    ')
    if [ -n "${STATUS}" ]; then
        echo -ne " (${STATUS}) [Last updated: $(git show -1 --stat | grep ^Date | cut -f4- -d' ')]"
    fi
}

__disk_space=$(/bin/df --output=pcent /home | tail -1)
_ip_add=$(ip addr | grep -w inet | gawk '{if (NR==2) {$0=$2; gsub(/\//," "); print $1;}}')
__ps1_startline="\[\033[0;32m\]\[\033[0m\033[0;38m\]\u\[\033[0;36m\]@\[\033[0;36m\]\h on ${_ip_add}:\w\[\033[0;32m\] \[\033[0;34m\] [disk:${__disk_space}] \[\033[0;32m\]"
__ps1_endline="\[\033[0;32m\]└─\[\033[0m\033[0;31m\] [\D{%F %T}] \$\[\033[0m\033[0;32m\] >>>\[\033[0m\] "
export PS1="${__ps1_startline}\$(__git_status_info)\n${__ps1_endline}"
# ------------
IP_ADD=`ip addr | grep -w inet | gawk '{if (NR==2) {$0=$2; gsub(/\//," "); print $1;}}'`
printf "${LIGHTGREEN}Hello, ${USER}@${IP_ADD}\n"
printf "Today is, $(date)\n";
printf "Sysinfo: $(uptime)\n"
printf "\n$(fortune | cowsay)${NC}\n"
```
{% endraw %}

Full example: my [.bashrc](https://github.com/mmphego/dot-files/blob/master/.dotfiles/.bashrc)


***.bash_aliases***

A Bash alias is essentially nothing more than a keyboard shortcut, an abbreviation, a means of avoiding typing a long command sequence. [Read more](https://www.tldp.org/LDP/abs/html/aliases.html). Here are some examples:

```shell

alias update='sudo apt-get -y update'
alias upgrade='sudo apt-get -y --allow-unauthenticated upgrade && sudo apt-get autoclean && sudo apt-get autoremove'
alias hist='history --color=always'
alias hist-grep='history | grep --color=always'
alias youtube="$(command -v youtube-dl)"
alias youtube-mp3="$(command -v youtube-dl) -x --audio-format mp3"
alias rsync='rsync --progress'
alias less='less -N'
```

Full example: my [.bash_aliases](https://github.com/mmphego/dot-files/blob/master/.dotfiles/.bash_aliases)


***.bash_functions***

Commands that are too complex for an alias (and perhaps too small for a stand-alone script) can be defined in a function. Functions can take arguments, making them more powerful.

```shell

cd() {
    # The 'builtin' keyword allows you to redefine a Bash builtin without
    # creating a recursion. Quoting the parameter makes it work in case there are spaces in
    # directory names.
    builtin cd "$@" && ls -thor;
}

compile() {
     if [ -f $1 ] ; then
         case $1 in
             *.tex)    latexmk -pdf $1               ;;
             *.c)      gcc -Wall "$1" -o "main" -lm  ;;
            # List should be expanded.
             *)        recho "'$1' cannot opened via ${FUNCNAME[0]}" ;;
         esac
     else
         recho "'$1' is not a valid file"
     fi
}

committer() {
    # Add file(s), commit and push
    FILE=$(git status | $(which grep) "modified:" | cut -f2 -d ":" | xargs)
    for file in $FILE; do git add -f "$file"; done
    if [ "$1" == "" ]; then
        # SignOff by username & email, SignOff with PGP and ignore hooks
        git commit -s -S -n -m"Updated $FILE";
    else
        git commit -s -S -n -m"$2";
    fi;
    read -t 5 -p "Hit ENTER if you want to push else wait 5 seconds"
    [ $? -eq 0 ] && bash -c "git push --no-verify -q &"
}

createpr() {
    # Push changes and create Pull Request on GitHub
    REMOTE="devel";
    if ! git show-ref --quiet refs/heads/devel; then REMOTE="master"; fi
    BRANCH="$(git rev-parse --abbrev-ref HEAD)"
    git push -u origin "${BRANCH}" || true;
    if [ -f /usr/local/bin/hub ]; then
        /usr/local/bin/hub pull-request -b "${REMOTE}" -h "${BRANCH}" --no-edit || true
    else
        recho "Failed to create PR, create it Manually"
        recho "If you would like to continue install hub: https://github.com/github/hub/"
    fi
}

```
Full example: my [.bash_functions](https://github.com/mmphego/dot-files/blob/master/.dotfiles/.bash_functions)

***.docker_aliases***

Similar to `.bash_aliases`, in this file I defined all my `docker run` shotcuts

```shell
# bat supports syntax highlighting for a large number of programming and markup languages
# see: https://github.com/sharkdp/bat
alias bat='docker run -it --rm -e BAT_THEME -e BAT_STYLE -e BAT_TABS -v "$(pwd):/myapp" danlynn/bat'
# A collection of simplified and community-driven man pages.
# see: https://github.com/sharkdp/tldr
alias tldr='docker run --rm -it -v ~/.tldr/:/root/.tldr/ nutellinoit/tldr'
# Simplified docker based markdown linter
# see: https://github.com/mmphego/my-dockerfiles/markdownlint
alias markdownlint='docker run --rm -it -v "$(pwd):/app" mmphego/markdownlint'
# Simplified docker based latexmk
# see: https://github.com/mmphego/my-dockerfiles/latex-full
alias mklatex='docker run --rm -i -v "$PWD":/data --user="$(id -u):$(id -g)" mmphego/latex:ubuntu'
```
Full example: my [.docker_aliases](https://github.com/mmphego/dot-files/blob/master/.dotfiles/.docker_aliases)

#### Other dotfiles
I only listed a subset of dotfiles above, many packages also store their settings in a dotfile, for example
* `.gitconfig` for Git
    * Full example: my [.gitconfig](https://github.com/mmphego/dot-files/blob/master/.dotfiles/.gitconfig)
* `.nanorc` for nano
    * Full example: my [.nanorc](https://github.com/mmphego/dot-files/blob/master/.dotfiles/.nanorc)

## Installing the Dotfiles

**NOTE: Becareful you should have some dotfiles defined in your /home directory. Before you continue you need to ensure that they are backed up somewhere.**
**Remember with great power comes great responsibility.**

I wrote a dotfiles installation script to automate symlinking the dotfiles in the repo to your `/home` directory. See this [.dotfiles_setup.sh](https://github.com/mmphego/dot-files/blob/master/.dotfiles/.dotfiles_setup.sh) for an example.
Note that the script uses 'ln' instead of `GNU stow` for symlinking - I will update the script soon.

To install the dotfiles on a new system, we can do so easily by cloning the repo:
```shell
cd $HOME
git clone --depth 1 https://github.com/mmphego/dot-files
rsync -uar --delete-after dot-files/{.,}* "${HOME}"
bash .dotfiles/.dotfiles_setup.sh install
# To delete
# bash .dotfiles/.dotfiles_setup.sh delete
```
This script will backup existing dotfiles and then do the symlinking.

When done, you should just run the test to ensure that the installation was successful.
```shell
bash .dotfiles/.dotfiles_setup.sh test
```

## Conclusion

That's it for this blog post, I hope you picked up a thing or 2 from this post.
dotfiles are a very personal thing, Look around at other repositories and start building your dotfiles the way you like. I have always had a knack for searching for various repositories containing dotfiles on GitHub and other blogs, and I have often found something useful. It is always tricky to get everything to work according to your specs but once you have everything under-control you are good to go.

Go build set up your own dotfiles and the next time when your computer crashes/reinstall OS, it won't be that bad!

## Feedback

If you have nice ideas to share or want to collaborate, feel free to send me a @OrifhaMpho or [fork and send me a PR!](https://github.com/mmphego/dot-files)

## Reference
*   [Getting Started With Dotfiles](https://medium.com/@webprolific/getting-started-with-dotfiles-43c3602fd789)
*   [What is the purpose of .bashrc and how does it work?](https://unix.stackexchange.com/questions/129143/what-is-the-purpose-of-bashrc-and-how-does-it-work)
*   [Advanced Bash-Scripting Guide: Aliases](https://www.tldp.org/LDP/abs/html/aliases.html)
*   [Getting Started with Dotfiles](https://driesvints.com/blog/getting-started-with-dotfiles/)