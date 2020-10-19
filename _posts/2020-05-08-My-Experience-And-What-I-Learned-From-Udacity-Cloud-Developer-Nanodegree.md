---
layout: post
title: "My Experience And What I Learned From Udacity Cloud Developer Nanodegree"
date: 2020-05-08 04:20:48.000000000 +02:00
tags:
- Udacity
- Cloud Developer
- AWS
- NodeJS
- Docker
- Kubernetes
- Travis-CI
- Serverless
---
# My Experience And What I Learned From Udacity Cloud Developer Nanodegree.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2020-05-08-My-Experience-And-What-I-Learned-From-Udacity-Cloud-Developer-Nanodegree.png" | absolute_url }})
{: refdef}

10 Min Read

-----------------------------------------------------------------------------------------

# The Story
Since completing a [Udacity AI Programming with Python Nanodegree](https://blog.mphomphego.co.za/blog/2019/12/15/My-Experience-And-What-I-Learned-From-Udacity-AI-Programming-With-Python-Nano-Degree-Part-1.html) funded by [AAL (African App Launchpad Program)](http://www.aal.gov.eg/) 2 months earlier than the course completion date, they (AAL) allowed me to apply for a second grant for which I was grateful for.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/aal_cloud.png" | absolute_url }})
{: refdef}

A few days later, I woke up to some good news that my application was a success. After some thought, I decided to enrol for a [**Udacity Cloud Developer Nano degree**](https://www.udacity.com/course/cloud-developer-nanodegree--nd9990) as it aligned with my interest.
I have always wanted to learn more about [AWS (Amazon Web Services)](https://aws.amazon.com) but always moved it down on my *things to learn priority list* for various reasons, some of them are highlight below.

This offered me a great opportunity for me to familiarise myself with the services offer by AWS (Amazon Web Services), however, one of the major prerequisites for the course was **JavaScipt** (also including HTML and CSS) and as someone who is a more on the back-end development (Python, etc.), I knew that this would not be easy.

This simply meant that I had to work twice as much, being thrown or throwing myself into the deep-end has always been something I learned to endure and eventually enjoy as Les Brown once said, *"To achieve something you have never achieved before you must become someone you have never been"*. Ok, Ok enough with this motivational talk this is a technical post after all...
{:refdef: style="text-align: center;"}
![post image](https://media.giphy.com/media/LOu8FUhPgpeUAi0wiu/giphy.gif)
{: refdef}

A few weeks ago, I eventually graduated from the [**Udacity Cloud Developer Nano degree**](https://www.udacity.com/course/cloud-developer-nanodegree--nd9990) program. I decided to share my experience and what I learned in the past 4 months (Jan - Apr 2020) in this post.

## TL;DR

As part of the Nanodegree program, I needed to come up with a project using the skills I learned and I decided to build a serverless-based diary before I could graduate.

For my capstone project, I decided to create a simple daily diary based serverless application consisting of a [React](https://reactjs.org/) front-end and Node.js/TypeScript/Serverless backend with login authentication using [Auth0](auth0.com/), and that could be deployed to AWS using the [Serverless Framework](https://www.serverless.com/). It uses [DynamoDB](https://aws.amazon.com/dynamodb/) database, an S3 bucket for storing attachments and connects to the application via a [Lambda](https://docs.aws.amazon.com/lambda/index.html) based API.

A link to the Github project repo: [https://github.com/mmphego/udacity-cloud-developer-capstone-project/](https://github.com/mmphego/udacity-cloud-developer-capstone-project/)

All content for Udacity's Cloud Developer Nanodegree: [https://github.com/mmphego/cloud-developer](https://github.com/mmphego/cloud-developer)

Jump off to [Conclusion](#conclusion) section.

# About The Course
The course comprised of a few lessons and a project to complete.
The list below details the lessons/parts that I had to complete before I could graduate:

## Cloud Foundations
This was more of an AWS introduction with emphasis on the fundamentals of cloud computing and being introduced to computing power, security, storage, networking, messaging, and management services in the cloud.

At the end of the lesson, I had to deploy a [static blogging-based website](https://d1dw106crscn7j.cloudfront.net/index.html) on AWS, which was easy enough. All I needed was to click here and there and boom just like that I had a simple static website running on an [S3 (Amazon Simple Storage Service)](https://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html) bucket.

## Full Stack Apps on AWS
The second lesson was more on designing and deploying scalable, extendable, and maintainable full-stack applications using modern cloud architecture. In this case, I was supposed to design and deploy an Instagram like application on AWS can Udagram (Udacity Gram) - I know right!.

### What I learned
In this project, I developed a cloud-based application for uploading, listing, and filtering images. Using [Node.js](https://nodejs.org) which is a popular JavaScript framework and a lot of Googling, copying and pasting from StackOverflow #hides. I implemented a REST API that issued commands using HTTP, stored data in Amazon Web Services (PostgreSQL) Relational Data Service (RDS) and S3, extending the codebase with secure authentication sign-on features, and deployed it to Amazon Web Services Elastic Beanstalk. FYI always ensure that your instances are terminated, continue reading to find out why.

Github Project Link: [https://github.com/mmphego/cloud-developer/tree/master/course-02/project/image-filter-starter-code](https://github.com/mmphego/cloud-developer/tree/master/course-02/project/image-filter-starter-code)

## Monolith to Microservices at Scale
This part of the lesson was all about the best practices on how to develop and deploy microservices, with a focus on different microservice architecture patterns, independent scaling, resiliency, securing microservices, and best practices for monitoring and logging.

I learned the hard way that when you are done with your (EC2 and RDS) instances, you need to ensure that they have been terminated and Elastic Beanstalk will not revive them after you have terminated them. I got the surprise of my life when I woke up to a bill of just over R1000. Contacted support and since I was using the platform for educational purposes they gladly waved it, I dodged a bullet.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/aws_bill.png" | absolute_url }})
{: refdef}

### What I learned
In this project, I had to take my existing project from the previous lesson which was a monolith application (front-end, back-end and REST-API all in separate packages) named *Udagram* and refactor it into a microservice architecture with lean services. I had to build out a CI/CD process using [Travis CI](https://www.travis-ci.com) that automatically builds and deploys [Docker](https://www.docker.com/) images which were a walk in the park as I already had some experience with Docker and Travis-CI.

I had to deploy the docker images to a [Kubernetes](https://kubernetes.io/) clusters. This is one of the sections I struggled with for some time. Eventually, I managed to configure my Kubernetes cluster which helped solve common challenges related to scaling and security.

**I learned the hard way that, sometimes (Yes, Sometimes) spend more time reading the docs instead of Googling your way out.**

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/read_the_docs.jpg" | absolute_url }})
{: refdef}

Github Project Link: [https://github.com/mmphego/cloud-developer-course3-microservices/tree/master/Project_Refactor-Udagram-app-into-Microservices-and-Deploy](https://github.com/mmphego/cloud-developer-course3-microservices/tree/master/Project_Refactor-Udagram-app-into-Microservices-and-Deploy)

## Develop and Deploy a Serverless App
Learn both the theory of using serverless technologies with the practice of developing a complex serverless application and focuses on learning by doing. You will learn advanced serverless features such as implementing WebSockets and stream processing.

### What I learned
In this project, I had to develop a TODO app based on serverless service.
The application allowed creating/removing/updating/fetching TODO items. Each TODO item could optionally have an attachment image and each user only had access to TODO items that he/she has created.

This application consisted of a React-based front-end which allowed user authentication when logging in using [Auth0](auth0.com/) and a backend with individual-based functions. I began by building serverless REST APIs using API Gateway and AWS Lambda, which form part of serverless technologies stack on AWS. I implemented an API to interact with the application, store data in AWS DynamoDB,
S3, and Elasticsearch. The app had to be deployed to Amazon Web Services using a [Serverless Framework](https://serverless.com/).

Github Project Link: [https://github.com/mmphego/cloud-developer/tree/master/course-04/project/c4-final-project-starter-code](https://github.com/mmphego/cloud-developer/tree/master/course-04/project/c4-final-project-starter-code)

# Capstone Project
For the capstone project, I decided to build an application based on the lesson I felt strong with which was Serverless. I decided to build a serverless based Diary which allowed creating/removing/updating/fetching diary entries.

See [TL;DR](#tldr)

Done!
{:refdef: style="text-align: center;"}
![post image]({{ "/assets/cloud_developer_final.png" | absolute_url }})
{: refdef}

# Conclusion
Overall, This was a very good program that gave me an opportunity get out of my comfort zone and enabled me to build actual applications using a wide variety of tools and services offered by AWS (Amazon Web Services). I was able to grasp some concepts that I had ignored or did not know in the past. Throwing myself into the deep-end wrt working with both backend and frontend had its own challenges, however, I endured and ended up completing the program 3 weeks before the deadline, I kind of feel that going into #SALockdown due to COVID-19 enabled me to spend more time on this course else, I wouldn't have made it.

The support system from Udacity was great and it offered a great platform where one can discuss the project and ask questions, and when in doubt offered an opportunity to interact one-on-one with a mentor. The code review process was pretty seamless and they generally got back to me within 24 hours with positive feedback (though sometimes they go over this depending on how busy they are). Below I added a snippet from one of the motivating review responses from one of the reviewers.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/project_review.png" | absolute_url }})
{: refdef}

I did not find a lot of cons but the content of the course is pretty densely packed, especially for [Monolith to Microservices](#monolith-to-microservices-at-scale) lesson, I found myself going through the lessons over and over to grasp the concept they (lessons) could have been a lot more comprehensive. I noticed a lot of students in the discussion forums also having issues with the lesson more especially around Kubernetes, I found myself having to spend hours upon hours going to other resources to supplement their theoretical knowledge. In the end, it forced me to go and look at the documentation and figure things out on my own, not sure if this was intentionally or not but overall that helped me significantly.

In the end, [Udacity](https://www.udacity.com) focuses on getting your hands dirty by that I mean building real-world applications to learn the concepts using the learning by doing concept. I would recommend this program to anyone interested in getting into AWS, cloud computing and a bit of frontend & backend development and levelling up their skill. Hopefully, I will get to use the skills I picked up in this program in future projects.
One of the projects in the back of my mind if using the Serverless framework to develop an Amazon Alexa skill for my home automation project.
