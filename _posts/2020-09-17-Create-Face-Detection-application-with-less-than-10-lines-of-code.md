---
layout: post
title: "Create A Face Detection Application With Less Than 10 Lines Of Code"
date: 2020-09-17 22:48:33.000000000 +02:00
tags:
- AI
- Deep Learning
- Machine Learning
- OpenVINO
- Python
- Tips/Tricks
---
# Create A Face Detection Application With Less Than 10 Lines Of Code.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2020-09-17-Create-Face-Detection-application-with-less-than-10-lines-of-code.png" | absolute_url }})
{: refdef}

7 Min Read

-----------------------------------------------------------------------------------------

# The Story

[![Alt text](https://s3.amazonaws.com/assets.datacamp.com/email/other/728x90Promo.png)](https://www.datacamp.com/?tap_a=5644-dce66f&tap_s=1152067-edcdb0&utm_medium=affiliate&utm_source=mphomphego)

In the past few months, I've been getting my hands dirty with the [Intel® distribution of OpenVINO™ Toolkit](https://software.intel.com/content/www/us/en/develop/tools/openvino-toolkit.html) and made a few projects along the way just to illustrate how powerful this toolkit is.

In this post, I will introduce a library I have been working on in the past few weeks (the project is ongoing). This library simplifies OpenVINO's model's implementation with Python by doing more of the heavy lifting for you, giving you more time to have fun i.e. less is more!!!

I will also create a simple face detection application in under 10 lines, jump over to [the How](#the-how) for more.

[![Alt text](https://s3.amazonaws.com/assets.datacamp.com/email/other/728x90Promo.png)](https://www.datacamp.com/?tap_a=5644-dce66f&tap_s=1152067-edcdb0&utm_medium=affiliate&utm_source=mphomphego)

## TL;DR

Link to `PyVINO-Utils` library: [https://github.com/mmphego/pyvino_utils](https://github.com/mmphego/pyvino_utils)

Star it, fork it and make a PR

# The How
The library does the heavy lifting by implementing an [abstract base class](https://github.com/mmphego/pyvino_utils/blob/master/pyvino_utils/models/openvino_base/base_model.py) which handles the loading of models, processing the input and inference (prediction). 
[Detection](https://github.com/mmphego/pyvino_utils/blob/master/pyvino_utils/models/detection/face_detection.py), recognition and pose estimates models inherit the base class implementation while implementing functions for post-processing the inference output and drawing of bounding boxes around a region of interest(ROI).

This cuts down application development time by a fraction, ensuring that the developer focuses more on implementing user specifications. 

*I sound more like a salesman than a tinkerer now...*

# The Walk-through

## Code walk-through
The code below implements a simple face detection with runs of an Intel i7 CPU and can be easily be ported to a Raspberry Pi with a USB-based NCS2 (Intel® Neural Compute Stick 2). The applications are endless...

{% highlight python linenos %}
import argparse

from pyvino_utils import InputFeeder
from pyvino_utils.models.detection import face_detection
{% endhighlight %}

We start by importing our necessary packages on **Lines 1-4**. We need `argparse` to handle command-line arguments, `InputFeeder` and `face_detection` from the `pyvino_utils` library handles the input (image, video or cam stream) and the [face detection](https://github.com/mmphego/pyvino_utils/blob/master/pyvino_utils/models/detection/face_detection.py) module.

{% highlight python linenos %}
def arg_parser():
  parser = argparse.ArgumentParser(
     description="A simple OpenVINO based Face Detection running on CPU."
   )
  parser.add_argument("-i", "--input", help="Video or image input.", required=True)
  parser.add_argument(
    "-m", "--model", help="Face detection model name (no extension).", required=True
   )
  parser.add_argument(
    "-b", "--show-bbox", action="store_true", help="Show bounding box."
   )
  return parser.parse_args()
{% endhighlight %}

The function `arg_parser`, handles the parsing of our two (required) command-line arguments and an optional `show-bbox` argument which enables the output to be displayed onto our screen. 
`input` argument takes in either an image or video path and the WebCam feed. Our second required argument will be the name and path (excluding the extension) of were our OpenVINO `model` is located. Since we have our packages imported and our command-line arguments parsed, we can continue to implement our main function.

{% highlight python linenos %}
def main(args):
   input_feed = InputFeeder(input_feed=args.input)
   face_detector = face_detection.FaceDetection(
     model_name=args.model, input_feed=input_feed
   )

  for frame in input_feed.next_frame(progress=False):
     inference_results = face_detector.predict(frame, show_bbox=args.show_bbox)
    if args.show_bbox:
      input_feed.show(frame)
   input_feed.close()


if __name__ == "__main__":
   args = arg_parser()
  main(args)
{% endhighlight %}

**Line 2**: Handles the `InputFeeder` which is a [class](https://github.com/mmphego/pyvino_utils/blob/master/pyvino_utils/input_handler/input_feeder.py) that mainly handles the input and creates an object `input_feed` which will be used later.

**Line 3-5**: Creates a `face_detector` object which will process the input and inference. We call the [class](https://github.com/mmphego/pyvino_utils/blob/master/pyvino_utils/models/detection/face_detection.py) `face_detection.FaceDetection` which requires a `model_name` as well as the `input_feed` object (mainly to determine the width and height of our image/video/cam input).

**Line 7-8**: Loops over the frame(s) from the `input_feed` and grabs the current frame and passes it into our `face_detector.predict`. This function responsible for running inference and the results are stored into the `inference_results` dictionary. This dictionary contains the processed output (key/value pair) in the form of a list of rectangular bounding box coordinates of the face. If `args.show_bbox` is `True` then the rectangle around the detected face will be drawn.

**Line 9-10**: Checks if the `args.show_bbox` is True and then displays the current `frame` to our screen with a green rectangle around the face (if any).

**Line 11**: Gracefully cleans up and closes any open windows.

**Line 14-16**: The top-level code is an `if` block. `__name__` is a built-in variable which evaluates to the name of the current module. However, `if` a module is being run directly (as in `python main.py`), then `__name__` instead is set to the string `"__main__"`. [1](https://stackoverflow.com/a/419189)

Thus, running the logic below the block, in this case, it will call the `arg_parser` and the results will be stored in `args` thereafter call out the `main` function defined above while passing the `args`.

[![Alt text](https://s3.amazonaws.com/assets.datacamp.com/email/other/728x90Promo.png)](https://www.datacamp.com/?tap_a=5644-dce66f&tap_s=1152067-edcdb0&utm_medium=affiliate&utm_source=mphomphego)


---

Clone the repository or check out the example [face detection application](https://github.com/mmphego/pyvino_utils/tree/master/examples/face_detection)

## Walk-through Tutorial

Watch the complete tutorial and code walk-through.
{:refdef: style="text-align: center;"}
<p><div>
<iframe width="100%" height="480" src="https://www.youtube.com/embed/mOG-6VfB2cI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div></p>
{: refdef}

# Conclusion

[![Alt text](https://s3.amazonaws.com/assets.datacamp.com/email/other/728x90Promo.png)](https://www.datacamp.com/?tap_a=5644-dce66f&tap_s=1152067-edcdb0&utm_medium=affiliate&utm_source=mphomphego)

The example above illustrates how simple it is to create a face detection application in under **10 lines** of code (excluding the `arg_parser` function, assuming that the `model` and `input` are hard-corded.). This is because of the `pyvino_utils` library which does all the heavy lifting for us since we need not create modules/classes to handle/process the input and inference.
 
Future work includes auto-downloading the models from [Open Model Zoo](https://github.com/openvinotoolkit/open_model_zoo) and expanding the library to handle other functions such as instance segmentation and text recognition to name a few.

# Reference

- [Intel® Distribution of OpenVINO™ Toolkit](https://software.intel.com/content/www/us/en/develop/tools/openvino-toolkit.html)
