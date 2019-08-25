---
layout: post
title: "Resolving Ubuntu's 'The Following Packages Have Unmet Dependencies' error."
date: 2019-08-25 11:20:15.000000000 +02:00
tags:
- Tips/Tricks
- Ubuntu
---
# Resolving Ubuntu's 'The Following Packages Have Unmet Dependencies' error.

-----------------------------------------------------------------------------------------

# The Story
Long-story short, I upgraded my `xfce4.12` to `xfce4.14` which broke my desktop environment. In order to fix that, I had two options either 1. Reinstall my `xUbuntu` (easy) or 2. Rollback to `xfce4.12` (complicated.)

# The How
I had to completely uninstall packages related to `xfce4` and `xubuntu-desktop`, and had issues reinstalling them...

```bash
$ sudo apt install --reinstall xfce4
Reading package lists... Done
Building dependency tree
Reading state information... Done
Some packages could not be installed. This may mean that you have
requested an impossible situation or if you are using the unstable
distribution that some required packages have not yet been created
or been moved out of Incoming.
The following information may help to resolve the situation:

The following packages have unmet dependencies:
 xfce4 : Depends: xfce4-settings (>= 4.12.0) but it is not going to be installed
         Depends: xfce4-panel (>= 4.12.0) but it is not going to be installed
         Depends: xfdesktop4 (>= 4.12.0) but it is not going to be installed
         Depends: thunar (>= 1.6.6) but it is not going to be installed
         Depends: xfce4-session (>= 4.12.0) but it is not going to be installed
         Recommends: thunar-volman (>= 0.8.1) but it is not going to be installed
E: Unable to correct problems, you have held broken packages.
```

```bash
$ sudo apt install --reinstall xubuntu-desktop

Reading package lists... Done
Building dependency tree
Reading state information... Done
Some packages could not be installed. This may mean that you have
requested an impossible situation or if you are using the unstable
distribution that some required packages have not yet been created
or been moved out of Incoming.
The following information may help to resolve the situation:

The following packages have unmet dependencies:
 xubuntu-desktop : Depends: thunar but it is not going to be installed
                   Depends: thunar-volman but it is not going to be installed
                   Depends: xfce4-panel but it is not going to be installed
                   Depends: xfce4-session but it is not going to be installed
                   Depends: xfce4-settings but it is not going to be installed
                   Depends: xfdesktop4 but it is not going to be installed
                   Depends: xubuntu-core but it is not going to be installed
                   Depends: xubuntu-default-settings but it is not going to be installed
                   Recommends: thunar-archive-plugin but it is not going to be installed
                   Recommends: thunar-media-tags-plugin but it is not going to be installed
                   Recommends: xfburn but it is not going to be installed
                   Recommends: xfce4-cpugraph-plugin but it is not going to be installed
                   Recommends: xfce4-mailwatch-plugin but it is not going to be installed
                   Recommends: xfce4-notes-plugin but it is not going to be installed
                   Recommends: xfce4-places-plugin but it is not going to be installed
                   Recommends: xfce4-quicklauncher-plugin but it is not going to be installed
                   Recommends: xfce4-screenshooter but it is not going to be installed
                   Recommends: xfce4-terminal but it is not going to be installed
                   Recommends: xfce4-verve-plugin but it is not going to be installed
                   Recommends: xfce4-weather-plugin but it is not going to be installed
                   Recommends: xfce4-whiskermenu-plugin but it is not going to be installed
E: Unable to correct problems, you have held broken packages.
```

The usual command to have Ubuntu fix unmet dependencies and broken packages is:

`sudo apt-get install -f && sudo dpkg --configure -a`, but that didn't fix it.

# The Walkthrough

Solution was to install [`aptitude`](https://help.ubuntu.com/lts/serverguide/aptitude.html), via `apt install`

```bash
sudo apt-get install aptitude
```

Then reinstall `xfce4` and `xubuntu-desktop`:
```bash
$ sudo aptitude install xubuntu-desktop

The following NEW packages will be installed:
  exo-utils{a} libexo-1-0{a} libexo-2-0{a} libgarcon-1-0{a} libthunarx-2-0{a} libxfce4panel-2.0-4{a}
  libxfce4ui-1-0{a} libxfce4ui-2-0{a} libxfce4ui-common{a} libxfce4ui-utils{a} libxfce4util-bin{a}
  libxfce4util-common{a} libxfce4util7{a} libxfcegui4-4{a} libxfconf-0-2{a} mousepad{a} parole{a} ristretto{a}
  thunar{a} thunar-archive-plugin{a} thunar-data{a} thunar-media-tags-plugin{a} thunar-volman{a} xfburn{a}
  xfce4-appfinder{a} xfce4-cpugraph-plugin{a} xfce4-dict{a} xfce4-indicator-plugin{a} xfce4-mailwatch-plugin{a}
  xfce4-netload-plugin{a} xfce4-notes{a} xfce4-notes-plugin{a} xfce4-notifyd{a} xfce4-panel{a}
  xfce4-places-plugin{a} xfce4-power-manager{a} xfce4-power-manager-data{a} xfce4-power-manager-plugins{a}
  xfce4-pulseaudio-plugin{a} xfce4-quicklauncher-plugin{a} xfce4-screenshooter{a} xfce4-session{a}
  xfce4-settings{a} xfce4-statusnotifier-plugin{a} xfce4-systemload-plugin{a} xfce4-taskmanager{a}
  xfce4-terminal{a} xfce4-verve-plugin{a} xfce4-weather-plugin{a} xfce4-whiskermenu-plugin{a} xfce4-xkb-plugin{a}
  xfconf{a} xfdesktop4{ab} xfwm4{a} xubuntu-artwork{a} xubuntu-community-wallpapers{a}
  xubuntu-community-wallpapers-bionic{a} xubuntu-core{a} xubuntu-default-settings{a} xubuntu-desktop
  xubuntu-docs{a} xubuntu-icon-theme{a} xubuntu-wallpapers{a}
0 packages upgraded, 63 newly installed, 0 to remove and 0 not upgraded.
Need to get 40.5 MB of archives. After unpacking 108 MB will be used.
The following packages have unmet dependencies:
 xfdesktop4 : Depends: xfdesktop4-data (= 4.12.3-4ubuntu2) but 4.14.1-0ubuntu1~18.04 is installed
 libexo-helpers : Breaks: libexo-1-0 (< 0.12.2-2) but 0.12.2-0ubuntu0.18.04.1 is to be installed
The following actions will resolve these dependencies:

      Keep the following packages at their current version:
1)      libexo-1-0 [Not Installed]
2)      libthunarx-2-0 [Not Installed]
3)      thunar [Not Installed]
4)      thunar-archive-plugin [Not Installed]
5)      thunar-media-tags-plugin [Not Installed]
6)      thunar-volman [Not Installed]
7)      xfburn [Not Installed]
8)      xfce4-cpugraph-plugin [Not Installed]
9)      xfce4-mailwatch-plugin [Not Installed]
10)     xfce4-notes-plugin [Not Installed]
11)     xfce4-panel [Not Installed]
12)     xfce4-places-plugin [Not Installed]
13)     xfce4-quicklauncher-plugin [Not Installed]
14)     xfce4-screenshooter [Not Installed]
15)     xfce4-session [Not Installed]
16)     xfce4-settings [Not Installed]
17)     xfce4-verve-plugin [Not Installed]
18)     xfce4-weather-plugin [Not Installed]
19)     xfdesktop4 [Not Installed]
20)     xubuntu-core [Not Installed]
21)     xubuntu-default-settings [Not Installed]
22)     xubuntu-desktop [Not Installed]

      Leave the following dependencies unresolved:
23)     xfce4-screenshooter recommends xfce4-panel (>= 4.11)
24)     xfce4-screenshooter recommends xfce4-panel (< 4.13)
25)     xfce4-session recommends xfdesktop4


Accept this solution? [Y/n/q/?] y

```