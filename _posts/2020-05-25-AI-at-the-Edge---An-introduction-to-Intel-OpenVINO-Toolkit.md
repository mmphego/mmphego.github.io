---
layout: post
title: "AI At The Edge - An Introduction To Intel OpenVINO Toolkit"
date: 2020-05-25 17:31:33.000000000 +02:00
tags:
    - AI
    - Machine Learning
    - Deep Learning
    - Udacity
---
# AI At The Edge - An Introduction To Intel OpenVINO Toolkit.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2020-05-25-AI-at-the-Edge---An-introduction-to-Intel-OpenVINO-Toolkit.png" | absolute_url }})
{: refdef}

-----------------------------------------------------------------------------------------

# The Story
During mid-November 2019, I stumbled upon a [Udacity scholarship](https://www.udacity.com/scholarships) from their website and decided to apply. The course being offered was more on Computer Vision and this is one field that has always interested me from my days interning at CSIR in the robotics department, but I always had that impostor syndrome when it came to CV. This course couple Computer Vision and AI but was more focused on AI on the edge using Intel’s OpenVINO Toolkit.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/Intel-Scholarship+2020@2x.jpg" | absolute_url }})
{: refdef}

A few weeks later, I received an email from Udacity informing me that I was one of 16800 selected for Phase 1 of the scholarship.

The scholarship program is structured in two parts:

> Phase 1: 16800 Challenge scholarships
>
> The first phase of this scholarship provides 2.5 months of access to the Intel® Edge AI Scholarship Fundamentals Challenge course. Scholars in this course received a robust community experience via Slack supported by a dedicated Community Manager(s), being part of a dynamic student community and network of scholars and earn a chance to qualify for a full Nanodegree scholarship.
>
> Phase 2: 750 Nanodegree scholarships
>
> The top 750 students from the first phase of the program will earn a full scholarship to Udacity's brand new Intel® Edge AI for IoT Developers Nanodegree program.

Well through hard work and perseverance, I managed to get myself through **Phase 1** and ended up being part of the selected few in **Phase 2**.

As per the title of the post, this post detail the first 2 lessons of the course.
"[**Introduction to AI at the Edge**](#now-what-is-ai-at-the-edge) & [**Leveraging Pre-trained Models**](#leveraging-pre-trained-models)."

## Overview of the course

Below is a brief overview of the course offered by Udacity on Intel® Edge AI for IoT Developers Nanodegree:

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/udacity_curriculum.png" | absolute_url }})
{: refdef}

1. **Edge AI Fundamentals with OpenVINO™**

    This part of the lesson included some welcome information to Edge AI Fundamentals with OpenVINO™, where we learnt about the basics of AI at the Edge(Who, What and How), leveraging pre-trained ML models available with the Intel® Distribution of OpenVINO Toolkit™, convert and optimize other models with the Model Optimizer, and perform inference with the [Inference Engine](https://docs.openvinotoolkit.org/latest/_docs_IE_DG_Introduction.html#IE). Additionally, learning some topics for edge applications, like MQTT and how to stream video to servers.

    - Project: **Deploy a People Counter App at the Edge**

    Towards the end of every lesson, you need to create and complete a project.
    For this lesson, the project was a Person Counter application (I am planning on writing a detailed blog post about it soon).

2. **Choosing the Right Hardware**

    Grow your expertise in choosing the right hardware. Identify key hardware specifications of various hardware types (CPU, VPU, FPGA, and Integrated GPU). Utilize the DevCloud to test model performance and deploy power-efficient deep neural network inference on the various hardware types. Finally, you will distribute the workload on available computing devices to improve model performance.

    - Project: **Smart Queueing System**

    At the time of writing this post, I hadn't even started with the project - so it is still mysterious to me.

3. **Optimization Techniques and Tools**

    Learn how to optimize your model and application code to reduce inference time when running your model at the edge. Use different software optimization techniques to improve the inference time of your model. Calculate how computationally expensive your model is. Use DL Workbench to optimize your model and benchmark the performance of your model. Use a VTune amplifier to find and fix hotspots in your application code. Finally, package your application code and data so that it can be easily deployed to multiple devices.

    - Project: **Computer Pointer Controller**

    At the time of writing this post, I hadn't even started with the project - so it is still mysterious to me.

## TL;DR

You can find some useful notes and exercises (including projects) on this repo: [https://github.com/mmphego/Udacity-EdgeAI/](https://github.com/mmphego/Udacity-EdgeAI/) and jump over to the [Conclusion](#conclusion)

# The Walk-through

## First Things First - What Exactly is AI?
These days, AI (Artificial Intelligence) is an umbrella term to represent any program that can *Sense, Reason, Act, and Adapt*. Two ways that developers are getting machines to do that are machine learning and deep learning.

{:refdef: style="text-align: center;height:"}
![](https://software.intel.com/content/dam/develop/external/us/en/images/ai-circle-701560.jpg)
{: refdef}

- In **machine learning**, learning algorithms build a model from data, which they can improve on as they are exposed to more data over time. There are four main types of machine learning: supervised, unsupervised, semi-supervised, and reinforcement learning. In supervised machine learning, the algorithm learns to identify data by processing and categorizing vast quantities of labelled data. In unsupervised machine learning, the algorithm identifies patterns and categories within large amounts of unlabelled data-often much more quickly than a human brain could. You can read a lot more about machine learning in this article.
- **Deep learning** is a subset of machine learning in which multi-layered neural networks learn from vast amounts of data.

Now that we have a basic understanding of the difference between AI, Machine Learning and Deep Learning - we can now move further to understand what Edge AI or AI on the Edge means and what it means for us as developers or AI Enthusiasts.

## Now, What Is AI at the Edge?

The edge means local (or near local) processing, as opposed to just anywhere in the cloud. This can be an actual local device like a smart refrigerator, or servers located as close as possible to the source (i.e. servers located in a nearby area instead of on the other side of the world).

The edge can be used where low latency is necessary, or where the network itself may not always be available. The use of it can come from a desire for real-time decision-making in certain applications.

Many applications with the cloud get data locally, send the data to the cloud, process it, and send it back. The edge means there’s no need to send to the cloud; it can often be more secure (depending on edge device security) and have less impact on a network. Edge AI algorithms can still be trained in the cloud, but get run at the edge.

Depending on the AI application and device category, there are several hardware options for performing AI edge processing. The options include central processing units (CPUs), GPUs, application-specific integrated circuits (ASICs), field-programmable gate arrays (FPGA) and system-on-a-chip (SoC) accelerators.

One example is [*TensorFlow Lite*](https://www.tensorflow.org/lite/) which allows machine learning models to run on microcontrollers and other devices with only kilobytes of memory. Micro-controllers are very low-cost, low-power computational devices.

Some examples of why Edge AI is important includes:

- Network communication can be expensive (bandwidth, power consumption, etc.) and sometimes impossible (think remote locations or during natural disasters).
- Real-time processing is necessary for applications, like self-driving cars, that can't handle latency in making important decisions.
- Edge applications could be using personal data (like health data) that could be sensitive if sent to the cloud.
- Optimization software, specially made for specific hardware, can help achieve great efficiency with edge AI models.

## Leveraging Pre-trained Models

The OpenVINO™ Toolkit's name comes from "**Open** **V**isual **I**nferencing and Neural **N**etwork **O**ptimization". It is largely focused around optimizing neural network inference and is open source.

It is developed by Intel® and helps support fast inference across Intel® CPUs, GPUs, FPGAs and Neural Compute Stick with a common API. OpenVINO™ can take models built with multiple different frameworks, like TensorFlow or Caffe, and use its *Model Optimizer* to optimize for inference. This optimized model can then be used with the *[Inference Engine](https://docs.openvinotoolkit.org/latest/_docs_IE_DG_Introduction.html#IE)*, which helps speed inference on the related hardware. The inference is a relatively lower compute-intensive task than training, where latency is of greater importance for providing real-time results on a model. It also has a wide variety of Pre-Trained Models already put through *Model Optimizer*.

By optimizing for model speed and size, OpenVINO™ enables running at the edge.
**Note:** This does not mean an increase in inference accuracy - this needs to be done in training beforehand. The smaller, quicker models OpenVINO™ generates, along with the hardware optimizations it provides, are great for lower resource applications. For example, an IoT device does not have the benefit of multiple GPUs and unlimited memory space to run its apps.

In general, pre-trained models refer to machine learning models where training has already occurred (Refer to [Building and training the classifier model]({{ "/blog/2020/01/06/My-Experience-And-What-I-Learned-From-Udacity-AI-Programming-With-Python-Nano-Degree-Part-2.html#building-and-training-the-classifier" | absolute_url }})), and often have high, or even cutting-edge accuracy. Using pre-trained models avoids the need for large-scale data collection and long, costly training. Given knowledge of how to preprocess the inputs and handle the outputs of the network, you can plug these directly into your app.

In OpenVINO™, Pre-Trained Models refer specifically to the [Model Zoo](https://github.com/opencv/open_model_zoo), in which the Free Model Set contains pre-trained models already converted using the Model Optimizer. These models can be used directly with the *[Inference Engine](https://docs.openvinotoolkit.org/latest/_docs_IE_DG_Introduction.html#IE)*.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/workflow-openvino.png" | absolute_url }})
{: refdef}

The image above illustrates a typical workflow for deploying a trained deep learning model, the deployment processes which assumes that you have a network model that has already been trained using one of the supported frameworks (Caffe*, TensorFlow*, MXNet*, Kaldi*, ONNX*).

The steps are as follows:
- [Configure the Model Optimizer](https://docs.openvinotoolkit.org/latest/_docs_MO_DG_prepare_model_Config_Model_Optimizer.html) for the specific framework (used to train your model).
- Run [Model Optimizer](https://docs.openvinotoolkit.org/latest/_docs_IE_DG_Introduction.html#MO) to produce an optimized [Intermediate Representation (IR)](https://docs.openvinotoolkit.org/latest/_docs_MO_DG_IR_and_opsets.html) of the model based on the trained network topology, weights and biases values, and other optional parameters.
    - Intermediate representation describes a deep learning model which plays an important role in connecting the OpenVINO™ toolkit components. The IR is a pair of files:
        - `.xml`: an XML file that describes the network topology.
        - `.bin`: a binary file containing the weights and biases binary data.
- Test the model in the IR format using the [Inference Engine](https://docs.openvinotoolkit.org/latest/_docs_IE_DG_Introduction.html#IE) in the target environment with provided [Inference Engine](https://docs.openvinotoolkit.org/latest/_docs_IE_DG_Introduction.html#IE) sample applications.
- Integrate [Inference Engine](https://docs.openvinotoolkit.org/latest/_docs_IE_DG_Introduction.html#IE) in your application to deploy the model in the target environment.

### Some Applications of AI deployed on the Edge

AI provides a lot of visual and audio intelligence and offers new and useful applications. Includes some examples:

- Security and home camera:
    Smart detection for when important activities are happening and not requiring 24/7 video streaming.

    -   A great example of this application would be one of the projects I did after lesson 1, which is a **Person Counter app** as shown in the image below.
{:refdef: style="text-align: center;"}
![video](https://user-images.githubusercontent.com/7910856/82992565-9d22c580-9fff-11ea-90cf-9fe9d02517a0.gif)
{: refdef}
- A virtual assistant (smart speaker, phone, etc.): Customisation for natural,
emotional and visual interactions.
- Industrial IoT: Automating the factory of the future will require lots of AI, from visual inspection for defects and intricate robotic control for assembly.
- Drones/robots: Self-navigation in an unknown environment as well as coordination with other drones/robots, think [SLAM](https://en.wikipedia.org/wiki/Simultaneous_localization_and_mapping) on steroids

As we step into an ever-increasingly linked global world, knowledge ultimately is on the verge. The powerful combination of AI and IoT opens up new perspectives for organizations to truly feel and respond to events and opportunities around them in real-time.

# Conclusion

Intel® Distribution of OpenVINO™ toolkit is an extremely useful framework where we can optimize models and execute computer vision using deep learning on edge systems. This enables us to deploy such systems at edge level where the computational resource is scarce.

Previously, powerful AI applications required large, expensive data centre-class systems to operate. But edge computing devices can reside anywhere. AI at the edge offers endless opportunities that can help society in ways never before imagined.

Edge-based inferencing will form the basis for the Internet of Things and People for all AI applications and the majority
of new IoT application projects will construct smarts AI-driven for deployment on edge devices for various sensors in the local field.

Thanks for reading through this blog post. Any suggestions for further improving this would be cheerfully acknowledged. Spare a few minutes and listen to this podcast titled: [Edge Machine Learning](https://softwareengineeringdaily.com/2020/05/26/edge-machine-learning-with-zach-shelby/) by @zach_shelby on the future of AI and Machine Learning at the Edge.

You can also find most of my notes and exercises on my GitHub profile: [https://github.com/mmphego/Udacity-EdgeAI/](https://github.com/mmphego/Udacity-EdgeAI/)

# Reference
- [Content for Udacity's Intel® Edge AI for IoT Developers nanodegree](https://github.com/mmphego/Udacity-EdgeAI/)
- [OpenVINO™ Toolkit Documentation](https://docs.openvinotoolkit.org/latest/index.html)
- [ How to Get Started as a Developer in AI ](https://software.intel.com/content/www/us/en/develop/articles/how-to-get-started-as-a-developer-in-ai.html)
- [TensorFlow Lite | ML for Mobile and Edge Devices](https://www.tensorflow.org/lite/)
- [Edge Machine Learning with Zach Shelby](https://softwareengineeringdaily.com/2020/05/26/edge-machine-learning-with-zach-shelby/)
- [Artificial Intelligence (AI) Solutions on Edge Devices](https://medium.com/@mehulved1503/artificial-intelligence-ai-solutions-on-edge-devices-1cc08d411a7c)
