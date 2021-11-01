---
layout: post
title: "Note To Self: How To Delete AWS SageMaker's Endpoint With MonitoringSchedule"
date: 2021-10-29 05:51:50.000000000 +02:00
tags:
- SageMaker
- AWS
- MonitoringML
- Machine Learning
---
# Note To Self: How To Delete AWS SageMaker's Endpoint With MonitoringSchedule

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2021-10-29-Note-To-Self-How-to-delete-AWS-SageMakers-Endpoint-with-MonitoringSchedule.png" | absolute_url }})
{: refdef}

4 Min Read

---

## The Story

I have recently been deep diving into [AWS SageMaker](https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html). I will document my journey on another blog post stick around!

In this short post, I will show you how to delete an endpoint with a monitoring schedule. This is something that for some reason isn't possible with the AWS console; which I find very odd.

If you are here and have no idea what Endpoint with Monitoring Schedule is, you can read this [Amazon SageMaker Model Monitor docs](https://docs.aws.amazon.com/sagemaker/latest/dg/model-monitor.html). If like me, you rather read the shorter version and was lazy to read the AWS docs, here is the short version:
With SageMaker Model Monitor, you can do the following:

- Monitor data quality and model accuracy drift.
- Monitor bias in your model's predictions.
- Monitor drift in feature attribution.

In this post, I will walk you through how to delete an endpoint with a monitoring schedule.

## TL;DR

Delete an endpoint with a monitoring schedule via AWS CLI.

## The Walk-through

If like me, you have tried to delete an endpoint with a monitoring schedule, you will have noticed that it is not possible. See the dreaded and cryptic error message below!
![image](https://user-images.githubusercontent.com/7910856/139628925-ceca5097-079b-4500-b75c-8f63e1a53531.png)

Fear not I have a solution.
We first need to delete the `MonitoringSchedules` configured with the endpoint via the AWS CLI tool.

On SageMaker terminal, run the following command:

1. SageMaker instances do not come pre-installed with [jq](https://stedolan.github.io/jq/), so first things first install it.

  ```bash
  # Ref: https://stedolan.github.io/jq/
  sudo yum install jq
  ```

2. Let's get the region of the endpoint we want to delete.

  ```bash
  $ REGION=$(python -c 'import boto3; print(boto3.Session().region_name)')
  $ echo "REGION: $REGION"

  REGION: us-east-1
  ```

3. Get the list of `MonitoringSchedules` available

  ```bash
  $ aws sagemaker list-monitoring-schedules --region $REGION | jq '.'
  {
    "MonitoringScheduleSummaries": [
      {
        "MonitoringScheduleName": "my-monitoring-schedule",
        "MonitoringScheduleArn": "arn:aws:sagemaker:us-east-1:853052508252:monitoring-schedule/my-monitoring-schedule",
        "CreationTime": 1635378407.474,
        "LastModifiedTime": 1635476955.122,
        "MonitoringScheduleStatus": "Scheduled",
        "EndpointName": "xgboost-2021-10-27-23-31-41-439",
        "MonitoringJobDefinitionName": "data-quality-job-definition-2021-10-27-23-46-47-211",
        "MonitoringType": "DataQuality"
      }
    ]
  }
  ```

4. Get the name of your `MonitoringSchedules` and pass it to delete the monitoring schedule

  ```bash
  MON_NAME=$(aws sagemaker list-monitoring-schedules --region $REGION | jq -r '.MonitoringScheduleSummaries[].MonitoringScheduleName')
  aws sagemaker delete-monitoring-schedule --monitoring-schedule-name $MON_NAME --region $REGION
  ```

5. Now we can delete the Endpoint with no issues, first get the endpoint name you want to delete

  ```bash
  $ aws sagemaker list-endpoints --region $REGION | jq "."
  {
      "Endpoints": [
          {
              "EndpointName": "xgboost-2021-10-27-23-31-41-439",
              "EndpointArn": "arn:aws:sagemaker:us-east-1:853052508252:endpoint/xgboost-2021-10-27-23-31-41-439",
              "CreationTime": 1635377502.453,
              "LastModifiedTime": 1635378004.108,
              "EndpointStatus": "InService"
          }
      ]
  }
  ```

6. With the endpoint name, delete the endpoint

  ```bash
  $ ENDPOINT_NAME=$(aws sagemaker list-endpoints --region $REGION | jq -r ".Endpoints[].EndpointName")
  $ aws sagemaker delete-endpoint --endpoint-name $ENDPOINT_NAME --region $REGION
  $ aws sagemaker list-endpoints --region $REGION
  {
      "Endpoints": []
  }
  ```

**NB: Always, make sure to delete the endpoint and other resources after you are done to avoid cost!**
