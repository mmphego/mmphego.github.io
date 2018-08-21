---
layout: post
title: "How to install Python 3.7.0 in Ubuntu 16.04 LTS"
date: 2018-08-15 23:54:20.000000000 +02:00
tags:
- Python
- Hacks
- Tips/Tricks
- Linux/Ubuntu
---
# How to install Python 3.7.0 in Ubuntu 16.04 LTS

This quick tutorial is going to show you how to install the latest [Python-3.7.0](https://www.python.org/downloads/release/python-370/) in Ubuntu 16.04 LTS

Ubuntu 16.04 LTS ships with both Python 2.7 and Python 3.5 by default. If you wish to install Python 3.7 you need to download the source code, compile and install it yourself as you cannot apt install it.

The installation will be detailed below.

Open terminal via Ctrl+Alt+T or searching for "Terminal" from app launcher. When it opens, run command following commands.

![Python installation]({{ "/assets/python3.7.png" | absolute_url }})

```bash
sudo apt update -qq # Check for updates, if any - before installation
mkdir -p /tmp/Python && cd "$_"
wget -c https://www.python.org/ftp/python/3.7.0/Python-3.7.0.tar.xz
tar xf Python-3.7.0.tar.xz
cd Python-3.7.0
# This will take a while, so go get yourself a cup of coffee
./configure -q; make && sudo make install
```

UPDATE: You will need to recreate the symlinks for python3 as by default it executes python3.5, a workaround is running the following commands to recreate the symlink:

```bash
sudo rm /usr/bin/python3
sudo ln -s python3.7 /usr/bin/python3
```

When you are done, for sanity purposes - you can confirm if Python-3.7.0 was installed by running:

```bash
python3 -V
```