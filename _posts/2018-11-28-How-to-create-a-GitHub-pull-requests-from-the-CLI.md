---
layout: post
title: "How to create a GitHub pull requests from the CLI"
date: 2018-11-28 10:32:20.000000000 +02:00
tags:
- Git
- Tips/Tricks
---
# How to create a GitHub pull requests from the CLI

If like me, you create a lot pull requests in a day and annoyed of the idea of repeatedly visiting GitHub to create a PR - do not get me wrong the website is great and all, but it can be annoying sometimes having to leave your CLI and open your browser (which has serious implications on your productivity IMHO).

I have a great solution for you, GitHub has a cool tool that you can use to create PR's and other things via CLI which is available to install depending on your architecture.

**NOTE:** They (GitHub people) say it doesn't store you login details.

## Installing Hub
[Hub is available on GitHub](https://github.com/github/hub) so you can download binaries, or install it from source. Unfortunately with `Ubuntu` you cannot easily apt-get it, you will need to download the binary and install it that way.

In this post I will detail the installation and usage.

### Setup
It is simple to install, see below:
```shell
# Linux x64
cd /tmp
wget https://github.com/github/hub/releases/download/v2.6.0/hub-linux-amd64-2.6.0.tgz -O - | tar -zxf -
sudo prefix=/usr/local hub-linux-amd64-2.6.0/install && rm -rf hub-linux-amd64-2.6.0
# See: https://github.com/github/hub#aliasing
echo "alias git=hub" >> ~/.bashrc
source ~/.bashrc
```

### Usage

After a successful installation, You are Git+Hub ready.
If you hit `man hub` in your cli you should see something like this.

![]({{ "/assets/hub.png" | absolute_url }})

### Testing
From image below, I established that the tool works 100%.

![]({{ "/assets/usage.png" | absolute_url }})


### Tricks

![But wait there's more.](https://climbingthecrazytree.files.wordpress.com/2014/01/but-wait-theres-more.png)

#### Integrating with Git Alias.

The amount of time `hub` has since saved me a by keeping my hands on the keyboard, is priceless. It would be a great idea to push and create pr's automagically that's where aliases come it.
I'm a big fan of Git aliases, so I decided to create an alias called `create-pr` that pushes, and creates a pull request on GitHub.

You can create aliases directly from the command line with git. To open your global `.gitconfig` for editing, hit:

```shell
git config --global --edit
```

This will pop-up an editor of choice, and allow you to edit your `.gitconfig`. Find `[alias]` section and copy below function under `[alias]`.

```shell
[alias]

    create-pr="!f() { \
        BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD); \
        git push -u origin "${BRANCH_NAME}"; \
        hub pull-request --no-edit; \
        };f"
```

This alias uses the slightly more complex script format that creates a function and executes it immediately. In that function, we do three things:

-    `BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD);`
    -   Get the name of the current branch from git and store it in a variable, BRANCH_NAME.
-    `git push -u origin "${BRANCH_NAME}";`
     -   Push the current branch to the remote origin, and associate it with the remote branch of the same name
-    `hub pull-request --no-edit`
    -   Create the pull request using hub and use the message from the first commit on the branch as pull request title and description without opening a text editor

To use the alias, simply check out the branch you wish to create a PR for and run:
```shell
git create-pr
```

This will push the branch if necessary and create the pull request for you, all in one (PR title will be your last commit message).
**Note:** If you want to read more about Git Aliases, I would advice you read this post by [Phil Haack](https://haacked.com/archive/2014/07/28/github-flow-aliases/).

#### Bash Functions

I personally prefer, placing useful tools in my `~/.bash_functions` for even much easier access, you can copy the code below and place it in your `.bashrc` if you  do not have a `.bash_functions` file.

```shell
mkpr() {
    BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD);
    git push -u origin "${BRANCH_NAME}" || true;
    hub pull-request --no-edit || true;
    }
```

If like me you like doing things efficiently, also add the following function to your `.bashrc`.

```shell
function commiter() {
    # Add file, commit and push
    if [ $# -eq 0 ]; then
        # Ensure that file is supplied else exits
        echo "No file supplied"
        exit 1
    fi

    git add -f "$1";
    if [ "$2" == "" ]; then
        git commit -nm"Updated $1";
    else
        git commit -nm"$2";
    fi;
    bash -c "git push -q &"
    }
```
The function `commiter` above does three things:
-   `git add -f "$1"`;
    -  This command updates the index using the current content found in the working tree, to prepare the content
   staged for the next commit.
- `git commit -nm"$2"`;
    - Stores the current contents of the index in a new commit along with a log message from the user describing
   the changes, if no `message` is supplied, `Updated <filename>` is used as a commit message.
- `bash -c "git push -q &"`;
    -    Updates remote reference using local references quietly in the background.


##### Usage

The following command with commit my file `main.py`, push and create a pull request - without the need of me opening up a browser.
```shell
commiter main.py && mkpr
```


## Conclusion

[Hub](https://github.com/github/hub) is a great tool that wraps around Git and simplifies some of the things I do couple of times a day. check it out on GitHub and enjoy.



