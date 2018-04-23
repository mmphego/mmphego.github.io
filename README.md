mmphego.github.io
=================

My personal website. Visit [https://mmphego.github.io/](https://mmphego.github.io/) to view it, cloned from [http://anuditverma.github.io/](https://anuditverma.github.io/)

# How do I clone it locally?

Run `git clone https://github.com/mmphego/mmphego.github.io.git` in the folder where you want to clone it. Then type `jekyll serve` to host the site on a localhost server and refresh it as new changes are made.

# How to run locally?

## Install Ruby and Jekyll
First of all, I had to instal Ruby. Jekyll is a program written in Ruby, so we need to install it in our development station. In my case, I installed on Ubuntu so install the packages needed is as simple as any other package installation.

```
sudo apt install gcc ruby ruby-dev libxml2 libxml2-dev libxslt1-dev zlibc zlib1g-dev
```

After that we can install the Jekyll generator by using the Ruby package manager Rubygems. Also we will install the Ruby bundler tool for future needs.
```
gem install jekyll bundler
```

Run the site
```
bundle exec jekyll serve
```
This start a server in the localhost at the port 4000. Then you can open that [url(http://localhost:4000)] in your browser and see how it looks.