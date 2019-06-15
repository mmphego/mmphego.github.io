---
layout: post
title: "How I Resolved Selenium Geckodriver Webdriver Exception"
date: 2019-06-14 10-24-59.000000000 +02:00
tags:
- Python
- Tips/Tricks
---
# How I Resolved Selenium ("Geckodriver") Webdriver Exception.

-------------------------------------------------------
{:refdef: style="text-align: center;"}
![selenium]({{ "/assets/selenium_word_cloud.jpg" | absolute_url }})
{: refdef}

## What is Selenium?

According to their website, [Selenium](https://www.seleniumhq.org/)
> automates browsers.  That's it! What you do with that power is entirely up to you. Primarily, it is for automating web applications for testing purposes, but is certainly not limited to just that.
> Boring web-based administration tasks can (and should!) be automated as well.
> Selenium has the support of some of the largest browser vendors who have taken (or are taking) steps to make Selenium a native part of their browser.
> It is also the core technology in countless other browser automation tools, APIs and frameworks.

[Selenium Python](https://seleniumhq.github.io/selenium/docs/api/py/) bindings provides a simple API to write functional/acceptance tests using Selenium WebDriver. Through Selenium Python API you can access all functionalities of Selenium WebDriver in an intuitive way. Selenium Python bindings provide a convenient API to access Selenium WebDrivers like Firefox, Ie, Chrome, Remote etc. The current supported Python versions are 2.7, 3.5 and above.

Click [here](https://selenium-python.readthedocs.io/installation.html) more information on Selenium for Python.

## What is Geckodriver and why I need it.
Mozilla runs on Gecko browser engine. Gecko browser engine was developed by Mozilla foundation as a part of Mozilla browser. However, Gecko browser engine is not limited to Mozilla browser. It is an open source browser engine which can be used by anyone in their application. It can help applications render web pages.

**What is GeckoDriver?**

**Gecko** is a web browser engine used in many applications developed by Mozilla Foundation and the Mozilla Corporation.

Gecko Driver is the link between your tests in Selenium and the Firefox browser. GeckoDriver is a proxy for using W3C WebDriver-compatible clients to interact with Gecko-based browsers i.e. Mozilla Firefox in this case. As Selenium will not have any native implementation of Firefox, we have to direct all the driver commands through Gecko Driver. Gecko Driver is an executable file that you need to have in one of the system path. Firefox browser implements the WebDriver protocol using an executable called `GeckoDriver`. This executable starts a server on your system. All your tests communicate to this server to run your tests.

## The Dreaded Exception Message

Assuming Selenium is installed, else;
```bash
pip install -U selenium
```

When I ran the below [Python Selenium](https://selenium-python.readthedocs.io/) webdriver source code to open a Firefox browser to run automation test, this happened.

```python
In [1]: from selenium import webdriver

In [2]: browser = webdriver.Firefox()
---------------------------------------------------------------------------
FileNotFoundError                         Traceback (most recent call last)
~/.venvs/venv3.6/lib/python3.6/site-packages/selenium/webdriver/common/service.py in start(self)
     75                                             stderr=self.log_file,
---> 76                                             stdin=PIPE)
     77         except TypeError:

/usr/lib/python3.6/subprocess.py in __init__(self, args, bufsize, executable, stdin, stdout, stderr, preexec_fn, close_fds, shell, cwd, env, universal_newlines, startupinfo, creationflags, restore_signals, start_new_session, pass_fds, encoding, errors)
    728                                 errread, errwrite,
--> 729                                 restore_signals, start_new_session)
    730         except:

/usr/lib/python3.6/subprocess.py in _execute_child(self, args, executable, preexec_fn, close_fds, pass_fds, cwd, env, startupinfo, creationflags, shell, p2cread, p2cwrite, c2pread, c2pwrite, errread, errwrite, restore_signals, start_new_session)
   1363                             err_msg += ': ' + repr(err_filename)
-> 1364                     raise child_exception_type(errno_num, err_msg, err_filename)
   1365                 raise child_exception_type(err_msg)

FileNotFoundError: [Errno 2] No such file or directory: 'geckodriver': 'geckodriver'

During handling of the above exception, another exception occurred:

WebDriverException                        Traceback (most recent call last)
<ipython-input-2-baa5adeac11b> in <module>
----> 1 browser = webdriver.Firefox()

~/.venvs/venv3.6/lib/python3.6/site-packages/selenium/webdriver/firefox/webdriver.py in __init__(self, firefox_profile, firefox_binary, timeout, capabilities, proxy, executable_path, options, service_log_path, firefox_options, service_args, desired_capabilities, log_path, keep_alive)
    162                 service_args=service_args,
    163                 log_path=service_log_path)
--> 164             self.service.start()
    165
    166             capabilities.update(options.to_capabilities())

~/.venvs/venv3.6/lib/python3.6/site-packages/selenium/webdriver/common/service.py in start(self)
     81                 raise WebDriverException(
     82                     "'%s' executable needs to be in PATH. %s" % (
---> 83                         os.path.basename(self.path), self.start_error_message)
     84                 )
     85             elif err.errno == errno.EACCES:

WebDriverException: Message: 'geckodriver' executable needs to be in PATH.

```
The exception clearly states you I installed Firefox in some other location while Selenium is trying to find it and launch from default location but it couldn't find.

## The Fix

Go to the [geckodriver](https://github.com/mozilla/geckodriver/releases) releases page. Find the latest version of the driver for your platform (in my case Linux 64) and download it.
For example:

```bash
wget https://github.com/mozilla/geckodriver/releases/download/v0.24.0/geckodriver-v0.24.0-linux64.tar.gz
# Extract the file with
tar -xvzf geckodriver*
# Make it executable
chmod a+x geckodriver
# Copy to /usr/local/bin
sudo cp geckodriver /usr/local/bin
# Run to verify
geckodriver --version
```

This is the simplest way to fix this problem. Then the Firefox browser can be started as normal. This method also take effect when you run or debug.

## Testing

Inorder to ensure that all works open your Python session and run:

```python
In [1]: from selenium import webdriver
In [2]: browser = webdriver.Firefox()
In [3]: browser.get('https://www.google.com')
In [4]: browser.close()
```

Done, Enjoy Selenium browser automation...
