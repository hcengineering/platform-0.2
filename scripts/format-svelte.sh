#!/usr/bin/env sh

# Look for all chaged files.
FILES=$(git diff --name-only origin/master... "*.svelte" | sed 's/ /\\ /g')

# Check only existing files.
FILES=$(echo $FILES | xargs ls -d 2>/dev/null)
[ -z "$FILES" ] && exit 0

set -e
echo "Fixing with eslint"
echo "$FILES" | xargs yarn prettier --plugin-search-dir=. --write

echo "Formatting with prettier"
echo "$FILES" | xargs yarn eslint --fix
