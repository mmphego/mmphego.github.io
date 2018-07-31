---
layout: post
title: "Running code at IPython Startup"
date: 2018-07-30 21:56:52.000000000 +02:00
tags:
- Python
- Hacks
- Tips/Tricks
- Linux/Ubuntu
---
# Running code at IPython startup (ever wondered)

Ever wondered, if there was a way you would automagically execute certain codes(eg import modules, etc) upon opening your favourite interactive python command shell (tl;dr [IPython](https://ipython.org/)). I guess that's the reason why you are reading this post.

On a daily basis, I find myself opening/executing [IPython](https://ipython.org/) and then importing various modules - this has become repetitive and boring, until I stumbled upon @paytastic's post titled [Python Has a Startup File!](https://assertnotmagic.com/2018/06/30/python-startup-file/) - Very informative and helpful.
However, the post mainly focused more on Python but not [IPython](https://ipython.org/).
~~I mean how many people still use Python command shell?~~

I had no idea about this (Did you?), funny enough there is an article about this ```$PYTHONSTARTUP``` listed in the [Python docs](https://docs.python.org/2/tutorial/appendix.html#the-interactive-startup-file) - check it out, ~~I blame that on my ignorance.~~

~~Enough yada yada, let's get down to business.~~

## [HOW TO] IPython Startup
*Before you continue, ensure you have IPython installed.*

If you cd to ```/home/$USER/.ipython/profile_default/startup``` you will find a helpful README file which reads.

```bash
cat /home/$USER/.ipython/profile_default/startup/README

This is the IPython startup directory

.py and .ipy files in this directory will be run *prior* to any code or files specified
via the exec_lines or exec_files configurables whenever you load this profile.

Files will be run in lexicographical order, so you can control the execution order of files
with a prefix, e.g.::

    00-first.py
    50-middle.py
    99-last.ipy
```

All you need to do is to create a python file in the director ```/home/$USER/.ipython/profile_default/startup/```, the name is not that important.

```bash
nano startup.py && chmod a+x startup.py
```

Then, copy and edit the following code to suit your needs.
*Personally, I import os, sys, time, matplotlib and numpy on a daily basis.*

```python
# Ignoring Code styling - it is irrelevant at this moment.
class Style:
    RED = '\033[91m'
    BOLD = '\033[1m'
    END = '\033[0m'

import time
import sys
import os
import re

errmsg = ''
try:
    import matplolib.pyplot as plt
except Exception as _exp:
    errmsg += "{}ERROR:{} {}\n".format(Style.RED, Style.END, str(_exp))
try:
    import numpy as np
except Exception as _exp:
    errmsg += "{}ERROR:{} {}\n".format(Style.RED, Style.END, str(_exp))

msg = (
    "{}---> Automagically imported these packages (if available): plt and np {}".format(
        "".join([Style.BOLD, Style.RED]), Style.END))
try:
    assert errmsg
    print("\n{}\n{}".format(errmsg, msg))
except Exception:
    print(msg)
```

When you are done. Open IPython session and it should look something like this.

![IPython]({{ "/assets/ipython_startup.png" | absolute_url }})

**You have just saved yourself +5 seconds of your life!!!**
