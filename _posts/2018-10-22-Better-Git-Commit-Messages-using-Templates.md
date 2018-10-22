---
layout: post
title: "Better Commit Messages using Templates"
date: 2018-10-22 10:15:20.000000000 +02:00
tags:
- Git
- Tips/Tricks
- Linux/Ubuntu
---

# Better Commit Messages using Templates!

As a *developer*, one always needs to be learning consistently in-order to improve they're skills that is exactly what I told my colleague the other day while I was scrolling through my phone trying to clean up some space, I remember he was like, "Mpho why do you have so many apps?"

I showed him one app that I use on a daily basis called ["enki"](https://enki.com/), which builds a habit of acquiring new skills using their quick workout, games and learn new tips and tricks.

The other day, as I was browsing through the app - I picked up something that I have always neglected in the past from the app - Writing better commit messages using a template.

One can easily see from the image, that I needed to improve the way I wrote my commit messages, hence the post.


![commit-messages]({{ "/assets/commit-messages.png" | absolute_url }})

## Automate Git Commit Messages

**The seven rules of a great Git commit message**

- Keep in mind: This has all been said before.
- Separate subject from body with a blank line
- Limit the subject line to 50 characters
- Capitalize the subject line
- Do not end the subject line with a period
- Use the imperative mood in the subject line
- Wrap the body at 72 characters
- Use the body to explain what and why vs. how

Here’s a useful template for writing better commit messages. Set your commit message template to:
```
nano ~/.git/git-commit-template.txt
```

```bash
# <type>: (If applied, this commit will...) <subject> (Max 50 char)
# |<----  Using a Maximum Of 50 Characters  ---->|


# Explain why this change is being made
# |<----   Try To Limit Each Line to a Maximum Of 72 Characters   ---->|

# Provide links or keys to any relevant tickets, articles or other resources
# Example: Github issue #23

# --- COMMIT END ---
# Type can be
#    feat     (new feature)
#    fix      (bug fix)
#    refactor (refactoring production code)
#    style    (formatting, missing semi colons, etc; no code change)
#    docs     (changes to documentation)
#    test     (adding or refactoring tests; no production code change)
#    chore    (updating grunt tasks etc; no production code change)
# --------------------
# Remember to
#    Capitalize the subject line
#    Use the imperative mood in the subject line
#    Do not end the subject line with a period
#    Separate subject from body with a blank line
#    Use the body to explain what and why vs. how
#    Can use multiple lines with "-" for bullet points in body
# ------------------------------------------------------------------------
# ------------------------------------------------------------------------

```

To apply the template,

Save the above file to your local machine and use
```bash
$ git config --global commit.template <.git-commit-template.txt file path>
```

For example, if you saved it to your home folder, try:
```bash
$ git config --global commit.template ~/.git-commit-template.txt
```


**Try it yourself, and let me know what you think**

## Useful Links

- [Customizing Git - Git Configuration](https://www.git-scm.com/book/en/v2/Customizing-Git-Git-Configuration)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [5 Useful Tips For A Better Commit Message](https://robots.thoughtbot.com/5-useful-tips-for-a-better-commit-message)
- [A useful template for commit messages](https://codeinthehole.com/tips/a-useful-template-for-commit-messages/)
