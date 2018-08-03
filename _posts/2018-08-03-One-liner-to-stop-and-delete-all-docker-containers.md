---
layout: post
title: "One liner to stop and delete all of Docker containers"
date: 2018-08-03 15:53:52.000000000 +02:00
tags:
- Docker
- Hacks
- Tips/Tricks
- Linux/Ubuntu
---
# One liner to stop / delete all of Docker containers

```bash
$ docker stop $(docker ps -a -q); docker rm $(docker ps -a -q); docker rmi $(docker images -q);  docker volume rm $(docker volume ls -q --filter dangling=true)

```

Or

To only stop exited containers and delete only non-tagged images.:
```bash
docker ps --filter 'status=Exited' -a | xargs docker stop docker images --filter "dangling=true" -q | xargs docker rmi
```

Note: This is merely, here for my convenience and reference.