---
layout: post
title: "Face Blurring Using Scikit-image Cascade Classifiers"
date: 2020-08-19 16:47:12.000000000 +02:00
tags:

---
# Face Blurring Using Scikit-image Cascade Classifiers.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2020-08-19-Face-blurring-using-scikit-image-cascade-classifiers.png" | absolute_url }})
{: refdef}

9 Min Read

-----------------------------------------------------------------------------------------

# The Story
With the mass protesting happen around the world, social media privacy has become very important. One thing a lot of people do not consider when taking photos of protesters is to protect the protesters themselves. 
Photos and videos of these protests have been used for facial recognition or identifying protesters, arresting or mistreating them [*](https://www.independent.co.uk/news/world/americas/sammy-rivera-artist-posting-photos-protests-police-arrest-activist-a9651616.html)

In this post, I will walk you through a simple way of using [scikit-image](https://scikit-image.org/) for image processing to detect faces using [local binary patterns](https://en.wikipedia.org/wiki/Local_binary_patterns) supported [cascade classifiers](https://en.wikipedia.org/wiki/Haar-like_feature) [*almost 20 yrs old tech*] thereafter blur them using a [Gaussian blur filters](https://en.wikipedia.org/wiki/Gaussian_blur). However, I will not dive deep into how face detection works with *cascade classifiers*, I found a good read [here](https://becominghuman.ai/face-detection-using-opencv-with-haar-cascade-classifiers-941dbb25177)

**Note:** False detections are inevitable using `cascade classifiers` and if you want to have a really precise detector, you will have to train it yourself using [OpenCV train cascade utility](https://docs.opencv.org/2.4.13.7/doc/user_guide/ug_traincascade.html) or toggle the knobs [here.](https://github.com/mmphego/privacy_protection/blob/f8a9ec6b07d11000e5931674407c28ef46e485fe/main.py#L81)

Alternatively, use Intel's OpenVINO face-detection models or CNN's pre-trained models.

Some good resources wrt to *haar cascaded classifier* and the *Viola-Jones Algorithm*

- [What’s the Difference Between Haar-Feature Classifiers and Convolutional Neural Networks?](https://towardsdatascience.com/whats-the-difference-between-haar-feature-classifiers-and-convolutional-neural-networks-ce6828343aeb)

{:refdef: style="text-align: center;"}
<p><div>
<iframe width="100%" height="480" src="https://www.youtube.com/embed/uEJ71VlUmMQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div></p>
{: refdef}

{:refdef: style="text-align: center;"}
<p><div>
<iframe width="100%" height="480" src="https://www.youtube.com/embed/F5rysk51txQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div></p>
{: refdef}


## TL;DR
Go ahead and clone the repo: https://github.com/mmphego/privacy_protection

# The How

After completing the course on [Image Processing with Python](https://datacamp.com/courses/image-processing-in-python) from @datacamp, I decided to take the knowledge gained and apply it on a real-life problem that we are facing wrt to the high number of protests happening around us.

[Click Here: Learn Data Science Online for FREE](https://www.datacamp.com/?tap_a=5644-dce66f&tap_s=1152067-edcdb0&utm_medium=affiliate&utm_source=mphomphego)

The course offered a hands-on approach on the subject of image processing using the [scikit-image](https://scikit-image.org/) library, from image restoration, denoising, segmentation and canny edges.

From my previous experience working with image processing libraries, I found that `scikit-image` is well documented and the API is easy-to-use. However, `OpenCV` outperforms it mainly since `OpenCV` API is essentially a C++ API that wraps around Python.

As part of my [#100DaysOfCode](https://twitter.com/search?q=%23100DaysOfCode%20%40mphomphego%20day&src=typed_query) challenge, I did a simple performance comparison between `OpenCV` and `scikit-image`, time-taken to load images and convert an RGB image to grayscale & corner detection.

{:refdef: style="text-align: center;"}
<center>
    <blockquote class="twitter-tweet"><p lang="en" dir="ltr">- Did a simple performance analysis between <a href="https://twitter.com/hashtag/OpenCV?src=hash&amp;ref_src=twsrc%5Etfw">#OpenCV</a> and <a href="https://twitter.com/hashtag/Skimage?src=hash&amp;ref_src=twsrc%5Etfw">#Skimage</a>, time taken to load and convert image grey and corner detection.)<br>- From the results observed <a href="https://twitter.com/hashtag/OpenCV?src=hash&amp;ref_src=twsrc%5Etfw">#OpenCV</a> FTW in terms of performance.<a href="https://twitter.com/hashtag/100DaysOfCode?src=hash&amp;ref_src=twsrc%5Etfw">#100DaysOfCode</a> <a href="https://twitter.com/hashtag/EdgeAI?src=hash&amp;ref_src=twsrc%5Etfw">#EdgeAI</a> <a href="https://twitter.com/hashtag/Python?src=hash&amp;ref_src=twsrc%5Etfw">#Python</a> <a href="https://twitter.com/hashtag/ImageProcessingDatacamp?src=hash&amp;ref_src=twsrc%5Etfw">#ImageProcessingDatacamp</a> <a href="https://t.co/SUm2PJLAaY">pic.twitter.com/SUm2PJLAaY</a></p>&mdash; Mpho Mphego (@MphoMphego) <a href="https://twitter.com/MphoMphego/status/1293304963280576512?ref_src=twsrc%5Etfw">August 11, 2020</a>
    </blockquote> 
    <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 
</center>
{: refdef}

# The Walk-through

The application runs from a [Docker image](https://hub.docker.com/r/mmphego/intel-openvino) that I have baked Intel OpenVINO and dependencies in, alternatively install `scikit-image` and `opencv2` library. 

- `pip install scikit-image opencv-contrib-python opencv-python` or,
- Just run: `docker pull mmphego/intel-openvino`

Not sure what Docker is, [watch this](https://www.youtube.com/watch?v=rOTqprHv1YE)

## Usage
In order to use the application run the following command:
```bash
docker run --rm -ti \
--volume "$PWD":/app \
--env DISPLAY=$DISPLAY \
--volume=$HOME/.Xauthority:/root/.Xauthority \
--volume="/tmp/.X11-unix:/tmp/.X11-unix:rw" \
--device /dev/video0 \
mmphego/intel-openvino \
bash -c "\
    source /opt/intel/openvino/bin/setupvars.sh && \
    python main.py -i blm.jpg
    "
```

Understand Docker extra parameters [here.](https://blog.mphomphego.co.za/blog/2020/06/02/Face-Mask-Detection-using-Intel-OpenVINO-and-OpenCV.html#usage)

Original Image:

{:refdef: style="text-align: center;"}
![](https://raw.githubusercontent.com/mmphego/privacy_protection/master/blm.jpg)
{: refdef}

Blurred Faces (Well sort-off): 

{:refdef: style="text-align: center;"}
![](https://raw.githubusercontent.com/mmphego/privacy_protection/master/Blurred_Faces.jpg)
{: refdef}

## Code Walkthrough

The code contains enough comments for one to understand what is happening under the hood when in doubt leave a comment else Google.


```python
import argparse

import cv2

from matplotlib import pyplot as plt
from skimage import data
from skimage.feature import Cascade
from skimage.filters import gaussian
from skimage.io import imread, imsave


def get_face_rectangle(orig_image, detected_face):
    """
    Extracts the face from the image using the coordinates of the detected image
    """
    # X and Y starting points of the face rectangle
    x, y = detected_face["r"], detected_face["c"]

    # The width and height of the face rectangle
    width, height = (
        detected_face["r"] + detected_face["width"],
        detected_face["c"] + detected_face["height"],
    )

    # Extract the detected face
    face = orig_image[x:width, y:height]
    return face


def merge_blurry_face(original, gaussian_image, detected_face):
    # X and Y starting points of the face rectangle
    x, y = detected_face["r"], detected_face["c"]
    # The width and height of the face rectangle
    width, height = (
        detected_face["r"] + detected_face["width"],
        detected_face["c"] + detected_face["height"],
    )

    original[x:width, y:height] = gaussian_image
    return original


def show_image(image, title="Image", cmap_type="gray"):
    plt.figure(figsize=(12, 10))
    # plt.imshow(image, cmap=cmap_type)
    plt.imshow(image)
    plt.title(title)
    plt.axis("on")
    plt.show()


def show_detected_face_obtain_faces(result, detected, title="Face image"):
    plt.figure()
    plt.imshow(result)
    img_desc = plt.gca()
    plt.set_cmap("gray")
    plt.title(title)
    plt.axis("off")

    for patch in detected:
        img_desc.add_patch(
            patches.Rectangle(
                (patch["c"], patch["r"]),
                patch["width"],
                patch["height"],
                fill=False,
                color="r",
                linewidth=2,
            )
        )

    plt.show()
    rostros = [
        result[d["r"] : d["r"] + d["width"], d["c"] : d["c"] + d["height"]]
        for d in detected
    ]
    return rostros


def face_detections(
    image, scale_factor=1.1, step_ratio=1.3, min_size=(10, 10), max_size=(400, 400)
):
    # Load the trained file from data
    trained_file = data.lbp_frontal_face_cascade_filename()

    # Initialize the detector cascade
    detector = Cascade(trained_file)

    # https://scikit-image.org/docs/stable/auto_examples/applications/plot_face_detection.html#sphx-glr-download-auto-examples-applications-plot-face-detection-py
    # Detect faces with min and max size of searching window
    detected_faces = detector.detect_multi_scale(
        img=image,
        scale_factor=scale_factor,
        step_ratio=step_ratio,
        min_size=min_size,
        max_size=max_size,
    )
    return detected_faces


def blur_faces(image, detected_faces):
    resulting_image = None
    # For each detected face
    for detected_face in detected_faces:
        # Obtain the face rectangle from detected coordinates
        face = get_face_rectangle(image, detected_face)

        # Apply Gaussian filter to extracted face
        # Scikit-image
        # blurred_face = gaussian(face, multichannel=True, sigma=(45,45))

        # OpenCV2
        blurred_face = cv2.GaussianBlur(face, (45, 45), cv2.BORDER_DEFAULT)

        # Merge this blurry face to our final image and show it
        resulting_image = merge_blurry_face(image, blurred_face, detected_face)

    return resulting_image


def arg_parser():
    """Parse command line arguments.

    :return: command-line arguments
    """
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "-i", "--input", required=True, type=str, help="Path to an image.",
    )
    # TODO: Add Cascade.detect_multi_scale params
    return parser.parse_args()


if __name__ == "__main__":
    args = arg_parser()
    image = imread(args.input)
    detected_faces = face_detections(image)
    resulting_image = blur_faces(image, detected_faces)
    imsave("Blurred_Faces.jpg", resulting_image)

```

# Reference
- [*Police arrest artist who stopped posting protest photos to shield activists from law](https://www.independent.co.uk/news/world/americas/sammy-rivera-artist-posting-photos-protests-police-arrest-activist-a9651616.html)
- [What’s the Difference Between Haar-Feature Classifiers and Convolutional Neural Networks?](https://towardsdatascience.com/whats-the-difference-between-haar-feature-classifiers-and-convolutional-neural-networks-ce6828343aeb)
- [Deep Learning Haar Cascade Explained](http://www.willberger.org/cascade-haar-explained/)
- [Haar-like feature](https://en.wikipedia.org/wiki/Haar-like_feature)
- [image-scrubber: a tool for anonymizing photographs taken at protests.](https://github.com/everestpipkin/image-scrubber)
