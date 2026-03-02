#!/bin/bash
set -e
# Only install if Gemfile changed since image was built
if ! bundle check > /dev/null 2>&1; then
  echo "Gemfile changed — installing missing gems..."
  bundle install --jobs 4 --retry 3
fi
exec "$@"
