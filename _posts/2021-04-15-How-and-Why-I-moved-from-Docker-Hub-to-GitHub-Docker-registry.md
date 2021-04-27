---
layout: post
title: "How And Why, I Moved From Docker Hub To GitHub Docker Registry."
date: 2021-04-15 16:31:30.000000000 +02:00
tags:
    - Docker
    - Docker Registry
    - GitHub
    - Kubernetes
    - DevOps
---

# How And Why I Moved From Docker Hub To GitHub Docker Registry.

{:refdef: style="text-align: center;"}
![post image]({{ "assets/2021-04-15-How-and-Why-I-moved-from-Docker-Hub-to-GitHub-Docker-registry.png" | absolute_url }})
{: refdef}

10 Min Read

-----------------------------------------------------------------------------------------

# The Story

On [August 2020](https://www.docker.com/blog/what-you-need-to-know-about-upcoming-docker-hub-rate-limiting/), [Docker](https://www.docker.com/) announced that they are introducing rate-limiting for Docker container pulls for free or anonymous users, which meant if you did not login to your DockerHub registry via command-line you would be limited to 100 pulls per 6 hours. At first, this did not affect me as I rarely pulled 10 images per day, but recently I have been tinkering with Kubernetes, Prometheus, Jaeger (you can check this [post](https://blog.mphomphego.co.za/blog/2021/02/01/Install-Prometheus-and-Grafana-with-helm-3-on-Kubernetes-cluster-running-on-Vagrant-VM.html) on how to install Prometheus & Grafana on K3s cluster) and other tools which usually pulls multiple images per run. You can check

This meant that I would be pulling images more frequently than I used to in the past. That's when I got the dreaded error message, **"429 Too Many Requests - Server message: toomanyrequests: You have reached your pull rate limit. You may increase the limit by authenticating and upgrading: https://www.docker.com/increase-rate-limit"**.

{:refdef: style="text-align: center;"}
![](https://camo.githubusercontent.com/aaa6bb5fed0b77cc6c2251b347043382cec926ef56814602c5556799b7317687/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f6c34364362417578466b32437a307332412f736f757263652e676966)
{: refdef}

This meant that I either had to configure Kubernetes secrets for me to pull from an authenticated DockerHub registry or find an alternative registry does will not issue rate limits every 100th pull. Coincidentally, roughly at the same time [GitHub introduced their container registry](https://github.blog/2020-09-01-introducing-github-container-registry/) (offering private container registry that integrates easily with the existing CI/CD tooling), and we were saved. Since it's still in its beta stage usage is [free](https://docs.github.com/en/packages/guides/about-github-container-registry#about-billing-for-github-container-registry).

{:refdef: style="text-align: center;"}
![](https://camo.githubusercontent.com/4c101775ceb36ea8ab03b6aa7476ba086933188adef9a25d9633eb2405a19d78/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f6c304979363952427774646d76776b496f2f736f757263652e676966)
{: refdef}

In this post, I will detail how I migrated from using DockerHub to GitHub as my Docker container registry.

# TL;DR

Setup GitHub Container registry and configure Kubernetes pod container to pull from the private registry (Optional)

# But wait, What is a Container registry?

According to [RedHat](https://www.redhat.com/en/topics/cloud-native-apps/what-is-a-container-registry),
> A container registry is a repository, or collection of repositories, used to store container images for Kubernetes, DevOps, and container-based application development.

GitHub is the home for free and open-source software and it's in a great spot to offer a container registry, which integrates well with their existing services and operates as an extension of [GitHub Packages](https://docs.github.com/en/packages/learn-github-packages/about-github-packages). Thus making it a good competitor to DockerHub.

# The How

After deploying my application on my Kubernetes cluster. I noticed a few errors and after troubleshooting, I found that the docker pull rate limit was hit and this drove me insane.

```bash
$ kubectl describe pod frontend-app-6b885c795d-9vbfx | tail

Events:
  Type     Reason          Age                From                Message
  ----     ------          ----               ----                -------
  Warning  FailedMount     72s                kubelet, dashboard  MountVolume.SetUp failed for volume "default-token-6zmpp" : failed to sync secret cache: timed out waiting for the condition
  Normal   SandboxChanged  71s                kubelet, dashboard  Pod sandbox changed, it will be killed and re-created.
  Warning  Failed          44s                kubelet, dashboard  Failed to pull image "mmphego/frontend:v7": rpc error: code = Unknown desc = failed to pull and unpack image "docker.io/mmphego/frontend:v7": failed to copy: httpReaderSeeker: failed open: unexpected status code https://registry-1.docker.io/v2/mmphego/frontend/manifests/sha256:2994ce56c38abe2947935d7bc9d6a743dfc30186659aae80d5f2b51a0b8f37d1: 429 Too Many Requests - Server message: toomanyrequests: You have reached your pull rate limit. You may increase the limit by authenticating and upgrading: https://www.docker.com/increase-rate-limit
  Warning  Failed          44s                kubelet, dashboard  Error: ErrImagePull
  Normal   BackOff         43s                kubelet, dashboard  Back-off pulling image "mmphego/frontend:v7"
  Warning  Failed          43s                kubelet, dashboard  Error: ImagePullBackOff
  Normal   Pulling         31s (x2 over 70s)  kubelet, dashboard  Pulling image "mmphego/frontend:v7"
```

{:refdef: style="text-align: center;"}
![image](https://user-images.githubusercontent.com/7910856/116199774-cb40e600-a737-11eb-9f6c-9ad032b5f3a7.png)
{: refdef}

# The Walk-through

Setting up your container registry is straight forward.

## Steps

1. Create a [GitHub Personal Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) on [https://github.com/settings/apps](https://github.com/settings/apps) (See images below)

    - Select **Personal Access Tokens**

        ![image](https://user-images.githubusercontent.com/7910856/114887704-fad32280-9e08-11eb-8fec-9b021269e70a.png)

    - Click **Generate a new token**

        ![image](https://user-images.githubusercontent.com/7910856/114887818-0fafb600-9e09-11eb-9ae9-085e571f6e54.png)

    - Add a `Note`, check `write: packages` and hit generate.

        ![image](https://user-images.githubusercontent.com/7910856/114888436-8482f000-9e09-11eb-8023-fd6edec889d2.png)

    When done, you will be provided with a token that you need to backup.

2. GitHub recommends placing the token into a file.

    Either add the token into your `~/.bashrc` or `~/.bash_profile` and risk exposing them as environmental variables or place them in a file under a secret directory with reading/writing privileges (I prefer the latter).

    ```bash
    vim ~/.secrets/github_docker_token
    ```

    Paste the token into the `github_docker_token` file.

3. Login to GitHub Container Registry

    Setup your username as an environmental variable:

    ```bash
    $ cat ~/.bashrc

    export GH_EMAIL=$(git config user.email)
    export GH_USERNAME=$(git config user.username) # or hardcode your username (Not Recommended!)
    ```

    Log in to your container registry with your username and personal token.

    ```bash
    cat ~/.secrets/github_docker_token | docker login ghcr.io -u ${GH_USERNAME} --password-stdin
    ```

    ![image](https://user-images.githubusercontent.com/7910856/114888892-eb080e00-9e09-11eb-8c1b-8c77e85cc3f3.png)

    If successful, you should see an image similar to the one above.

    **Note**: Typing secrets on the command line may store them in your shell history unprotected, and those secrets might also be visible to other users on your PC.

4. Confirm that you successfully logged in.

    To confirm that you logged in we need to build, tag and push our image to ghcr (GitHub Container Registry).

    ```bash
    export USERNAME="add information"
    export REPOSITORY="add information"
    export IMAGE="add information"
    export VERSION="add information"
    docker build . -t ghcr.io/${USERNAME}/${REPOSITORY}/${IMAGE}:${VERSION}
    docker push ghcr.io/${USERNAME}/${REPOSITORY}/${IMAGE}:${VERSION}
    ```

    or in my case, I have a [docker-compose](https://docs.docker.com/compose/) yaml file to make my life easier (I suppose).

    ```bash
    cat docker-compose-file.yaml
    ```

    ```yaml
    version: '3'
    services:
    hello_world_app:
        build: ../../app
        image: ghcr.io/mmphego/jaeger-tracing-example/jaeger-tracing-example:v2
    ```

    Then build the tagged image.

    ```bash
    docker-compose -f deployment/docker/docker-compose-file.yaml build
    ```

    ![Screenshot from 2021-04-15 16-27-31](https://user-images.githubusercontent.com/7910856/114886764-1b4ead00-9e08-11eb-8a8c-447fa11b46ad.png)

    continues...

    ![Screenshot from 2021-04-15 16-27-15](https://user-images.githubusercontent.com/7910856/114886762-1a1d8000-9e08-11eb-9800-4be28c28f7c0.png)

    After a successful build, we push the image to the registry.

    ```bash
    docker-compose -f deployment/docker/docker-compose-file.yaml push
    ```

    ![Screenshot from 2021-04-15 16-27-46](https://user-images.githubusercontent.com/7910856/114886768-1be74380-9e08-11eb-93ac-04c8b4a0f17f.png)

    **Note**: The manual build and push steps will be used on GitHub Actions (so at this point ensure everything works 100%)

5. After pushing the image you should see new package(s) on your profile under *Packages*.

    ![Screenshot from 2021-04-15 16-28-29](https://user-images.githubusercontent.com/7910856/114886770-1c7fda00-9e08-11eb-89dd-18a381377757.png)

6. Setup [GitHub Action](https://docs.github.com/en/actions) workflow for auto-build and publish **(Optional)**

    Optionally, set up a workflow environment in your repository/project for the CI/CD to build and publish your container to the GitHub container registry.

    ```bash
    mkdir -p .github/workflows
    vim .github/workflows/docker-image-publisher.yaml
    ```

    Paste the following code snippet into your `docker-image-publisher.yaml`. This workflow will build and push images on pull requests and master branches.
    Note: The location of the

    ```yaml
    ---
    name: Docker Image CI

    on:
    workflow_dispatch: # Run workflow manually (without waiting for the cron to be called), through the Github Actions Workflow page directly
    push:
        branches:
        - master
    pull_request:
        branches:
        - '*'

    jobs:
    build:
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v2
            with:
            fetch-depth: 0

        - name: Build the Docker image
            run: |
            export USERNAME=${{ github.repository_owner }}
            docker-compose -f deployment/docker/docker-compose-file.yaml build

        - name: Login and Push Docker images to GitHub container registry
            run: |
            export USERNAME=${{ github.repository_owner }}
            echo "${{ secrets.DOCKER_PASSWORD }}" | docker login ghcr.io -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
            docker-compose -f deployment/docker/docker-compose-file.yaml push
    ```

    Run the GitHub Action build manually...

    ![image](https://user-images.githubusercontent.com/7910856/116215157-b2d8c780-a747-11eb-9978-6a8073dc7cf6.png)

7. Configure Kubernetes to use your new container registry **(Optional)**

    Kubernetes supports a special type of secret that you can create which will be used to fetch images for your pods from any container registry that requires authentication.

    Create a Kubernetes Secret, naming it `my-secret-docker-reg` and providing credentials:

    ```bash
    kubectl create secret docker-registry my-secret-docker-reg \
        --docker-server=https://ghcr.io \
        --docker-username=${GH_USERNAME} \
        --docker-password=$(cat  ~/.secrets/github_docker_token) \
        --docker-email=${GH_EMAIL} -o yaml > docker-secret.yaml
        # or  kubectl apply the output of an imperative command in one line
        # --docker-email=${GH_EMAIL} -o yaml | kubectl apply -f -

    # You can then apply the file like any other Kubernetes 'yaml':
    kubectl apply -f docker-secret.yaml
    ```

    Inspect the Secret: `my-secret-docker-reg`

    ```bash
    kubectl get secrets
    ```

    ![image](https://user-images.githubusercontent.com/7910856/114930522-67641680-9e35-11eb-9773-de6798f59f39.png)

# Final Result

Successful pull from (then private) GitHub container registry!

{:refdef: style="text-align: center;"}
![image](https://user-images.githubusercontent.com/7910856/116219872-6774e800-a74c-11eb-8abe-28ca0d2ee95a.png)
{: refdef}

**Me:**
After setting up my GitHub container registry and Kubernetes docker-secrets.
{:refdef: style="text-align: center;"}
![](https://camo.githubusercontent.com/67e533d93d1b86cc782080c39700b8ceb37c61ff98aadaa58be0dbd5791aa0b1/68747470733a2f2f6d65646961312e74656e6f722e636f6d2f696d616765732f65303166313663633639623432613264333763383261353563366565363064632f74656e6f722e6769663f6974656d69643d3134373139343036)
{: refdef}

# Conclusion

Hopefully, you have learned something new in this post (and enjoyed Denzel Washington gifs) and will consider using GitHub Container Registry to house your images and GitHub Actions to build and push them to your GitHub Container Registry!
Finally, to configure your Kubernetes cluster to use GitHub Container Registry for fetching images for your pods.

# Reference

- [Migrating to GitHub Container Registry for Docker images](https://docs.github.com/en/packages/guides/migrating-to-github-container-registry-for-docker-images)
- [Pull an Image from a Private Registry](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/)
