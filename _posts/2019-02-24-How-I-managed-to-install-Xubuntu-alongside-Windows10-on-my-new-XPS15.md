---
layout: post
title: "How I managed to install [X]Ubuntu alongside Windows 10 on my new XPS 15"
date: 2019-02-24 15:32:20.000000000 +02:00
tags:
- Ubuntu
- Windows
- Tips/Tricks
---
# How I managed to install [X]Ubuntu alongside Windows 10 on my new XPS 15

After almost 4 years of using my [Dell Latitude E5540](https://www.dell.com/en-us/work/shop/cty/latitude-15-5000-series-e5540/spd/latitude-e5540-laptop), I was due for an upgrade.
Well I must say, this laptop has served it's purpose and I enjoyed every minute of it apart from the battery life and the failing disk which causes my system to just freeze time to time, as I digress.

Anyways, I decided to place an order for a [Dell XPS 15 9570](https://www.dell.com/en-us/shop/dell-laptops/xps-15/spd/xps-15-9570-laptop). It is an amazing laptop to say the least from the 16Gb memory to the 512Gb SSD not forgetting the Intel Core i7 CPU. I just had to get my filthy hands on it.

The thing with new laptops is that getting Ubuntu installed alongside Windows is a bit trickier due to the high level of security on EUFI mode instead of BIOS, and Windows Bitlocker/secureboot related issues.

I have seen numerous online/YouTube tutorials on installing different versions of Ubuntu on different XPS's along side Windows 10, however not all work, It is either you *Wipe* Windows completely and then install Ubuntu or risk corrupting Windows installation - which sucks!!!
{:refdef: style="text-align: center;"}
<div><img src="https://www.tenforums.com/attachments/antivirus-firewalls-system-security/179380d1520127328t-asking-bitlocker-recovery-key-login-whatsapp-image-2018-03-03-20.18.06.jpeg?s=08bfede6f6886f1f87b9fc1550431c39" alt="" style="width: 400px;"/></div>
{: refdef}


Long story short, the last time I used Microsoft Windows was when Windows Vista came out, I have been a Linux heavy user since then and the only reason why I opted to dual boot instead of a complete system-wide Linux installation is the Video editing tools and Gaming on Windows - So I was like...
{:refdef: style="text-align: center;"}
<div><img src="https://media.tenor.com/images/f203bbd60006dedaaef4c0fae63c7fdd/tenor.gif" alt=""/>
</div>
{: refdef}

Enough about the chit-chat let me get down to business.

## Preparation

First, you need to download an Ubuntu ISO and burn it to your USB stick.
You can find the list of Ubuntu flavours [here](https://www.ubuntu.com/download/flavours), I rather prefer [XUbuntu](https://xubuntu.org/) and the instructions for burning the ISO to USB are [here](https://linuxize.com/post/how-to-create-a-bootable-ubuntu-18-04-usb-stick/) using [etcher](https://www.balena.io/etcher/).

In your Windows 10:

### Partition storage drive

*   Click the `start menu`.
*   Type `disk management` and open `Disk Management`.
*   Select the `Windows partition` (most likely to be the largest one).
*   Right click on it and select `"Shrink Volume"`.
*   Shrink to desired amount. (I shrank 200GB for Ubuntu)
*   See if a partition of `"Unallocated space"` is shown.

### Enable AHCI mode

In order to install Ubuntu or any Linux distro, you need to set the storage drive to [AHCI mode](https://forums.crucial.com/t5/SSD-Archive-Read-Only/Why-do-i-need-AHCI-with-a-SSD-Drive-Guide-Here-Crucial-AHCI-vs/td-p/57078).

*   Click the `start menu`, search and run Command Prompt as an `admin`.
*   Run: `bcdedit /set {current} safeboot minimal`
*   Reboot.
*   Tap `F2` when you see the Dell logo, until it loads the BIOS/UEFI setup.
*   Under `Settings`, select `System Configuration` then `SATA Operation` and enable `AHCI` mode.
*   Press "Apply", "Save as Custom User Settings?" and then "Exit".
*   Windows will boot into `Safemode` and will require you to login.
*   Open the Command Prompt as an `admin` again (**Windows + R**, type in `cmd` and press **Ctrl+Shift+Enter**)
*   Run: `bcdedit /deletevalue {current} safeboot`
*   Reboot.

## Installing Ubuntu

If you followed all the instruction, we are now ready for the installation of Ubuntu.

*   Insert the `Ubuntu USB` into the XPS obviously and Reboot.
*   Tap `F12` when you see the Dell logo.
*   Select the one with the words "UEFI: Vendor blablabla" in it and hit enter.
*   Select "Try Ubuntu without installing" option [DO NOT HIT `ENTER` YET!]
*   Press `e`
*   Find the line with `quiet splash` and add `nomodeset` just after it in.
{:refdef: style="text-align: center;"}
<div><img src="https://kbimg.dell.com/library/KB/DELL_ORGANIZATIONAL_GROUPS/DELL_GLOBAL/REC/nomodeset_Linux_HC_ASM_03.jpg" alt=""/></div>
{: refdef}
*   Press `F10` to save.
*   Locate the `Ubuntu installer` on the desktop and launch it.
*   Select `"Enable Insecure Boot mode"` during the installation and **remember the password** for it.
*   Complete the installation and Reboot


After the reboot, you will be greeted by a blue screen [`"Perform MOK management"`](https://www.rodsbooks.com/efi-bootloaders/secureboot.html), press any keys and,

*   Select `Change Secure Boot State`
*   Enter your password and then `Continue Boot`.

After that, the computer will reboot and you will be greeted by the `Grub screen` with booting options.

*   Hover over the option `"Ubuntu"`
*   Press `e`
*   After the words `quiet splash`, add `nouveau.modeset=0`.
    *   Detailed instructions can be found [here](https://www.dell.com/support/article/za/en/zabsdt1/sln306327/manual-nomodeset-kernel-boot-line-option-for-linux-booting?lang=en)
*   Press `F10` to save.

Boot into Ubuntu, and open your terminal and add the parameter `nouveau.modeset=0` to the Linux kernel command in `grub`. To make it permanent.

```
echo 'GRUB_CMDLINE_LINUX="nouveau.modeset=0' | sudo tee -a /etc/default/grub
sudo update-grub2
```

## Post Ubuntu Installation

After a successful Ubuntu installation, you will need to update the packages as well as install some drivers for your machine, however this can be very tedious. So over time I got irritated about installing packages after a fresh install and then I wrote script to automate my installations.

Check it out on [GitHub](https://github.com/mmphego/new-computer) and read the [README.md](https://github.com/mmphego/new-computer/blob/master/README.md)

The script will install various packages as well as [XPS 15 tweaks](https://github.com/JackHack96/dell-xps-9570-ubuntu-respin).

To run the installation enter, command and follow the prompts.
```shell
bash -c "$(curl -L https://git.io/runme)"
```

## Conclusion

Dual booting Windows and Linux can be a challenge on it's own, It took me some time to get everything to working and at the end of it all - It was worth it. The Dell XPS 15 is a great laptop to work on, It will take me sometime to adjust from from using the Latitude. I hope this post was helpful.

### Further Reading & Reference

*   [https://medium.com/@peterpang_84917/personal-experience-of-installing-ubuntu-18-04-lts-on-xps-15-9570-3e53b6cfeefe](https://medium.com/@peterpang_84917/personal-experience-of-installing-ubuntu-18-04-lts-on-xps-15-9570-3e53b6cfeefe)
*   [https://medium.com/@jthegedus/ubuntu-18-04-lts-on-a-dell-xps-15-db4dcee9a2f9](https://medium.com/@jthegedus/ubuntu-18-04-lts-on-a-dell-xps-15-db4dcee9a2f9)
*   [https://medium.com/@tomwwright/better-battery-life-on-ubuntu-17-10-4588b7f72def](https://medium.com/@tomwwright/better-battery-life-on-ubuntu-17-10-4588b7f72def)
*   [https://medium.com/@kemra102/linux-on-the-dell-xps-15-919e6d472aa3](https://medium.com/@kemra102/linux-on-the-dell-xps-15-919e6d472aa3)

