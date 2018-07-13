---
layout: post
title: "What is your 10 common Linux commands?"
date: 2018-07-12 13:33:52.000000000 +02:00
tags:
- Bash
- Hacks
- Tips/Tricks
- Linux/Ubuntu
---
# What is your 10 common Linux commands?

Dear command line ninjas, Mr CLI and keyboard pianist:

What is your regular command you use? I am sure you must thinking of ls and cd. Yeah, they are common for every users, but how about the rest of them? I have construct a combos of commands to help you identify your top ten linux command.

The idea is simple, we gather info from history, lets look at the command combo’s now.

```
history | awk '{CMD[$2]++;count++;}END { for (a in CMD)print CMD[a] " " CMD[a]/count*100 "% " a;}' | grep -v "./" | column -c3 -s " " -t | sort -nr | nl |  head -n10
```

The command line above may looks complicated, let me briefly explain it part by part.
Awk is the most important part in line above, It simply store the command and count the occurrence in history ( column 2, $2), at the end of operation, it prints the result accordingly. Check out [awk](http://linux.byexamples.com/archives/category/text-manipulation/awk/) examples for more illustration on awk.

With the result output it then passes to grep -v to filter out “./”, because ./something is not a Linux command. After that, arrange the data in columns and sort it numerically. List only the top ten with numbers using head and nl.

The results might vary based on your daily activities and Linux distribution. Here is my 10 common Linux commands.

```
     1  1354  15.1862%    git
     2  1141  12.7972%    cd
     3  1137  12.7524%    ls
     4  538   6.0341%     sudo
     5  223   2.50112%    ssh
     6  221   2.47869%    rm
     7  220   2.46747%    cat
     8  213   2.38896%    python
     9  198   2.22073%    cmc3
    10  179   2.00763%    ping
```




[Original Post!!](http://linux.byexamples.com/archives/332/what-is-your-10-common-linux-commands/)