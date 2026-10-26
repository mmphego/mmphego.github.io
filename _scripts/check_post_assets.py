"""Fail if a post links to an /assets/ file that does not exist on disk."""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LINK = re.compile(r'\{\{\s*"/assets/([^"]+)"\s*\|\s*relative_url\s*\}\}')


def missing_assets() -> list[str]:
    missing = []
    for post in sorted((ROOT / "_posts").glob("*.md")):
        for line_no, line in enumerate(post.read_text().splitlines(), start=1):
            for match in LINK.finditer(line):
                if not (ROOT / "assets" / match.group(1)).is_file():
                    missing.append(f"{post.relative_to(ROOT)}:{line_no}: /assets/{match.group(1)}")
    return missing


def main() -> int:
    missing = missing_assets()
    for entry in missing:
        print(f"missing asset: {entry}", file=sys.stderr)
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
