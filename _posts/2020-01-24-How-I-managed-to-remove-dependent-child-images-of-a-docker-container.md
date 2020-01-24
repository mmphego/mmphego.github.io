---
layout: post
title: "How I Managed To Remove Dependent Child Images Of A Docker Container"
date: 2020-01-24 08:10:34.000000000 +02:00
tags:
- Docker
- Tips/Tricks
---
# How I Managed To Remove Dependent Child Images Of A Docker Container.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2020-01-24-How-I-managed-to-remove-dependent-child-images-of-a-docker-container.jpg" | absolute_url }})
{: refdef}

-----------------------------------------------------------------------------------------

# The Story

We all love [Docker](https://www.docker.com/) right, but I am certain at one time it got you frustrated as it recently did to me too. So the server that hosts our docker images was running out of space to due to the amount of stale/dangling/old containers that were not used any more. I was on clean up missing until I got the dreaded error:

```bash
$ IMAGE_NAME="name resembling your images/repository or something."
$ docker rmi -f $(docker images | grep "${IMAGE_NAME}" | awk '{ print $3 }')

Error response from daemon: conflict: unable to delete 314f22f50b89
 (cannot be forced) - image has dependent child images
Error response from daemon: conflict: unable to delete 723771701d55
 (cannot be forced) - image has dependent child images
Error response from daemon: conflict: unable to delete d61845f233fb (cannot be forced) - image has dependent child images

```

I tried every trick I got from duckduckgo, StackOverflow, GitHub issues but none of them did what I wanted, which was to just delete only the images I wanted including obviously the parent image. Most of the answers I got where advising one to just remove all images and start afresh that did not seat well with me. How can a problem so simple be solved with that amount of aggression?

{:refdef: style="text-align: center;"}
![image](https://pics.me.me/thumb_when-you-actually-the-read-the-documentation-sometimes-my-genius-is-its-48199681.png)
{: refdef}

{:refdef: style="text-align: center;"}
Then finally decided to read the [Docker docs](https://docs.docker.com/engine/reference/commandline/images/)...
{: refdef}


# The How
The code below lists all docker images and pretty-prints the outputs (Repository, Tag name/id, Date created), and only output any image matching a certain `IMAGE` name but only the images over a week old then aggressively remove them. The rest of your images are safe, pheeewwww...

{% raw %}
```bash
docker rmi --force \
    $(docker images --format '{{.Repository}}:{{.Tag}}:{{.CreatedSince}}' | grep ${IMAGE} | grep 'weeks ago\|months ago\|years ago' | cut -f 1-2 -d ':')
```
{% endraw %}


```bash
Deleted: sha256:668a73c653c4d490b9fcccbf1fc8d4cd1567ebe19b93edf98c019934b0084081
Deleted: sha256:8f431bdf72b76a82259d1a365d34b1c2e5be4167ce77b1e636c0ee09b68f077a
Deleted: sha256:8fde64f9d1978f329ac9e93d866638ee56b672c2459e5d8e50596daffb6813b6
Deleted: sha256:4dedf62e8752e8d00c0b31a00ccf43904d7f094aa7aad08578f4cb9f2ee24f50
Deleted: sha256:cc60802278925606c700b9ffddd6a165cb1e6b698f0a9ae7e85d81c031cd5c58
Deleted: sha256:a98009c73b9e6a3f7f05421d638b8dbdcc3b3d2530245c2c813bd90f450ce4ca
Deleted: sha256:212afb48deded8e3c44099cafc342c80d9042dd9281e5769115b462207b35c2a
Deleted: sha256:b2357fed823c6b8a730311257f79c832ccf9db6312f64833938f99b467c0b7d6
Deleted: sha256:d7a4e515868a65c26313c7ef431142d4756dbb3060d114f4c4b708d81faa7f7d
Deleted: sha256:775349758637aff77bf85e2ff0597e86e3e859183ef0baba8b3e8fc8d3cba51c
```

{:refdef: style="text-align: center;"}
![image](https://media.giphy.com/media/10JDn0oEPKp6da/source.gif)
{:refdef}


Has this solution saved you some time? Let me know in the comments!
