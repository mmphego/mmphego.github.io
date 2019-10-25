---
layout: post
title: "How To Encrypt Multiple Files With Travis CI"
date: 2019-07-25 22:38:25.000000000 +02:00
tags:
- Continuous Integration
- Tips/Tricks
- Automation
---
# How To Encrypt Multiple Files With Travis CI.

*4 Min Read*

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2019-07-25-How-to-encrypt-multiple-files-with-Travis-CI.jpg" | absolute_url }})
{: refdef}

-----------------------------------------------------------------------------------------

# The Story

I have been constantly improving one of my side project that scrapes e-commerce websites and extracts some data then uploads the data to a Google sheet. One of my recent update was to add email notifications, but since I use [Travis CI](travis-ci.com) to run the script as a [cron-job](https://docs.travis-ci.com/user/cron-jobs/) I needed to encrypt my [Google Dev](https://developers.google.com/) `client_secret.json` file (for obvious reasons) as well as my new email configuration file such that Travis CI runs my script which contains sensitive information on a public platform.

However, Travis CI doesn't support multiple file encryptions, which took me a while to realize...
![image]({{ "/assets/travis_error.png" | absolute_url }})

To the point, where I stopped even counting the failed builds.
![image]({{ "/assets/travis_error2.png" | absolute_url }})

**Note:** The Travis CI Client overrides encrypted entries if you use it to encrypt multiple files, hence why my script kept failing to build.

In this post, I will detail a workaround to encrypt multiple files on Travis CI using the CLI client.

If you would like to check the project out, [go here.](http://bit.ly/2J0TuFZ)

# The How

Before we continue, we need to install some dependencies.

**NOTE:** These instructions assumes that you are running `Ubuntu 18.04`.

## Installation

You need to install `travis-ci cli client`, follow this [installation guide lines](https://github.com/travis-ci/travis.rb#installation).

**TL;DR:** On your Ubuntu installation, else continue at own risk.

Run the following commands:
```bash
$ sudo apt update
$ sudo apt-get install ruby-full
$ gem install travis
```

If like me, you do not like installing packages in your system.
I have a [Dockerfile](https://www.docker.com/) which builds a Docker container and you can easily run `travis client`.

[Go here](http://bit.ly/2YslZG6) for detailed installation instructions.

## Testing
{:refdef}
<div id="amzn-assoc-ad-b95f659f-7175-4d7a-86e7-2afe0fcc6598"></div><script async src="//z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US&adInstanceId=b95f659f-7175-4d7a-86e7-2afe0fcc6598"></script>
{: refdef}
Verify the installation once it is done, run: `travis version`

Once we have a successful installation, [login](https://github.com/travis-ci/travis.rb#login) on travis using your GitHub username & password or [token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line) details.
```bash
$ travis login --org
```

# The Walk-through

If you need to encrypt multiple files, first we need to create an `archive` of all sensitive files, encrypt it, and version control it then decrypts it during the build.

I needed to encrypt my sensitive `email_config.ini` and `client_secret.json`files, and this is how I did it.

```bash
$ tar cvf secrets.tar email_config.ini client_secret.json
# Adding `--add` arg automatically adds the decryption command to your .travis.yml
$ travis encrypt-file secrets.tar --add --com
$ git add secrets.tar.enc .travis.yml
$ git commit -m 'Archiving email config and client secret into secret.tar file.'
$ git push origin master
```

In your `.travis.yml`, you should notice a new command `openssl ...` this command decrypts your `secrets.tar` file and then you would have to add a command to extract the files.

```yaml
before_install:
  - openssl aes-256-cbc -K $encrypted_*******_key -iv $encrypted_*******_iv -in secrets.tar.enc -out secrets.tar -d
  - tar xvf secrets.tar
script:
  - price_checker.py --email ./email_config.ini --json ./client_secret.json -s "Shopping List" --update
```

That's it, below is screenshot of my SUCCESSFUL Travis Build.

![image]({{ "/assets/travis_success.png" | absolute_url }})

# Reference

- [The Travis Client](https://github.com/travis-ci/travis.rb)
- [encrypt-file cannot be used for multiple files](https://github.com/travis-ci/travis.rb/issues/239)
- [Encrypting Files](https://docs.travis-ci.com/user/encrypting-files/)
