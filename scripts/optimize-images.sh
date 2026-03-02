#!/usr/bin/env bash
# Optimize images in the assets directory
# Requires: brew install jpegoptim optipng webp
set -euo pipefail

ASSETS_DIR="${1:-assets}"
MAX_WIDTH=1200
QUALITY=85

if ! command -v jpegoptim &>/dev/null || ! command -v optipng &>/dev/null; then
  echo "Missing dependencies. Install with: brew install jpegoptim optipng webp"
  exit 1
fi

echo "Optimizing images in ${ASSETS_DIR}..."

# Optimize JPEGs
find "$ASSETS_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) -print0 | while IFS= read -r -d '' file; do
  echo "  JPEG: $file"
  jpegoptim --max="$QUALITY" --strip-all --quiet "$file"
done

# Optimize PNGs
find "$ASSETS_DIR" -type f -iname "*.png" -print0 | while IFS= read -r -d '' file; do
  echo "  PNG: $file"
  optipng -quiet -o2 "$file"
done

echo "Done."
