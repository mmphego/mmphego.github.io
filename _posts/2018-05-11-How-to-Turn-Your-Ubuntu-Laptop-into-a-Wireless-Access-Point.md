---
layout: post
title: "How to Turn Your Ubuntu Laptop into a Wireless Access Point"
date: 2018-05-11 7:36:22.000000000 +02:00
categories:
- Bash
- Linux
- Linux/Ubuntu
tags: 
- Hacks
- Linux/Ubuntu
---

# How to turn your Ubuntu laptop into a WiFi AP

I have found myself, having to access WiFi connection from my phone and the only available connection was ethernet. Which led to finding ways I can make my laptop behave like a WiFi AP.

First things first, install the dependencies.

## Pre-requsites:
- Your NIC (wlan0) needs to be able to support AP/ Infrastructure mode.

    - Install `iw`

```
    $ sudo apt install iw
    $ iw list
```

You should look for "Supported interface modes" section, where it should be a entry called AP like below

```
    Supported interface modes:
             * IBSS
             * managed
             * AP
             * AP/VLAN
             * monitor
             * mesh point
```

If your driver doesn't shows this AP, It doesn't mean it can't create wireless hotspot.

- Install git
```
    $ sudo apt install git
```
- Install dnsmasq
```
    $ sudo apt install dnsmasq
```
- Install Hostapd
    Hostapd is the standard linux daemon that will be used to create your access-point
```
    $ sudo apt install hostapd
```
- Install DHCP server
```
    $ sudo apt-get install dhcp3-server
```
- Install IProute
```
    $ sudo apt install iproute2
```

## Installation
```
    git clone https://github.com/oblique/create_ap
    cd create_ap
    sudo make install
```

## Creating a WiFi AP
To create an AP run the following code, Assuming that your WiFi NIC name is `wlan0` and Ethernet is `eth0`.

```
$ sudo create_ap wlan0 eth0 MyAccessPoint
```

You should now start seeing something like this on your terminal, ie you can now surf the interweb from your mobile device.

```
    Config dir: /tmp/create_ap.wlan0.conf.E9PIWP0I
    PID: 18086
    Network Manager found, set wlan0 as unmanaged device... DONE
    Sharing Internet using method: nat
    hostapd command-line interface: hostapd_cli -p /tmp/create_ap.wlan0.conf.E9PIWP0I/hostapd_ctrl
    Configuration file: /tmp/create_ap.wlan0.conf.E9PIWP0I/hostapd.conf
    Failed to create interface mon.wlan0: -23 (Too many open files in system)
    Try to remove and re-create mon.wlan0
    Failed to update rate sets in kernel module
    Using interface wlan0 with hwaddr d8:fc:93:17:b8:a8 and ssid 'MyAccessPoint'
```