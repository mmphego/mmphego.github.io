---
name: new-post
description: Scaffold a new Jekyll blog post with correct front matter and template structure. Use when the user says "new post", "create a post about X", "write a post on X", or invokes /new-post [title].
---

Create a new blog post file at `_posts/YYYY-MM-DD-<slug>.md`.

## Steps

1. **Get the title** from `$ARGUMENTS`. If empty, ask: "What is the post title?"
2. **Generate metadata:**
   - `DATE` = today's date (`YYYY-MM-DD`)
   - `TIME` = current time (`HH:MM:SS`)
   - `SLUG` = title lowercased, spaces and special chars replaced with hyphens
   - `TITLE` = title-cased version of the input
   - `IMG_PATH` = `/assets/${DATE}-${SLUG}.png`
   - `FILE` = `_posts/${DATE}-${SLUG}.md`
3. **Ask for 2–4 tags** (comma-separated) if not provided in `$ARGUMENTS`.
4. **Propose the TL;DR + section outline** to the user and wait for approval before writing the file.
5. **Write the file** using the template below.
6. **Print the word cloud reminder** after writing.

## File Template

```markdown
---
layout: post
title: "TITLE"
date: DATE TIME.000000000 +02:00
tags:
  - TAG1
  - TAG2
---

{:refdef: style="text-align: center;"}
[![post image]({{ "IMG_PATH" | absolute_url }})](/)
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
```

## After Writing

Print this reminder verbatim:

```
Post created: FILE

Next steps:
1. Write the content, then generate the word cloud:
   uv run _scripts/generate_wordcloud.py \
     -f FILE \
     -s img/new_post_word_cloud.png \
     -c assets/DATE-SLUG.png

2. Preview: make run  →  http://localhost:8085
3. Push to master when ready.
```
