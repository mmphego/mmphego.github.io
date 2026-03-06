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

{:refdef: style="text-align: center;"}
[![post image]({{ "${NEW_POST_IMG}" | absolute_url }})](/)
{: refdef}

---

<!-- Opening narrative hook: start with a specific scene (time, place, situation). -->
<!-- Never start with "In this post I will..." — drop the reader into the scene. -->

---

## TL;DR

-
-
-

---

<!-- Technical sections: Gotchas, The How, The Walk-through, etc. -->

---

## Hard-Earned Lessons

<!-- Format per lesson: -->
<!-- **N. Bold Dramatic Title** -->
<!-- 1-2 paragraphs of context/story -->
<!-- **The lesson:** one crisp takeaway sentence -->

---

## Conclusion

<!-- Tie back to the opening story. End on a human insight, not a tech recap. -->

---

## References

- []()
- []()
EOF
    if command -v code >/dev/null 2>&1; then
        code -nw "${NEW_POST}"
    else
        subl "${NEW_POST}"
    fi
    echo "Do not forget to run:"
    echo "  uv run ${BLOG_DIR}/_scripts/generate_wordcloud.py -f \"${NEW_POST}\" -s \"${BG_IMG}\" -c \"${BLOG_DIR}${NEW_POST_IMG}\""
    echo "When you are done editing."
else
    echo "Could not find blog directory."
fi
