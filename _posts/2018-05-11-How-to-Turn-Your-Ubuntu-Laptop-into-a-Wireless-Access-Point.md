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

For the past week or so, I have been deployed to a remote area where we are building the largest telescope in the southern hemisphere ([www.ska.ac.za](www.ska.ac.za)). Communication is very limited as they have imposed a number of restrictions related to Radio Frequency Interruptions(RFI's), this simply means No WiFi, No Cellphone towers nearby i.e. No Mobile connection the only connection to the outside world is via Fibre. Before I digress, let me take my focus back on how I managed to turn my Laptop running Ubuntu to a WiFi Hotspot (Note: This is not allowed but seeing that everything was offline, then why not.)

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