#!/bin/env bash


if [ "$1" == "" ]; then
    echo "Usage: $0 hello world"
    echo "eg: ${FUNCNAME[0]} 'Hello world' "
    echo "This will create a file with (date)-hello-world.md"
    exit
fi

BLOG_DIR=$(dirname "${PWD}/mmphego.github.io")
if [ -d "${BLOG_DIR}" ]; then
    FILENAME=$@
    DATE=$(date +'%Y-%m-%d')
    TIME=$(date +'%H:%M:%S')

    NEW_POST="${BLOG_DIR}/_posts/${DATE}-${FILENAME// /-}.md"
    NEW_POST_IMG="/assets/${DATE}-${FILENAME// /-}.png"
    BG_IMG="${BLOG_DIR}/img/new_post_word_cloud.png"
    # Titlecase the filename
    TITLE=($FILENAME)
    TITLE="${TITLE[@]^}"

    touch "${NEW_POST}"
    tee "${NEW_POST}" <<EOF
---
layout: post
title: "${TITLE}"
date: ${DATE} ${TIME}.000000000 +02:00
tags:
-
-
-
---
# ${TITLE}.

{:refdef: style="text-align: center;"}
![post image]({{ "${NEW_POST_IMG}" | absolute_url }})
{: refdef}

<<TIME TO READ>>

---

# The Story

## TL;DR

## TS;RE

## The How


## The Walk-through


## Reference

- []()
- []()
EOF
    if command -v code >/dev/null 2>&1; then
        code -n "${NEW_POST}"
    else
        subl "${NEW_POST}"
    fi
    echo "Do not forget to Run:"
    set -x
    python "${BLOG_DIR}/_scripts/generate_wordcloud.py" -f "${NEW_POST}" -s "${BG_IMG}"
    cp "${BG_IMG}" "${BLOG_DIR}${NEW_POST_IMG}"
    set +x
    echo "When you are done editing."
else
    echo "Could not find blog directory."
fi



