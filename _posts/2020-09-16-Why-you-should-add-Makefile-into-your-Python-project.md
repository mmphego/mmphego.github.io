---
layout: post
title: "Why You Should Add Makefile Into Your Python Project"
date: 2020-09-16 11:03:06.000000000 +02:00
tags:
- Python
- Makefile
- Tips/Tricks
---
# Why You Should Add Makefile Into Your Python Project.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2020-09-16-Why-you-should-add-Makefile-into-your-Python-project.png" | absolute_url }})
{: refdef}

5 Min Read

-----------------------------------------------------------------------------------------

# The Story

There's a quote that goes like, *"I choose a lazy person to do a hard job. Because a lazy person will find an easy way to do it."* by [Bill Gates](https://en.wikipedia.org/wiki/Bill_Gates) and I think when he mentioned lazy people he also included me in the same pool. You could ask yourself, Why am I saying that about myself. The reason is, over time I have found myself doing the same thing over and over again and I'm sure that you also have been caught in that repetitive loop before you might not be aware of it.

When creating and working on a new Python or related project, I would find myself repeating the same things over and over. 
For example:

- Creating a Python virtual environment, install all the packages I would need into it and cleaning up Python byte codes and other artefacts. `virtualenv .venv && source .venv/bin/activate && pip install .`
- Run code linters and formatters as I develop or before pushing to [GitHub](github.com/). `black -l 90 && isort -rc . && flake8 .`
- Running unittests and generating documentation (if any). `pytest -sv . && sphinx-apidoc . -o ./docs -f tests`

All the example I've listed above assumes you know what shell command to execute and when most times this can be cumbersome or tedious to juniors.

Enter [GNU-Make](https://www.gnu.org/software/make/), in this post I will show you how you can leverage the use of `Makefile` for automation, ensuring all the goodies are placed in one place and never need to memorise all the shell commands.

## TL;DR

When building any programming project leveraging the use of `Makefile`'s for tedious work.

# The How
Below is an example of a generic `Makefile` I have been using. I usually remove parts I do not need and then place it in the root of my project:

<script src="https://gist.github.com/mmphego/dc933ba1bf9630fe57e46e0da5ef7820.js"></script>

# The Walk-through

Running the `make` without any targets generates a detailed usage doc. I will not go through the `Makefile` as it is well documented and self-explanatory.

```bash
$ make
python3 -c "$PRINT_HELP_PYSCRIPT" <  Makefile
Please use `make <target>` where <target> is one of

build-image          Build docker image from local Dockerfile.
build-cached-image   Build cached docker image from local Dockerfile.
bootstrap            Installs development packages, hooks and generate docs for development
dist                 Builds source and wheel package
dev                  Install the package in development mode including all dependencies
dev-venv             Install the package in development mode including all dependencies inside a virtualenv (container).
install              Check if package exist, if not install the package
venv                 Create virtualenv environment on local directory.
run-in-docker        Run example in a docker container
clean                Remove all build, test, coverage and Python artefacts
clean-build          Remove build artefacts
clean-docs           Remove docs/_build artefacts, except PDF and singlehtml
clean-pyc            Remove Python file artefacts
clean-test           Remove test and coverage artefacts
clean-docker         Remove docker image
lint                 Check style with `flake8` and `mypy`
checkmake            Check Makefile style with `checkmake`
formatter            Format style with `black` and sort imports with `isort`
install-hooks        Install `pre-commit-hooks` on local directory [see: https://pre-commit.com]
pre-commit           Run `pre-commit` on all files
coverage             Check code coverage quickly with pytest
coveralls            Upload coverage report to coveralls.io
test                 Run tests quickly with pytest
view-coverage        View code coverage
changelog            Generate changelog for current repo
complete-docs        Generate a complete Sphinx HTML documentation, including API docs.
docs                 Generate a single Sphinx HTML documentation, with limited API docs.
pdf-doc              Generate a Sphinx PDF documentation, with limited including API docs. (Optional)
```

## Example

In one of my projects [here](https://github.com/mmphego/pyvino_utils/tree/master/examples/face_detection#application-usage) I have an example.

```bash
make run-bootstrap
```

When executed the command above will:

- Build a docker image based on the user and current working directory. eg: `mmphego/face_detection`
- Download the models that OpenVINO uses for inference.
- Adds current hostname/username to the list allowed to make connections to the X/graphical server and lastly,
- Run the application inside the pre-built docker image.

{:refdef: style="text-align: center;"}
![](https://user-images.githubusercontent.com/7910856/93233801-c9637d00-f77b-11ea-97a6-3ad6b5890b26.gif)
{: refdef}

---

Further your learning:
- [Getting started with makefile](https://riptutorial.com/makefile)
- [Makefiles: A tutorial by example](http://mrbook.org/blog/tutorials/make/)
- [GNU Make: Book](https://www.cl.cam.ac.uk/teaching/0910/UnixTools/make.pdf)

If you found this post helpful or unsure about something, leave a comment or reach out @mphomphego

# Reference
This post was inspired by these posts below:

- [Makefiles in python projects](https://krzysztofzuraw.com/blog/2016/makefiles-in-python-projects)
- [Makefile with Python](https://blog.horejsek.com/makefile-with-python/)
