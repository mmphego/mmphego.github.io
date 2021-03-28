---
layout: post
title: "How To Fork A Subdirectory Of Repo As A Different Repo On GitHub"
date: 2021-02-07 17:15:48.000000000 +02:00
tags:

---
# How To Fork A Subdirectory Of Repo As A Different Repo On GitHub.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2021-02-07-How-to-fork-a-subdirectory-of-repo-as-a-different-repo-on-GitHub.png" | absolute_url }})
{: refdef}

3 Min Read

-----------------------------------------------------------------------------------------

# The Story

Ever wanted to fork a subdirectory and not the whole git/github repository. Well I have, I recently had to fork a subdirectory of one of the repositories I wanted to work on without the need to forking the whole repository. In this post I will show you how it's done.

Note: I do not think you can fork subdirectories through GitHub's web interface

# The How

## Clone the repo

```bash
git clone https://github.com/<someones-username>/<some-repo-you-want-to-fork>
cd some-repo-you-want-to-fork
```

## Create a branch using the `git subtree` command for the folder only

```bash
git subtree split --prefix=./src -b dir-you-want-to-fork
git checkout dir-you-want-to-fork
```

## Create a new GitHub repo

Head over to GitHub and create a new repository you wish to fork the directory to.

## Add the newly created repo as a remote

```bash
cd some-repo-you-want-to-fork
git remote set-url origin https://github.com/<username>/<new_repo>.git
```

## Push the subtree to the new repository

```bash
git fetch origin -pa
git push -u origin dir-you-want-to-fork
```

## Fetch all remote branches in the new repository

```bash
git clone https://github.com/<username>/<new_repo>.git
cd new_repo
git checkout --detach
git fetch origin '+refs/heads/*:refs/heads/*'
git checkout dir-you-want-to-fork
```

You now have a "fork" of the `src` subdirectory.

## Merge to main/dev branch (troubleshooting)

If you ever you run `git merge master` and get the error **fatal: refusing to merge unrelated histories**; run

```bash
git checkout dir-you-want-to-fork
git merge --allow-unrelated-histories master
# Fix conflicts and
git commit -a
git push origin dir-you-want-to-fork
```

# Reference

- [Splitting a subfolder out into a new repository](https://docs.github.com/en/github/using-git/splitting-a-subfolder-out-into-a-new-repository)
- [StackOverflow](https://stackoverflow.com/questions/24577084/forking-a-sub-directory-of-a-repository-on-github-and-making-it-part-of-my-own-r#24577293)
