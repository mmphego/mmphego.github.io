---
layout: post
title: "Note To Self: How To Fix A VirtualBox Machine With The Name 'dashboard' Already Exists."
date: 2021-09-24 06:48:06.000000000 +02:00
tags:
- Tips and Tricks
- DevOps
- VirtualBox
- Vagrant
---

# Note To Self: How To Fix A VirtualBox Machine With The Name 'dashboard' Already Exists..

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2021-09-24-Note-To-Self-How-to-fix-a-VirtualBox-machine-with-the-name-dashboard-already-exists..png" | absolute_url }})
{: refdef}

3 Min Read

---

# The Story

Recently started having this issue when I tried to bring up my VirtualBox machine with the name 'dashboard'. I wasn't able to do so because of the dreaded message *'The name 'dashboard' is already in use by another virtual machine.'* Deleting the vm was not an option as it would take me a long time to get it to work due to low internet connectivity at the time.

![image](https://user-images.githubusercontent.com/7910856/134775449-8a275323-5f8a-4b5e-8e66-0ed855e8586e.png)

In this post I will detail how I fixed this issue.

# The Walk-through

Running the following command in the terminal:

```bash
vboxmanage list vms
```

Outputs the following:

![image](https://user-images.githubusercontent.com/7910856/134775766-957b9c18-2551-431c-92e4-5b083369fc3c.png)

Then I had to replace the id of the vm with the id of the vm that had the name 'dashboard' from the output of the command above.

```bash
echo "baf04c7b-8248-4954-be66-c4379e5b7af7" > .vagrant/machines/dashboard/virtualbox/id
```

After replacing the id of the vm with the id of the vm that had the name 'dashboard' I ran the following command in the terminal:

```bash
vagrant up
```

And kept on getting the warning below, where ssh authentication kept failing.

![image](https://user-images.githubusercontent.com/7910856/134775936-9dbfd459-8f23-410a-93b9-728b8faf96a4.png)

The fix was to add the ssh config to the `Vagrantfile`:

```bash
Vagrant.configure("2") do |config|
  config.ssh.username = 'root'
  config.ssh.password = 'vagrant'
  config.ssh.insert_key = 'false'
  ...
```

Then retried to bring up the vm again:

```bash
vagrant up
```

![image](https://user-images.githubusercontent.com/7910856/134776318-db5d6ec1-bde3-41e0-9684-1f5071a202b2.png)

Success!!!
