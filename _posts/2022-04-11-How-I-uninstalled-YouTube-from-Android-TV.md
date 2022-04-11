---
layout: post
title: "How I Uninstalled YouTube From Android TV"
date: 2022-04-11 12:01:21.000000000 +02:00
tags:
- Android
- How-to
- Tips and Tricks
---
# How I Uninstalled YouTube From Android TV

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2022-04-11-How-I-uninstalled-YouTube-from-Android-TV.png" | absolute_url }})
{: refdef}

5 Min Read

---

# The Story

Not sure about you, but the fact that some apps come pre-installed on your Android TV and you cannot remove them is a big deal to me. YouTube is one of them. Due to some inappropriate content found on YouTube, I decided to uninstall it.

Pre-installed apps on any Android device are a mission to remove if your device is not rooted. Rooting is not an option as it might void the manufacturer's warranty; therefore, the reality is that, at least officially, it is not possible to remove pre-installed apps on Android TV. Instead, Android lets you disable such applications which is something I did not want to do as it would be a waste of my time; mainly because it can always be re-enabled by a user.

This post details ways how I managed to uninstall YouTube from Android TV.
**Note:** You can follow the same steps if you want to remove any other pre-installed app on any android device.

## The How

## The Walk-through

Before you start, you will need to do the following:

### Enable developer mode on your device

This YouTube :) video below will explain how to do it.

{:refdef: style="text-align: center;"}
<iframe width="100%" height="315" src="https://www.youtube.com/embed/t1d4Uu04GlU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
{: refdef}

### Install ADB (Android Debug Bridge)

After enabling developer mode, you will need to download the Android Debug Bridge (ADB) on your computer. I use Ubuntu OS, and I have installed it with the following command:

```bash
sudo apt update
sudo apt install android-tools-adb android-tools-fastboot
```

Once installed, you can run the following command to check if ADB is working:

```bash
adb version
```

Should display something like this:

```bash
Android Debug Bridge version 1.0.39
Version 1:8.1.0+r23-5ubuntu2
Installed as /usr/lib/android-sdk/platform-tools/adb
```

### Connect to the device

After ADB was installed, I needed to connect to my Android TV device via WiFi. I have my IoT devices connected to my other router (for security reasons), and devices have a static IP address.
The following command will connect to my Android TV device:

![adb_2022-01-29_08-13](https://user-images.githubusercontent.com/7910856/162721278-c0076805-f5a7-4e04-9ad9-f19cfea95315.png)

**Note:** This requires you to authenticate your computer with your Android TV device, and a message will appear on your screen, asking you to enter your password or validate the connection.

### Backup apps on your device

Once connected, I wanted to backup all the apps that are installed on my Android TV just in case.

![adb_2022-01-29_08-27](https://user-images.githubusercontent.com/7910856/162721275-4d957f04-8436-4e3a-924c-bbe9c694d5e5.png)

### Remove YouTube from the device

When backup was completed, I then listed all the apps installed on my Android TV device and filter anything containing the word "YouTube" from it.

![adb_2022-01-29_08-41](https://user-images.githubusercontent.com/7910856/162721272-f24a8168-9949-418a-bc87-7f1bf9494f6e.png)

Then it was time to uninstall YouTube from my Android TV device. The output **Success** means that YouTube was successfully uninstalled. You can verify this by checking the list of apps installed on your Android TV device.

![adb_2022-01-29_09-24](https://user-images.githubusercontent.com/7910856/162721262-720feb30-d693-4371-90a2-ffbda5b7a348.png)

Let's quickly break down the command I executed above.

- **pm:** This invokes the package manager and executes any action on the applications loaded on your device.
- **uninstall:** This removes a package from the system.
- **-k:** Formalized paraphrase This is an option on the uninstall command that retains the data and cache folders after the package is deleted.
- **-user 0:** This identifies the intended user. In this scenario, we are merely deleting the software from User 0.
- **<name of package>:** To uninstall the YouTube package, I used 'com.google.android.youtube.tv' in my case.

Should you want more on how to use ADB, I recommend this cheatsheet: <https://www.automatetheplanet.com/adb-cheat-sheet/>

When you are done, you can disconnect from your device and enjoy your Android TV without YouTube or any other app you do not want.
