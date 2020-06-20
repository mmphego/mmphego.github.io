---
layout: post
title: "How To Fetch All Git Branches"
date: 2019-11-08 12:15:30.000000000 +02:00
tags:
- Git
- Tips/Tricks
---
# How To Fetch All Git Branches.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2019-11-08-How-to-fetch-all-Git-branches.jpg" | absolute_url }})
{: refdef}

-----------------------------------------------------------------------------------------

# The Story


http://gitready.com/intermediate/2009/02/13/list-remote-branches.html
Code Examples

    Tags
    Docs


remote How to fetch all Git branches



git list all branches (20)

I cloned a Git repository, which contains about five branches. However, when I do git branch I only see one of them:

$ git branch
* master

I know that I can do git branch -a to see all the branches, but how would I pull all the branches locally so when I do git branch, it shows the following?

$ git branch
* master
* staging
* etc...

If you are here seeking a solution to get all branches and then migrate everything to another Git server, I put together the below process. If you just want to get all the branches updated locally, stop at the first empty line.

git clone <ORIGINAL_ORIGIN>
git branch -r | awk -F'origin/' '!/HEAD|master/{print $2 " " $1"origin/"$2}' | xargs -L 1 git branch -f --track
git fetch --all --prune --tags
git pull --all

git remote set-url origin <NEW_ORIGIN>
git pull
<resolve_any_merge_conflicts>
git push --all
git push --tags
<check_NEW_ORIGIN_to_ensure_it_matches_ORIGINAL_ORIGIN>

$ git remote update
$ git pull --all

This assumes all branches are tracked.

If they aren't you can fire this in Bash:

for remote in `git branch -r `; do git branch --track $remote; done

Then run the command.

To list remote branches:
git branch -r

You can check them out as local branches with:
git checkout -b LocalName origin/remotebranchname

Here's a Perl version of the one-liner provided in the accepted answer:

git branch -r | perl -e 'while(<>) {chop; my $remote = $_; my ($local) = ($remote =~ /origin\/(.*)/); print "git branch --track $local $remote\n";}' > some-output-file

You can run the output file as a Shell script if you'd like.

We deleted our Stash project repository by accident. Fortunately someone had created a fork right before the accidental loss. I cloned the fork to my local (will omit the details of how I did that). Once I had the fork fully in my local, I ran one one-liner. I modified the remote's URL (origin in my case) to point to the target repository we were recovering to:

git remote set-url origin <remote-url>

And finally pushed all branches to origin like so:

git push --all origin

and we were back in business.

You can fetch one branch from all remotes like this:

git fetch --all

fetch updates local copies of remote branches so this is always safe for your local branches BUT:

    fetch will not update local branches (which track remote branches); If you want to update your local branches you still need to pull every branch.

    fetch will not create local branches (which track remote branches), you have to do this manually. If you want to list all remote branches: git branch -a

To update local branches which track remote branches:

git pull --all

However, this can be still insufficient. It will work only for your local branches which track remote branches. To track all remote branches execute this oneliner BEFORE git pull --all:

git branch -r | grep -v '\->' | while read remote; do git branch --track "${remote#origin/}" "$remote"; done

TL;DR version

git branch -r | grep -v '\->' | while read remote; do git branch --track "${remote#origin/}" "$remote"; done
git fetch --all
git pull --all

(it seems that pull fetches all branches from all remotes, but I always fetch first just to be sure)

Run the first command only if there are remote branches on the server that aren't tracked by your local branches.

P.S. AFAIK git fetch --all and git remote update are equivalent.

Kamil Szot's comment, which 74 (at least) people found useful.

    I had to use:

    for remote in `git branch -r`; do git branch --track ${remote#origin/} $remote; done

    because your code created local branches named origin/branchname and I was getting "refname 'origin/branchname' is ambiguous whenever I referred to it.

Here's something I'd consider robust:

    Doesn't update remote tracking for existing branches
    Doesn't try to update HEAD to track origin/HEAD
    Allows remotes named other than origin
    Properly shell quoted

for b in $(git branch -r --format='%(refname:short)'); do
  [[ "${b#*/}" = HEAD ]] && continue
  git show-ref -q --heads "${b#*/}" || git branch --track "${b#*/}" "$b";
done
git pull --all

It's not necessary to git fetch --all as passing -all to git pull passes this option to the internal fetch.

Credit to this answer.

I believe you have clone the repository by

git clone https://github.com/pathOfrepository

now go to that folder using cd

cd pathOfrepository

if you type git status

you can see all

   On branch master
Your branch is up-to-date with 'origin/master'.
nothing to commit, working directory clean

to see all hidden branch type

 git branch -a

it will list all the remote branch

now if you want to checkout on any particular branch just type

git checkout -b localBranchName origin/RemteBranchName

When you clone a repository all the information of the branches is actually downloaded but the branches are hidden. With the command

$ git branch -a

you can show all the branches of the repository, and with the command

$ git checkout -b branchname origin/branchname

you can then "download" them manually one at a time.

However, there is a much cleaner and quicker way, though it's a bit complicated. You need three steps to accomplish this:

    First step

    create a new empty folder on your machine and clone a mirror copy of the .git folder from the repository:

    $ cd ~/Desktop && mkdir my_repo_folder && cd my_repo_folder
    $ git clone --mirror https://github.com/planetoftheweb/responsivebootstrap.git .git

    the local repository inside the folder my_repo_folder is still empty, there is just a hidden .git folder now that you can see with a "ls -alt" command from the terminal.

    Second step

    switch this repository from an empty (bare) repository to a regular repository by switching the boolean value "bare" of the git configurations to false:

    $ git config --bool core.bare false

    Third Step

    Grab everything that inside the current folder and create all the branches on the local machine, therefore making this a normal repo.

    $ git reset --hard

So now you can just type the command git branch and you can see that all the branches are downloaded.

This is the quick way in which you can clone a git repository with all the branches at once, but it's not something you wanna do for every single project in this way.

git remote add origin https://yourBitbucketLink

git fetch origin

git checkout -b yourNewLocalBranchName origin/requiredRemoteBranch (use tab :D)

Now locally your yourNewLocalBranchName is your requiredRemoteBranch.

Just those 3 commands will get all the branches

git clone --mirror repo.git  .git     (gets just .git  - bare repository)

git config --bool core.bare false

git reset --hard

We can put all branch or tag names in a temporary file, then do git pull for each name/tag:

git branch -r | grep origin | grep -v HEAD| awk -F/ '{print $NF}' > /tmp/all.txt
git tag -l >> /tmp/all.txt
for tag_or_branch in `cat /tmp/all.txt`; do git checkout $tag_or_branch; git pull origin $tag_or_branch; done

If you do:

git fetch origin

then they will be all there locally. If you then perform:

git branch -a

you'll see them listed as remotes/origin/branch-name. Since they are there locally you can do whatever you please with them. For example:

git diff origin/branch-name

or

git merge origin/branch-name

or

git checkout -b some-branch origin/branch-name

You can fetch all the branches by:

git fetch --all

or:

git fetch origin --depth=10000 $(git ls-remote -h -t origin)

The --depth=10000 parameter may help if you've shallowed repository.

To pull all the branches, use:

git pull --all

If above won't work, then precede the above command with:

git config remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'

as the remote.origin.fetch could support only a specific branch while fetching, especially when you cloned your repo with --single-branch. Check this by: git config remote.origin.fetch.

After that you should be able to checkout any branch.

See also:

    How to fetch all remote branches?
    How to clone all remote branches in Git?

To push all the branches to the remote, use:

git push --all

eventually --mirror to mirror all refs.

If your goal is to duplicate a repository, see: Duplicating a repository article at GitHub.

Make sure all the remote branches are fetchable in .git/config file.

In this example, only the origin/production branch is fetchable, even if you try to do git fetch --all nothing will happen but fetching the production branch:

[origin]
fetch = +refs/heads/production:refs/remotes/origin/production

This line should be replaced by:

[origin]
fetch = +refs/heads/*:refs/remotes/origin/*

Then run git fetch etc...

The bash for loop wasn't working for me, but this did exactly what I wanted. All the branches from my origin mirrored as the same name locally.

git checkout --detach
git fetch origin '+refs/heads/*:refs/heads/*'

Edited: See Mike DuPont's comment below. I think I was trying to do this on a Jenkins Server which leaves it in detached head mode.

Use git fetch && git checkout RemoteBranchName.

It works very well for me...

After you clone the master repository, you just can execute

git fetch && git checkout <branchname>

If you have problems with fetch --all

then track your remote branch

git checkout --track origin/%branchname%

Looping didn't seem to work for me and I wanted to ignore origin/master. Here's what worked for me.

git branch -r | grep -v HEAD | awk -F'/' '{print $2 " " $1"/"$2}' | xargs -L 1 git branch -f --track

After that:

git fetch --all
git pull --all

I usually use nothing else but commands like this:

git fetch origin
git checkout --track origin/remote-branch

A little shorter version:

git fetch origin
git checkout -t origin/remote-branch







    How to remove local(untracked) files from the current Git working tree?
    What is the difference between 'git pull' and 'git fetch'?
    How do I undo the most recent commits in Git?
    How do I force “git pull” to overwrite local files?
    How do you create a remote Git branch?
    How do I check out a remote Git branch?
    How do I delete a Git branch both locally and remotely?
    How do I push a new local branch to a remote Git repository and track it too?
    How do I rename a local Git branch?
    Git fetch remote branch

git-branch



English
Top
1
Downloading
1

## TL;DR

## TS;RE

# The How

~/.gitconfig
    fetch-all-branches = "!func() { \
        git checkout --detach && git fetch origin '+refs/heads/*:refs/heads/*';\
        };func"

# The Walk-through


# Reference

- []()
- []()
https://code-examples.net/en/q/9d5b49
