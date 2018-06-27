---
layout: post
title: "How to rename git branch locally and remotely"
date: 2018-06-27 11:53:51.000000000 +02:00
tags:
- Bash
- Hacks
- Tips/Tricks
- Git
- Linux/Ubuntu
---

# How to rename git branch locally and remotely

Most times I find myself, with the need to rename a git branch I am working on, due to various reasons.

By following this simple steps, I was able to rename my local and rename branch names:

-   Rename branch locally

    ```git branch -m old_branch new_branch```

-   Delete the old branch

    ```git push origin :old_branch```

    or if you have Git Version > 2.6, you can easily use this command instead.

    ```git push origin --delete old_branch```
-   Push the new branch, set local branch to track the new remote

    ```git push --set-upstream origin new_branch```

{% include advertisements.html %}

**Note:** Remember to pull before! Or you may lose every commit not yet on your local branch

See example below.


![Git branch rename]({{ "/assets/git-branch-rename.png" | absolute_url }})