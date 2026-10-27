"""Create content-addressed responsive WebP assets; keep originals untouched."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'assets' / 'responsive'
WIDTHS = (400, 800, 1200)


def build():
    OUTPUT.mkdir(exist_ok=True)
    manifest = {}
    for directory in ('assets', 'img'):
        for path in sorted((ROOT / directory).rglob('*')):
            if not path.is_file() or OUTPUT in path.parents or path.suffix.lower() not in ('.png', '.jpg', '.jpeg', '.webp'):
                continue
            try:
                with Image.open(path) as original:
                    if getattr(original, 'is_animated', False):
                        continue
                    im = ImageOps.exif_transpose(original).convert('RGBA' if 'A' in original.getbands() else 'RGB')
                    key = '/' + path.relative_to(ROOT).as_posix()
                    digest = hashlib.sha256(path.read_bytes() + b'webp-v1-q82').hexdigest()[:20]
                    sizes = sorted(set(min(w, im.width) for w in WIDTHS))
                    variants = []
                    for width in sizes:
                        target = OUTPUT / f'{digest}-{width}.webp'
                        if not target.exists():
                            resized = im.resize((width, max(1, round(im.height * width / im.width))), Image.Resampling.LANCZOS)
                            resized.save(target, 'WEBP', quality=82, method=6)
                        variants.append({'url': '/' + target.relative_to(ROOT).as_posix(), 'width': width})
                    manifest[key] = {'width': im.width, 'height': im.height, 'variants': variants}
            except (OSError, ValueError) as exc:
                raise RuntimeError(f'Cannot process {path}: {exc}') from exc
    (ROOT / '_data' / 'responsive_images.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Prepared responsive images for {len(manifest)} originals')


if __name__ == '__main__':
    build()
