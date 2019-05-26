---
layout: post
title: "Send Slack messages with Python."
date: 2019-05-29 12:12:20.000000000 +02:00
tags:
- Python
- Tips/Tricks
---
# Send Slack messages with Python.

We use and love [Slack](http://slack.com/) for team messaging, throughout the day. I needed to integrate slack with some of my IoT devices in the office and at home primarily because of it's simplistic API as compared to WhatsApp and Telegram (that I never use).

The reason is pretty straight forward, I wanted my devices to SlackMe messages. For example I have soil moisture sensor(s) planted in my flowers pot at the office as well as in my vegetable garden at home, and I wanted my plants to SlackMe should they need me to water them.

**Note**, this is an ongoing side project if you have interest on it go [here](http://github.com/mmphego/uPython-moisture-sensor/), I will make a detailed blog post soon.

My solution was to have a simple Python script that sends me a message in the appropriate Slack channel at specific/random times or when `xValue` goes beyond a certain `setThreshold`.

Slack provides `Incoming-Webhooks` and they have a well documented [Incoming-Webhooks guide](https://api.slack.com/incoming-webhooks).  However, the guide only tells you what they expect you to do, but it doesn’t really explain what you actually need to do.

The first thing I needed to do was to find out from Slack the correct URL it will use to post the messages.

*   Go to: https://api.slack.com/apps?new_app and sign in
then follow the instructions [here](https://api.slack.com/incoming-webhooks)
*   Choose the channel to which you want to send messages and then Add Incoming WebHooks Integration.
*   Note that you can find the `Display Name` and change what will appear in the channel.  Slack gives you the URL to which you’ll be posting your messages. Similar to this: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`

## Posting to a Slack channel

From the URL Slack gave you, extract the `app_id`, `secret_id` and `token` which are denoted as `/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX` on the URL Slack gave you. Below is the simplified Python code snippet


```python
import requests


class SlackBot:
    def __init__(self, app_id, secret_id, token):
        """
        Get an "incoming-webhook" URL from your slack account.
        @see https://api.slack.com/incoming-webhooks
        eg: https://hooks.slack.com/services/<app_id>/<secret_id>/<token>
        """
        self._url = "https://hooks.slack.com/services/%s/%s/%s" % (
            app_id,
            secret_id,
            token,
        )

    def slack_it(self, msg):
        """ Send a message to a predefined slack channel."""
        headers = {"content-type": "application/json"}
        data = '{"text":"%s"}' % msg
        resp = requests.post(self._url, data=data, headers=headers)
        return "Message Sent" if resp.status_code == 200 else "Failed to sent message"


slack = SlackBot(app_id, secret_id, token)
slack.slack_it("Hello")
```

![slack test]({{ "/assets/python_slack.png" | absolute_url }})

## Wrapping Up
Now you've a simplified Slack message bot which can be expanded and used in various ways.

If you would like to dig even further, there's a 'bloated' Python package called [`slackclient`](https://pypi.org/project/slackclient/) which is a developer kit for interfacing with the Slack Web API and Real Time Messaging (RTM) API on Python 3.6 and above.