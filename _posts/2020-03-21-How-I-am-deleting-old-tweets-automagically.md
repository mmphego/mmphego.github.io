---
layout: post
title: "How I Am Deleting Old Tweets Automagically!"
date: 2020-03-21 20:44:14.000000000 +02:00
tags:
- Tips/Tricks
- Social Media
- Docker
- Travis-CI
---
# How I Am Deleting Old Tweets Automagically!.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2020-03-21-How-I-am-deleting-old-tweets-automagically.png" | absolute_url }})
{: refdef}

-----------------------------------------------------------------------------------------

# The Story

As we all know the internet never forgets and if you are like me you have probably tweeted or wrote something that on a sober day you wouldn't have.
We are all aware that our tweets are well preserved and that anyone can
easily go back to your past and remember what you said with complete precision.
This is not alarming for most people but me. I've seen enough people who were flogged publicly for something they posted years ago to know it was happening.

You're not the same person you've been to last month-you've seen things, read
things, understood and learned things that have changed you in a small way. While a person may have the same sense of self and identity throughout
most of his or her life, even this grows over the years and changes.
We change our views, our desires and our habits. We are not stagnant beings, and we should not allow ourselves to be represented as such, so why should your tweets not disappear together with your old self.

In this post, I will detail how I managed to automatically delete my old tweets that are older than 10 days, I am doing this for the same reasons that I don’t like hanging onto stuff that I no longer use or have interest in any more - that stuff isn’t relevant to me any more it neither represent me so why hang on to old tweets.

# The How

I could have written something that would do this, but with the number of side projects I have, I did not even want to spend more time than I should. So I decided to go on a hunting spree until I found a great open-source project written by @micahflee called [semiphemeral](https://github.com/micahflee/semiphemeral), which according to the *read me*:

> There are plenty of tools that let you make your Twitter feed ephemeral, automatically deleting tweets older than some threshold, like one month.
>
> **Semiphemeral** does this, but also lets you automatically exclude tweets based on criteria: how many RTs or likes they have, and if they're part of a thread where one of your tweets has that many RTs or likes. It also lets you manually select tweets you'd like to exclude from deleting.

He also has a great [blog post](https://micahflee.com/2019/06/semiphemeral-automatically-delete-your-old-tweets-except-for-the-ones-you-want-to-keep/) detailing the setup and the why, you should probably check it out.

## Initial Setup

I forked the original repository and added a few changes, see [diff](https://github.com/micahflee/semiphemeral/compare/master...mmphego:master)

```
python3 -m pip install https://github.com/mmphego/semiphemeral/archive/master.zip
```

Semiphemeral is a command line tool that you run locally on your computer, or on a server.

```bash
$ semiphemeral
Usage: semiphemeral [OPTIONS] COMMAND [ARGS]...

  Automatically delete your old tweets, except for the ones you want to keep

Options:
  --help  Show this message and exit.

Commands:
  configure  Start the web server to configure semiphemeral
  delete     Delete tweets that aren't automatically or manually excluded
  fetch      Download all tweets
  stats      Show stats about tweets in the database
```

Start by running `semiphemeral configure`, which starts a local web server at [http://127.0.0.1:8080/](http://127.0.0.1:8080/). Load that website in a browser.

You must supply Twitter API credentials here, which you can get by following [this guide](https://python-twitter.readthedocs.io/en/latest/getting_started.html). Basically, you need to login to [https://developer.twitter.com/](https://developer.twitter.com/) and create a new "Twitter app" that only you will be using (when creating an app, you're welcome to use [https://github.com/micahflee/semiphemeral](https://github.com/micahflee/semiphemeral) as the website URL for your app).

From the settings page you also tell semiphemeral which tweets to exclude from deletion:

{:refdef: style="text-align: center;"}
![Settings](https://raw.githubusercontent.com/micahflee/semiphemeral/master/img/settings.png)
{: refdef}

Once you have configured semiphemeral, fetch all of the tweets from your account by running `semiphemeral fetch`. (It may take a long time if you have a lot of tweets -- when semiphemeral hits a Twitter rate limit, it just waits the shortest amount of time allowed until it can continue fetching.)

Then go back to the configuration web app and look at the tweets page. From here, you can look at all of the tweets that are going to get deleted the next time you run `semiphemeral delete`, and choose to manually exclude some of them from deletion. This interface paginates all of the tweets that are staged for deletion, and allows you to filter them by searching for phrases in the text of your tweets.

Once you have chosen all tweets you want to exclude, you may want to [download your Twitter archive](https://help.twitter.com/en/managing-your-account/how-to-download-your-twitter-archive) for your records.

Then run `semiphemeral delete` (this also fetches latest tweets before deleting). The first time it might take a long time. Like with fetching, it will wait when it hits a Twitter rate limit. Let it run once first before automating it.

After you have manually deleted once, you can automatically delete your old tweets by running `semiphemeral delete` once a day in a cron job.

Settings are stored in `~/.semiphemeral/settings.json`. All tweets (including exceptions, and deleted tweets) are stored in a sqlite database `~/.semiphemeral/tweets.db`. We will need the `settings.json` file for our automagic deleter!

*Credit goes to the @micahflee*

# The Walk-through
It's all fun and games running `semipheral` manually until you forget to and then boom a year passes. This walkthrough details an automated approach on dealing this the nuking of old tweets. To set up the automagic tweeter deleter I used [Docker](docker.com) and [Travis CI](travis-ci.com/) - *configured to run each week.*

The docker build assumes you have installed, configured semipheral and copied `~/.semipheral` directory in the current working directory. This build will just copy the `.semipheral` directory to our image, create a script that fetches your old tweets and deletes them.

```bash
$ cat Dockerfile


FROM python:3
ENV USERNAME=mmphego
RUN apt-get update -q && \
    apt-get install -qq -y \
    jq && \
    apt-get clean -y && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf  /var/cache/apt/archives/
# https://github.com/mmphego/semiphemeral [Forked]
RUN pip install https://github.com/mmphego/semiphemeral/archive/master.zip

RUN useradd -m $USERNAME
USER $USERNAME
WORKDIR /home/$USERNAME
COPY .semiphemeral /home/$USERNAME/.semiphemeral
RUN echo "cat /home/$USERNAME/.semiphemeral/settings.json | jq 'del(.api_key,.api_secret,.access_token_key,.access_token_secret,.username,.user_id)'" > script.sh
RUN echo "semiphemeral fetch && sleep 10 && semiphemeral delete" >> script.sh

USER root
RUN chown -R $USERNAME:$USERNAME /home/$USERNAME

USER $USERNAME
CMD [ "bash", "script.sh" ]
```

After configuring my docker image, I needed to have it ran weekly on travis-ci.
Below is the configuration to my `.travis.yaml` file.


```bash
$ cat .travis.yaml

language: minimal
sudo: false

git:
  depth: 1

services:
  - docker

cache:
  directories:
    - /home/travis/mmphego/nuke-old-tweets/.semiphemeral

install:
  - openssl aes-256-cbc -K $encrypted_ebe4013f8360_key -iv $encrypted_ebe4013f8360_iv -in secrets.zip.enc -out secrets.zip -d
  - unzip secrets.zip

script:
  - docker build -t mmphego/nuke_my_tweets .

after_script:
  - docker run -ti --user mmphego mmphego/nuke_my_tweets
```

Below is the travis cronjob configuration.

![image](https://user-images.githubusercontent.com/7910856/77236266-bbb2ad80-6bc5-11ea-9ab2-6b0ad49376fb.png)

One thing that must never be done is to push secret tokens to a public repository, so in order to have some security in place, I zipped the `.semipheral` directory and used the Travis-CI CLI tool to encrypt it.

>Note: This assumes you have installed Travis-CI CLI and ran `travis login`.

>See installation instructions: https://github.com/travis-ci/travis.rb#installation

```
zip -r secrets.zip .semipheral
travis encrypt-file --com secrets.zip --add
rm -rf secrets.zip .semipheral
```

**DO NOT UPLOAD YOUR SECRETS TO THE CLOUD.**

Checkout my minimalistic repo: [github.com/mmphego/nuke-old-tweets](github.com/mmphego/nuke-old-tweets)

# Reference

- [Semiphemeral: Automatically delete your old tweets, except for the ones you want to keep](https://micahflee.com/2019/06/semiphemeral-automatically-delete-your-old-tweets-except-for-the-ones-you-want-to-keep/)
- [Why I'm automatically deleting my old tweets using AWS Lambda ](https://victoria.dev/blog/why-im-automatically-deleting-my-old-tweets-using-aws-lambda/#ephemeral-tweets)
