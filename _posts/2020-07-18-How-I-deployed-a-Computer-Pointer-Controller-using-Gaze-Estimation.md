---
layout: post
title: "How I Deployed A Computer Pointer Controller Using Gaze Estimation"
date: 2020-07-18 00:09:06.000000000 +02:00
tags:
- AI
- Deep Learning
- Docker
- Machine Learning
- OpenVINO
- Python
- Tips/Tricks
---
# How I Deployed A Computer Pointer Controller Using Gaze Estimation.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2020-07-18-How-I-deployed-a-Computer-Pointer-Controller-using-Gaze-Estimation.png" | absolute_url }})
{: refdef}

10 Min Read

-----------------------------------------------------------------------------------------

## Story


[![Alt text](https://user-images.githubusercontent.com/7910856/130939787-22521541-8b99-4749-9df8-7c6c334f299f.png)](https://imp.i115008.net/c/2851051/803076/11298)

Imagine controlling your computer mouse pointer using nothing else other than your eyes and head pose. Well stop imagining it.

In post project, I will walk you through a project I created using the Intel® OpenVINO toolkit utilizing the [Gaze Detection model](https://docs.openvinotoolkit.org/latest/_models_intel_gaze_estimation_adas_0002_description_gaze_estimation_adas_0002.html) to control the mouse pointer of my computer.
I used the Gaze Estimation model to estimate the gaze of the user's eyes and change the mouse pointer position accordingly.
This project demonstrated the ability of running multiple models in the same machine and coordinate the flow of data between those models.

## TL;DR

Checkout the code here: [https://github.com/mmphego/computer-pointer-controller/tree/v1.0](https://github.com/mmphego/computer-pointer-controller/tree/v1.0)

## How It Works


[![Alt text](https://user-images.githubusercontent.com/7910856/130939787-22521541-8b99-4749-9df8-7c6c334f299f.png)](https://imp.i115008.net/c/2851051/803076/11298)

Used the Inference Engine API from Intel's OpenVino ToolKit to build the project.

The gaze estimation model used requires three inputs:

- The head pose
- The left eye image
- The right eye image.

To get these inputs, use the three other OpenVino models model below:

- [Face Detection](https://docs.openvinotoolkit.org/latest/_models_intel_face_detection_adas_binary_0001_description_face_detection_adas_binary_0001.html)

Implementation: [https://github.com/mmphego/computer-pointer-controller/blob/bb5f13c6d2567c0856407db6c35b3fa6345f97c2/src/model.py#L156](https://github.com/mmphego/computer-pointer-controller/blob/bb5f13c6d2567c0856407db6c35b3fa6345f97c2/src/model.py#L156)

{:refdef: style="text-align: center;"}
![face_Detection](https://user-images.githubusercontent.com/7910856/87830444-4a3bf080-c881-11ea-993a-7f76c979449f.gif)
{: refdef}

- [Facial Landmarks Detection](https://docs.openvinotoolkit.org/latest/_models_intel_landmarks_regression_retail_0009_description_landmarks_regression_retail_0009.html).

Implementation: [https://github.com/mmphego/computer-pointer-controller/blob/bb5f13c6d2567c0856407db6c35b3fa6345f97c2/src/model.py#L239](https://github.com/mmphego/computer-pointer-controller/blob/bb5f13c6d2567c0856407db6c35b3fa6345f97c2/src/model.py#L239)

{:refdef: style="text-align: center;"}
![facial_landmarks](https://user-images.githubusercontent.com/7910856/87830446-4c05b400-c881-11ea-90a5-d1b80d984f01.gif)
{: refdef}

- [Head Pose Estimation](https://docs.openvinotoolkit.org/latest/_models_intel_head_pose_estimation_adas_0001_description_head_pose_estimation_adas_0001.html)

Implementation: [https://github.com/mmphego/computer-pointer-controller/blob/bb5f13c6d2567c0856407db6c35b3fa6345f97c2/src/model.py#L305](https://github.com/mmphego/computer-pointer-controller/blob/bb5f13c6d2567c0856407db6c35b3fa6345f97c2/src/model.py#L305)
{:refdef: style="text-align: center;"}
![head_pose](https://user-images.githubusercontent.com/7910856/87830450-4f00a480-c881-11ea-9d0b-4b43316456a2.gif)
{: refdef}

- [Gaze Estimation](https://docs.openvinotoolkit.org/latest/_models_intel_gaze_estimation_adas_0002_description_gaze_estimation_adas_0002.html)

Implementation: [https://github.com/mmphego/computer-pointer-controller/blob/bb5f13c6d2567c0856407db6c35b3fa6345f97c2/src/model.py#L422](https://github.com/mmphego/computer-pointer-controller/blob/bb5f13c6d2567c0856407db6c35b3fa6345f97c2/src/model.py#L422)
{:refdef: style="text-align: center;"}
![all](https://user-images.githubusercontent.com/7910856/87830436-47d99680-c881-11ea-8c22-6a0a7e17c78d.gif)
{: refdef}

### Project Pipeline
Coordinate the flow of data from the input, and then amongst the different models and finally to the mouse controller. The flow of data looks like this:

{:refdef: style="text-align: center;"}
![image](https://user-images.githubusercontent.com/7910856/87787550-1db1b580-c83c-11ea-9f21-5048c803bf5c.png)
{: refdef}

## Demo
{:refdef: style="text-align: center;"}
![vide-demo](https://user-images.githubusercontent.com/7910856/87830451-50ca6800-c881-11ea-87cf-3943795a76e8.gif)
{: refdef}

## Project Set Up and Installation

### Directory Structure
```bash
tree && du -sh
.
├── LICENSE
├── main.py
├── models
│   ├── face-detection-adas-binary-0001.bin
│   ├── face-detection-adas-binary-0001.xml
│   ├── gaze-estimation-adas-0002.bin
│   ├── gaze-estimation-adas-0002.xml
│   ├── head-pose-estimation-adas-0001.bin
│   ├── head-pose-estimation-adas-0001.xml
│   ├── landmarks-regression-retail-0009.bin
│   └── landmarks-regression-retail-0009.xml
├── README.md
├── requirements.txt
├── resources
└── src
    ├── __init__.py
    ├── input_feeder.py
    ├── model.py
    └── mouse_controller.py

3 directories, 16 files
37M .
```

### Setup and Installation

[![Alt text](https://user-images.githubusercontent.com/7910856/130939787-22521541-8b99-4749-9df8-7c6c334f299f.png)](https://imp.i115008.net/c/2851051/803076/11298)
There are two (2) ways of running the project.
1. Download and install [Intel OpenVINO Toolkit](https://software.intel.com/content/www/us/en/develop/tools/openvino-toolkit.html) and install.
    - After you've cloned the repo, you need to install the dependencies using this command:
      `pip3 install -r requirements.txt`

2. Run the project in the [Docker image](https://hub.docker.com/r/mmphego/intel-openvino) that I have baked Intel OpenVINO and dependencies in.
  - Run: `docker pull mmphego/intel-openvino`

Not sure what Docker is, [watch this](https://www.youtube.com/watch?v=rOTqprHv1YE)

For this project I used the latter method.

#### Models Used


[![Alt text](https://user-images.githubusercontent.com/7910856/130939787-22521541-8b99-4749-9df8-7c6c334f299f.png)](https://imp.i115008.net/c/2851051/803076/11298)

I have already downloaded the Models, which are located in `./models/`.
Should you wish to download your own models run:

```bash
MODEL_NAME=<<name of model to download>>
docker run --rm -ti \
--volume "$PWD":/app \
mmphego/intel-openvino \
bash -c "\
  /opt/intel/openvino/deployment_tools/open_model_zoo/tools/downloader/downloader.py \
  --name $MODEL_NAME"
```

Models used in this project:
- [Face Detection Model](https://docs.openvinotoolkit.org/latest/_models_intel_face_detection_adas_binary_0001_description_face_detection_adas_binary_0001.html)
- [Facial Landmarks Detection Model](https://docs.openvinotoolkit.org/latest/_models_intel_landmarks_regression_retail_0009_description_landmarks_regression_retail_0009.html)
- [Head Pose Estimation Model](https://docs.openvinotoolkit.org/latest/_models_intel_head_pose_estimation_adas_0001_description_head_pose_estimation_adas_0001.html)
- [Gaze Estimation Model](https://docs.openvinotoolkit.org/latest/_models_intel_gaze_estimation_adas_0002_description_gaze_estimation_adas_0002.html)

## Application Usage

[![Alt text](https://user-images.githubusercontent.com/7910856/130939787-22521541-8b99-4749-9df8-7c6c334f299f.png)](https://imp.i115008.net/c/2851051/803076/11298)
```bash

$ python main.py -h

usage: main.py [-h] -fm FACE_MODEL -hp HEAD_POSE_MODEL -fl
               FACIAL_LANDMARKS_MODEL -gm GAZE_MODEL [-d DEVICE]
               [-pt PROB_THRESHOLD] -i INPUT [--out] [-mp [{high,low,medium}]]
               [-ms [{fast,slow,medium}]] [--enable-mouse] [--show-bbox]
               [--debug] [--stats]

optional arguments:
  -h, --help            show this help message and exit
  -fm FACE_MODEL, --face-model FACE_MODEL
                        Path to an xml file with a trained model.
  -hp HEAD_POSE_MODEL, --head-pose-model HEAD_POSE_MODEL
                        Path to an IR model representative for head-pose-model
  -fl FACIAL_LANDMARKS_MODEL, --facial-landmarks-model FACIAL_LANDMARKS_MODEL
                        Path to an IR model representative for facial-
                        landmarks-model
  -gm GAZE_MODEL, --gaze-model GAZE_MODEL
                        Path to an IR model representative for gaze-model
  -d DEVICE, --device DEVICE
                        Specify the target device to infer on: CPU, GPU, FPGA
                        or MYRIAD is acceptable. Sample will look for a
                        suitable plugin for device specified (Default: CPU)
  -pt PROB_THRESHOLD, --prob_threshold PROB_THRESHOLD
                        Probability threshold for detections
                        filtering(Default: 0.8)
  -i INPUT, --input INPUT
                        Path to image, video file or 'cam' for Webcam.
  --out                 Write video to file.
  -mp [{high,low,medium}], --mouse-precision [{high,low,medium}]
                        The precision for mouse movement (how much the mouse
                        moves). [Default: low]
  -ms [{fast,slow,medium}], --mouse-speed [{fast,slow,medium}]
                        The speed (how fast it moves) by changing [Default:
                        fast]
  --enable-mouse        Enable Mouse Movement
  --show-bbox           Show bounding box and stats on screen [debugging].
  --debug               Show output on screen [debugging].
  --stats               Verbose OpenVINO layer performance stats [debugging].
```


### Usage Example
In order to run the application run the following code (Assuming you have docker installed.):

```shell
xhost +;
docker run --rm -ti \
--volume "$PWD":/app \
--env DISPLAY=$DISPLAY \
--volume=$HOME/.Xauthority:/root/.Xauthority \
--volume="/tmp/.X11-unix:/tmp/.X11-unix:rw" \
--device /dev/video0 \
mmphego/intel-openvino \
bash -c "\
    source /opt/intel/openvino/bin/setupvars.sh && \
    python main.py \
        --face-model models/face-detection-adas-binary-0001 \
        --head-pose-model models/head-pose-estimation-adas-0001 \
        --facial-landmarks-model models/landmarks-regression-retail-0009 \
        --gaze-model models/gaze-estimation-adas-0002 \
        --input resources/demo.mp4 \
        --debug \
        --show-bbox \
        --enable-mouse \
        --mouse-precision low \
        --mouse-speed fast"
```

### Packaging the Application
We can use the [Deployment Manager](https://docs.openvinotoolkit.org/latest/_docs_install_guides_deployment_manager_tool.html) present in OpenVINO to create a runtime package from our application. These packages can be easily sent to other hardware devices to be deployed.

To deploy the application to various devices using the Deployment Manager run the steps below.

Note: Choose from the devices listed below.

```bash
DEVICE='cpu' # or gpu, vpu, gna, hddl
docker run --rm -ti \
--volume "$PWD":/app \
mmphego/intel-openvino bash -c "\
  python /opt/intel/openvino/deployment_tools/tools/deployment_manager/deployment_manager.py \
  --targets cpu \
  --user_data /app \
  --output_dir . \
  --archive_name computer_pointer_controller_${DEVICE}"

```


[![Alt text](https://user-images.githubusercontent.com/7910856/130939787-22521541-8b99-4749-9df8-7c6c334f299f.png)](https://imp.i115008.net/c/2851051/803076/11298)
## OpenVino API for Layer Analysis
Queries performance measures per layer to get feedback of what is the most time consuming layer: [Read docs.](https://docs.openvinotoolkit.org/latest/ie_python_api/classie__api_1_1InferRequest.html#a2194bc8c557868822bbfd260e8ef1a08)

```shell
xhost +;
docker run --rm -ti \
--volume "$PWD":/app \
--env DISPLAY=$DISPLAY \
--volume=$HOME/.Xauthority:/root/.Xauthority \
--volume="/tmp/.X11-unix:/tmp/.X11-unix:rw" \
--device /dev/video0 \
mmphego/intel-openvino \
bash -c "\
    source /opt/intel/openvino/bin/setupvars.sh && \
    python main.py \
        --face-model models/face-detection-adas-binary-0001 \
        --head-pose-model models/head-pose-estimation-adas-0001 \
        --facial-landmarks-model models/landmarks-regression-retail-0009 \
        --gaze-model models/gaze-estimation-adas-0002 \
        --input resources/demo.mp4 \
        --stat"
```

## Edge Cases
- Multiple People Scenario: If we encounter multiple people in the video frame, it will always use and give results one face even though multiple people detected,
- No Face Detection: it will skip the frame and inform the user

## Future Improvement
- [Intel® DevCloud](https://devcloud.intel.com/edge/get_started/guide/): Benchmark the application on various devices to ensure optimum performance.
- [Intel® VTune™ Profiler](https://software.intel.com/content/www/us/en/develop/tools/vtune-profiler/choose-download.html): Profile my application and locate any bottlenecks.
- Gaze estimations: We could revisit the logic of determining and calculating the coordinates as it is a bit flaky.
- Lighting condition: We might use HSV based pre-processing steps to minimize error due to different lighting conditions.


[![Alt text](https://user-images.githubusercontent.com/7910856/130939787-22521541-8b99-4749-9df8-7c6c334f299f.png)](https://imp.i115008.net/c/2851051/803076/11298)
## Reference
- [OpenCV Face Recognition](https://www.pyimagesearch.com/2018/09/24/opencv-face-recognition/)
- [Tracking your eyes with Python](https://medium.com/@stepanfilonov/tracking-your-eyes-with-python-3952e66194a6)
- [Real-time eye tracking using OpenCV and Dlib](https://towardsdatascience.com/real-time-eye-tracking-using-opencv-and-dlib-b504ca724ac6)
- [Deep Head Pose](https://github.com/natanielruiz/deep-head-pose/blob/master/code/utils.py#L86+L117)
