#!/usr/bin/env bash
# Generate responsive variants; never destructively rewrite originals.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 _scripts/build_images.py
