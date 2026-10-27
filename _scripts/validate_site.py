"""Validate generated HTML and local references, never commented-out source."""
import argparse
import json
import sys
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from zoneinfo import ZoneInfo

SITE_URL = 'https://blog.mphomphego.co.za'

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.json_blocks = []
        self.reading_json = False
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.reading_json = True
            self.json_blocks.append('')
    def handle_endtag(self, tag):
        if tag == 'script': self.reading_json = False
    def handle_data(self, data):
        if self.reading_json: self.json_blocks[-1] += data

def validate(root):
    errors = []
    parsed = {}
    def issue(page, message): errors.append(f'{page}: {message}')
    for path in sorted(root.rglob('*.html')):
        rel = path.relative_to(root).as_posix()
        parsed[rel] = Page(path.read_text(errors='replace'))
    for rel, page in parsed.items():
        is_themed = any(tag == 'main' and attrs.get('id') == 'main-content' for tag, attrs in page.tags)
        if is_themed:
            for name, count in (
                ('title', sum(t == 'title' for t, a in page.tags)),
                ('description', sum(t == 'meta' and a.get('name') == 'description' for t, a in page.tags)),
                ('canonical', sum(t == 'link' and a.get('rel') == 'canonical' for t, a in page.tags))):
                if count != 1: issue(rel, f'expected one {name}, found {count}')
            ads = sum(t == 'script' and 'adsbygoogle.js' in a.get('src', '') for t, a in page.tags)
            if ads > 1: issue(rel, 'duplicate advertising loader')
        for block in page.json_blocks:
            try: json.loads(block)
            except ValueError as error: issue(rel, f'invalid JSON-LD: {error}')
        for tag, attrs in page.tags:
            urls = [attrs[k] for k in ('href', 'src', 'poster', 'data-full-src') if attrs.get(k)]
            if attrs.get('srcset'):
                urls += [part.strip().split()[0] for part in attrs['srcset'].split(',') if part.strip()]
            for url in urls:
                if url.startswith(('mailto:', 'tel:', 'javascript:', 'data:')): continue
                resolved = urlsplit(urljoin(SITE_URL + '/' + rel, url))
                if resolved.netloc != urlsplit(SITE_URL).netloc: continue
                target = unquote(resolved.path).lstrip('/') or 'index.html'
                candidates = [target, target.rstrip('/') + '/index.html', target.rstrip('/') + '.html']
                found = next((candidate for candidate in candidates if (root / candidate).is_file()), None)
                if not found:
                    issue(rel, f'missing local resource: {resolved.path}')
                elif resolved.fragment and found in parsed:
                    fragment = unquote(resolved.fragment)
                    ids = {a.get('id') for t, a in parsed[found].tags} | {a.get('name') for t, a in parsed[found].tags if t == 'a'}
                    if fragment not in ids:
                        issue(rel, f'missing fragment: {resolved.path}#{fragment}')
    try:
        index = json.loads((root / 'search.json').read_text())
        today = datetime.now(ZoneInfo('Africa/Johannesburg')).date().isoformat()
        for post in index:
            if not isinstance(post.get('content'), str): issue('search.json', 'missing article text')
            if post['date'] > today: issue('search.json', f'future post published: {post["url"]}')
    except (ValueError, OSError) as error: issue('search.json', str(error))
    return sorted(set(errors))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('directory', nargs='?', default='_site')
    args = parser.parse_args()
    failures = validate(Path(args.directory))
    for error in failures: print(error, file=sys.stderr)
    print(f'Generated-site checks: {len(failures)} errors')
    return bool(failures)

if __name__ == '__main__': sys.exit(main())
