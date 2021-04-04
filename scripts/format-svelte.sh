#!/usr/bin/env sh
set -e

FILES=$(git diff --name-only origin/master... "*.svelte" | sed 's/ /\\ /g')
[ -z "$FILES" ] && exit 0

echo "$FILES" | xargs yarn prettier --plugin-search-dir=. --write
echo "$FILES" | xargs yarn eslint --fix
