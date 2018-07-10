---
layout: post
title: "Useful Bash Aliases and Functions"
date: 2018-07-10 10:33:52.000000000 +02:00
tags:
- Bash
- Hacks
- Tips/Tricks
- Linux/Ubuntu
---
# Useful Bash Aliases and Functions

A number of Linux CLI tools use the "subcommand" pattern, ie the command takes a subcommand argument separated by white-space. For example: git, which uses subcommands like pull, clone, checkout, etc.:

## Git invoking the "push" subcommand with flags "-f"
```$ git push -f```


These types of commands have a tricky interaction with bash aliases. For instance, suppose we always want pip install to be actually be invoked as pip install --user. At first we might try to *alias* pip install:

## Does not work, alias name cannot contain white-space.

    alias 'pip install'='pip install --user'

White-space is forbidden in bash alias names, so unfortunately this approach doesn’t work. A common workaround is to come up with some shorter alias name, like pi:

## This works, but might be difficult to remember.

    alias 'pi'='pip install --user'

This is a matter of taste, but I dislike this approach because I find these short aliases hard to remember.  They’re also annoying when following instructions for things like installing a library, as you need to recognize aliased commands in the instructions and remember to invoke your alias instead.

# The FIX
Fortunately there’s a way to solve this issue using Bash functions and the command shell builtin. Here’s what it looks like:
{% raw %}
```bash
function pip() {
  if [[ "$1" == "install" ]]; then
    shift 1
    command pip install --user "$@"
  else
    command pip "$@"
  fi
}
```
{% endraw %}
The code inspects the first argument, and it it’s install it:

    Uses shift 1 to pop the install positional argument
    Dispatches to command pip with the new flag and the modified argument list

In the else case the code just delegates to command pip with the unaltered function arguments.
Note that prefixing pip with command is necessary here: without command, this code would invoke itself recursively.

After doing this, we can see that Bash knows about two versions of pip: the function we just defined, and the `/usr/bin/pip` executable:

## Now look up all of the known types of "pip".
```bash
$ type -a pip
pip is a function
pip ()
{
    if [[ "$1" == "install" ]]; then
        shift 1;
        command pip install --user -U "$@";
    else
        command pip "$@";
    fi
}
pip is /home/mmphego/.local/bin/pip
pip is /home/mmphego/.local/bin/pip
pip is /home/mmphego/.local/bin/pip
pip is /usr/local/bin/pip
pip is /usr/bin/pip
pip is /home/mmphego/.platformio/penv/bin/pip
pip is /home/mmphego/.platformio/penv/bin/pip
```
From time to time you might want to not use the `--user` flag. You have two options. The first option is to use command pip install to ensure you get the pip command, not the pip function. Another alternative is to use the absolute command path, e.g. `/usr/bin/pip install`, although this is a bit more verbose and requires that you actually know the command’s absolute path.

This is a simple example, but the same general technique applies to more complex commands, such as those that intermix flags and subcommands, or commands like gcloud that use subcommands of subcommands.

