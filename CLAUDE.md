# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local Development

- Serve locally: `make run` — builds Docker image and serves at **http://localhost:8085**
- View logs: `make log` | Drop into container: `make shell`
- Optimize images: `make optimize-images`
- Direct (no Docker): `bundle exec jekyll serve` (port 4000)

## Blog Post Workflow

Scaffold a new post:
```bash
bash _scripts/blog_post_template.sh "My Post Title"
```
Or use the `/new-post` skill to have Claude scaffold it with correct front matter and structure.

After writing/editing a post, generate the word cloud cover image:
```bash
uv run _scripts/generate_wordcloud.py \
  -f _posts/YYYY-MM-DD-title.md \
  -s img/new_post_word_cloud.png \
  -c assets/YYYY-MM-DD-title.png
```

## Post Front Matter

```yaml
---
layout: post
title: "Post Title"
date: YYYY-MM-DD HH:MM:SS.000000000 +02:00
tags:
  - tag1
  - tag2
---
```

- Timezone is always `+02:00` (Africa/Johannesburg)
- `comments`, `social-share`, and `toc` default to `true` via `_config.yml` — do not repeat them
- Post structure: centered header image → narrative hook (scene-setting, no "In this post...") → TL;DR → sections → Hard-Earned Lessons → Conclusion → References

## Site-Wide Files — Explain Tradeoffs Before Editing

These affect the entire site. Always surface the blast radius before modifying:

- `_layouts/` — page/post templates
- `_includes/` — shared partials
- `_plugins/` — custom Ruby plugins (5 custom plugins; test locally before pushing)
- `_config.yml` — global Jekyll configuration

## Content Guidelines

- Before writing a full post: propose a TL;DR + section outline for approval first
- Default syntax highlighting language is Python (set in `_config.yml`)
- Mermaid diagrams are supported via `jekyll-mermaid` plugin
- Center images with: `{:refdef: style="text-align: center;"}` / `{: refdef}`

## Git Workflow

- Commit directly to `master` — no feature branches or PRs for blog content
- No pre-commit hooks or signing configured

## CI/CD

- Builds via `jekyll/builder:4.2.2` with `jekyll build --future` (includes future-dated posts)
- On build success: dispatches to `mmphego/mmphego` repo — requires `REPO2_ACCESS_TOKEN` secret
- Gemfile.lock is gitignored; gems are resolved fresh in CI
