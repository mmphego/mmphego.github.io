---
layout: post
title: "Note To Self: A VirtualBox Machine With The Name Already Exists."
date: 2021-01-07 11:31:18.000000000 +02:00
tags:

---
# Note To Self: A VirtualBox Machine With The Name Already Exists...

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2021-01-07-A-VirtualBox-machine-with-the-name-already-exists..png" | absolute_url }})
{: refdef}

<<TIME TO READ>>

-----------------------------------------------------------------------------------------

# The Story

I was working on my virtual machine/box, when I was done ran `vagrant suspend`. The following day when I wanted to resume it kept giving me the dreaded **A VirtualBox machine with the name 'master' already exists.**

![image](https://user-images.githubusercontent.com/7910856/103876301-25139680-50dc-11eb-893d-e62413ccb203.png)

Then I tried running `vagrant resume`, `vagrant halt` and `vagrant up` which did not work.

# The Fix

This is how I eventually fixed the issue.

- Get UUID for the virtual machine that's acting up

```bash
$ BAD_VM='master'
$ VM_ID=$(vboxmanage list vms | grep ${BAD_VM} | cut -f 2 -d ' ')
```

- Remove the virtual machine.

```bash
$ vboxmanage unregistervm ${VM_ID} --delete
0%...10%...20%...30%...40%...50%...60%...70%...80%...90%...100%
```

- Startup another instance of the virtual machine.

```bash
$ vagrant up

Bringing machine 'master' up with 'virtualbox' provider...
==> master: Importing base box 'generic/opensuse42'...
==> master: Matching MAC address for NAT networking...
==> master: Checking if box 'generic/opensuse42' version '3.1.14' is up to date...
==> master: Setting the name of the VM: master
==> master: Clearing any previously set network interfaces...
==> master: Preparing network interfaces based on configuration...
    master: Adapter 1: nat
    master: Adapter 2: intnet
==> master: Forwarding ports...
    master: 22 (guest) => 2000 (host) (adapter 1)
    master: 6443 (guest) => 6443 (host) (adapter 1)
    master: 30000 (guest) => 30000 (host) (adapter 1)
    master: 30001 (guest) => 30001 (host) (adapter 1)
    master: 30002 (guest) => 30002 (host) (adapter 1)
    master: 30003 (guest) => 30003 (host) (adapter 1)
    master: 30004 (guest) => 30004 (host) (adapter 1)
    master: 30005 (guest) => 30005 (host) (adapter 1)
    master: 30006 (guest) => 30006 (host) (adapter 1)
    master: 30007 (guest) => 30007 (host) (adapter 1)
    master: 30008 (guest) => 30008 (host) (adapter 1)
    master: 30009 (guest) => 30009 (host) (adapter 1)
    master: 30010 (guest) => 30010 (host) (adapter 1)
    master: 30011 (guest) => 30011 (host) (adapter 1)
    master: 30012 (guest) => 30012 (host) (adapter 1)
    master: 30013 (guest) => 30013 (host) (adapter 1)
    master: 30014 (guest) => 30014 (host) (adapter 1)
    master: 30015 (guest) => 30015 (host) (adapter 1)
    master: 30016 (guest) => 30016 (host) (adapter 1)
    master: 30017 (guest) => 30017 (host) (adapter 1)
    master: 30018 (guest) => 30018 (host) (adapter 1)
    master: 30019 (guest) => 30019 (host) (adapter 1)
    master: 30020 (guest) => 30020 (host) (adapter 1)
    master: 30021 (guest) => 30021 (host) (adapter 1)
    master: 30022 (guest) => 30022 (host) (adapter 1)
    master: 30023 (guest) => 30023 (host) (adapter 1)
    master: 30024 (guest) => 30024 (host) (adapter 1)
    master: 30025 (guest) => 30025 (host) (adapter 1)
    master: 30026 (guest) => 30026 (host) (adapter 1)
    master: 30027 (guest) => 30027 (host) (adapter 1)
    master: 30028 (guest) => 30028 (host) (adapter 1)
    master: 30029 (guest) => 30029 (host) (adapter 1)
    master: 30030 (guest) => 30030 (host) (adapter 1)
    master: 30031 (guest) => 30031 (host) (adapter 1)
    master: 30032 (guest) => 30032 (host) (adapter 1)
    master: 30033 (guest) => 30033 (host) (adapter 1)
    master: 30034 (guest) => 30034 (host) (adapter 1)
    master: 30035 (guest) => 30035 (host) (adapter 1)
    master: 30036 (guest) => 30036 (host) (adapter 1)
    master: 30037 (guest) => 30037 (host) (adapter 1)
    master: 30038 (guest) => 30038 (host) (adapter 1)
    master: 30039 (guest) => 30039 (host) (adapter 1)
    master: 30040 (guest) => 30040 (host) (adapter 1)
    master: 30041 (guest) => 30041 (host) (adapter 1)
    master: 30042 (guest) => 30042 (host) (adapter 1)
    master: 30043 (guest) => 30043 (host) (adapter 1)
    master: 30044 (guest) => 30044 (host) (adapter 1)
    master: 30045 (guest) => 30045 (host) (adapter 1)
    master: 30046 (guest) => 30046 (host) (adapter 1)
    master: 30047 (guest) => 30047 (host) (adapter 1)
    master: 30048 (guest) => 30048 (host) (adapter 1)
    master: 30049 (guest) => 30049 (host) (adapter 1)
    master: 30050 (guest) => 30050 (host) (adapter 1)
    master: 30051 (guest) => 30051 (host) (adapter 1)
    master: 30052 (guest) => 30052 (host) (adapter 1)
    master: 30053 (guest) => 30053 (host) (adapter 1)
    master: 30054 (guest) => 30054 (host) (adapter 1)
    master: 30055 (guest) => 30055 (host) (adapter 1)
    master: 30056 (guest) => 30056 (host) (adapter 1)
    master: 30057 (guest) => 30057 (host) (adapter 1)
    master: 30058 (guest) => 30058 (host) (adapter 1)
    master: 30059 (guest) => 30059 (host) (adapter 1)
    master: 30060 (guest) => 30060 (host) (adapter 1)
    master: 30061 (guest) => 30061 (host) (adapter 1)
    master: 30062 (guest) => 30062 (host) (adapter 1)
    master: 30063 (guest) => 30063 (host) (adapter 1)
    master: 30064 (guest) => 30064 (host) (adapter 1)
    master: 30065 (guest) => 30065 (host) (adapter 1)
    master: 30066 (guest) => 30066 (host) (adapter 1)
    master: 30067 (guest) => 30067 (host) (adapter 1)
    master: 30068 (guest) => 30068 (host) (adapter 1)
    master: 30069 (guest) => 30069 (host) (adapter 1)
    master: 30070 (guest) => 30070 (host) (adapter 1)
    master: 30071 (guest) => 30071 (host) (adapter 1)
    master: 30072 (guest) => 30072 (host) (adapter 1)
    master: 30073 (guest) => 30073 (host) (adapter 1)
    master: 30074 (guest) => 30074 (host) (adapter 1)
    master: 30075 (guest) => 30075 (host) (adapter 1)
    master: 30076 (guest) => 30076 (host) (adapter 1)
    master: 30077 (guest) => 30077 (host) (adapter 1)
    master: 30078 (guest) => 30078 (host) (adapter 1)
    master: 30079 (guest) => 30079 (host) (adapter 1)
    master: 30080 (guest) => 30080 (host) (adapter 1)
    master: 30081 (guest) => 30081 (host) (adapter 1)
    master: 30082 (guest) => 30082 (host) (adapter 1)
    master: 30083 (guest) => 30083 (host) (adapter 1)
    master: 30084 (guest) => 30084 (host) (adapter 1)
    master: 30085 (guest) => 30085 (host) (adapter 1)
    master: 30086 (guest) => 30086 (host) (adapter 1)
    master: 30087 (guest) => 30087 (host) (adapter 1)
    master: 30088 (guest) => 30088 (host) (adapter 1)
    master: 30089 (guest) => 30089 (host) (adapter 1)
    master: 30090 (guest) => 30090 (host) (adapter 1)
    master: 30091 (guest) => 30091 (host) (adapter 1)
    master: 30092 (guest) => 30092 (host) (adapter 1)
    master: 30093 (guest) => 30093 (host) (adapter 1)
    master: 30094 (guest) => 30094 (host) (adapter 1)
    master: 30095 (guest) => 30095 (host) (adapter 1)
    master: 30096 (guest) => 30096 (host) (adapter 1)
    master: 30097 (guest) => 30097 (host) (adapter 1)
    master: 30098 (guest) => 30098 (host) (adapter 1)
    master: 30099 (guest) => 30099 (host) (adapter 1)
    master: 30100 (guest) => 30100 (host) (adapter 1)
==> master: Running 'pre-boot' VM customizations...
==> master: Booting VM...
==> master: Waiting for machine to boot. This may take a few minutes...
    master: SSH address: 127.0.0.1:2000
    master: SSH username: vagrant
    master: SSH auth method: private key
    master: Warning: Connection reset. Retrying...
    master: Warning: Remote connection disconnect. Retrying...
    master: Warning: Remote connection disconnect. Retrying...
    master: Warning: Connection reset. Retrying...
    master: Warning: Remote connection disconnect. Retrying...
    master: Warning: Connection reset. Retrying...
    master: 
    master: Vagrant insecure key detected. Vagrant will automatically replace
    master: this with a newly generated keypair for better security.
    master: 
    master: Inserting generated public key within guest...
    master: Removing insecure key from the guest if it's present...
    master: Key inserted! Disconnecting and reconnecting using new SSH key...
==> master: Machine booted and ready!
==> master: Checking for guest additions in VM...
    master: The guest additions on this VM do not match the installed version of
    master: VirtualBox! In most cases this is fine, but in rare cases it can
    master: prevent things such as shared folders from working properly. If you see
    master: shared folder errors, please make sure the guest additions within the
    master: virtual machine match the version of VirtualBox you have installed on
    master: your host and reload your VM.
    master: 
    master: Guest Additions Version: 5.2.24
    master: VirtualBox Version: 6.1
==> master: Setting hostname...
==> master: Configuring and enabling network interfaces...
==> master: Running provisioner: shell...
    master: Running: inline script
    master: Repository 'openSUSE-Leap-42.3-Non-Oss' is up to date.
    master: Repository 'openSUSE-Leap-42.3-Oss' is up to date.
    master: Repository 'openSUSE-Leap-42.3-Update' is up to date.
    master: Repository 'openSUSE-Leap-42.3-Update-Non-Oss' is up to date.
    master: All repositories have been refreshed.
    master: Loading repository data...
    master: Warning: Repository 'openSUSE-Leap-42.3-Update' appears to be outdated. Consider using a different mirror or server.
    master: Warning: Repository 'openSUSE-Leap-42.3-Update-Non-Oss' appears to be outdated. Consider using a different mirror or server.
    master: Reading installed packages...
    master: 'bzip2' is already installed.
    master: No update candidate for 'bzip2-1.0.6-34.15.x86_64'. The highest available version is already installed.
    master: Resolving package dependencies...
    master: Nothing to do.
    master: Loading repository data...
    master: Warning: Repository 'openSUSE-Leap-42.3-Update' appears to be outdated. Consider using a different mirror or server.
    master: Warning: Repository 'openSUSE-Leap-42.3-Update-Non-Oss' appears to be outdated. Consider using a different mirror or server.
    master: Reading installed packages...
    master: Resolving package dependencies...
    master: 
    master: The following NEW package is going to be installed:
    master:   etcd
    master: 1 new package to install.
    master: Overall download size: 4.0 MiB. Already cached: 0 B. After the operation, additional 22.9 MiB will be used.
    master: Continue? [y/n/...? shows all options] (y): y
    master: Retrieving package etcd-3.1.0-3.2.x86_64 (1/1),   4.0 MiB ( 22.9 MiB unpacked)
    master: Retrieving: etcd-3.1.0-3.2.x86_64.rpm [
    master: .
    master: .
    master: .
    master: .
    master: .
    master: .
    master: .
    master: done (583.9 KiB/s)]
    master: Checking for file conflicts: [..
    master: .
    master: .done]
    master: (1/1) Installing: etcd-3.1.0-3.2.x86_64 [.
    master: .
    master: .
    master: .
    master: .
    master: .
    master: .
    master: .
    master: .
    master: .
    master: .
    master: .
    master: done]
    master: Additional rpm output:
    master: Updating /etc/sysconfig/etcd...
    master: 
    master: [INFO]  Finding release for channel stable
    master: [INFO]  Using v1.20.0+k3s2 as release
    master: [INFO]  Downloading hash https://github.com/rancher/k3s/releases/download/v1.20.0+k3s2/sha256sum-amd64.txt
    master: [INFO]  Downloading binary https://github.com/rancher/k3s/releases/download/v1.20.0+k3s2/k3s
    master: [INFO]  Verifying binary download
    master: [INFO]  Installing k3s to /usr/local/bin/k3s
    master: [INFO]  Creating /usr/local/bin/kubectl symlink to k3s
    master: [INFO]  Creating /usr/local/bin/crictl symlink to k3s
    master: [INFO]  Creating /usr/local/bin/ctr symlink to k3s
    master: [INFO]  Creating killall script /usr/local/bin/k3s-killall.sh
    master: [INFO]  Creating uninstall script /usr/local/bin/k3s-uninstall.sh
    master: [INFO]  env: Creating environment file /etc/systemd/system/k3s.service.env
    master: [INFO]  systemd: Creating service file /etc/systemd/system/k3s.service
    master: [INFO]  systemd: Enabling k3s unit
    master: Created symlink from /etc/systemd/system/multi-user.target.wants/k3s.service to /etc/systemd/system/k3s.service.
    master: [INFO]  systemd: Starting k3s
```
