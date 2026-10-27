# Reader experience and publishing

## Build and validate

Jekyll 4.4 is used directly rather than the legacy `github-pages` dependency bundle.
The supported Ruby version is in `.ruby-version`. Install the Bundler version in
`Gemfile.lock`, run `bundle install`, then:

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements-images.txt
python _scripts/build_images.py
JEKYLL_ENV=production bundle exec jekyll build
python _scripts/validate_site.py _site
python -m unittest discover -s tests -p 'test_*.py'
npm ci
npx playwright install --with-deps chromium webkit
npm test
```

Image originals remain unchanged. `build_images.py` creates content-addressed
WebP sizes at 400/800/1200px (never upscales), plus a manifest. Both are ignored
by Git and regenerated **before** Jekyll reads the site. Animations and external
images retain their original URLs. Image viewer links open original assets.
Run the same preparation before local previews, or use `make run`.

For an explicit unpublished preview use:

```sh
bundle exec jekyll serve --config _config.yml,_config.local.yml,_config.preview.yml
```

Do not pass `--future` to a production build. Scheduled posts become visible on
the first production rebuild after their date. The publication workflow builds
daily as well as on master pushes; previews never deploy.

## GitHub Pages migration (before merging)

Custom content hooks and generated images require the tested Actions artifact.
In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions**
instead of the legacy branch build. CI uploads and deploys its own `_site` only
from master, after validation succeeds. PRs only build and test. Keep the existing
custom domain and DNS configuration; this change does not alter post URLs.
Do not merge this PR until the Pages source is configured, otherwise the legacy
safe-mode builder will omit the custom hooks and generated images.

## Metadata and verification

Use `description` and `image` in front matter for intentional search/social copy.
For older posts, the build derives a description from the first substantial
paragraph and an image from the first article image. Existing `meta-description`,
`subtitle`, `share-img`, and `last-updated` remain supported.

Optional technical status fields:

```yaml
last_verified: 2026-10-27
# Only set this date after actually re-testing the instructions.
tested_versions:
  - Python 3.12
  - PostgreSQL 16
superseded_by: /blog/YYYY/MM/DD/replacement.html
```

An editing date is not a verification date. No historical post is automatically
marked verified. The replacement link must point to a real page and is checked
by the generated-site validator. Headings automatically get deep links and a
contents list on posts with more than two section headings.

## Third parties

AdSense is initialised once. Disqus and Mailchimp do not load until requested.
Disqus keeps the canonical URL as its thread identity; existing comments are
not intentionally migrated. Blocked integrations show retry feedback. Configure
Mailchimp's connected-site form/campaign in Mailchimp; the button cannot override
provider suppression rules. External video links remain normal links instead of
being silently intercepted and autoplayed.

## Checks and regression coverage

The generated-site validator ignores HTML comments, validates JSON-LD/search
JSON, rejects duplicate metadata and missing local media, links, and fragments.
It does not crawl external sites. Browser checks cover mobile Chromium, mobile
WebKit, desktop Chromium, section navigation, table overflow, dialog keyboard
focus, search refresh, denied copying, deferred comments and mobile navigation.
Real-device swipe/momentum behaviour should still be checked before release.

## Archive repairs in this change

Malformed local links that were intended as external URLs now include HTTPS.
Missing original WordPress illustrations were recovered from their existing
WordPress media URLs. One unavailable decorative Git cover was removed; an
unpublished Jenkins article reference is labelled unavailable rather than
redirected to unrelated content. A legacy VirtualBox post retains its published
URL and redirects the alternative .html route. No technical claims in historical
posts were marked as newly verified.
