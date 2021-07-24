#!/usr/bin/env sh

FILES=$(git diff --name-only --diff-filter=ACMR | sed 's| |\\ |g')
[ -z "$FILES" ] && exit 0

roots=$(yarn workspaces info | grep "location" | cut -f 2 -d ':' | cut -f 1 -d ',' | cut -f 2 -d '"')

declare -a changed_roots

pushd () {
    command pushd "$@" > /dev/null
}

popd () {
    command popd "$@" > /dev/null
}

if [ -n "$FILES" ]; then
  echo "processing diff files: ${FILES}"
  for file in $FILES; do
    # Match file to root
    for r in $roots; do
      if [[ "$file" == ${r}* ]]; then
        if [[ ! " ${changed_roots[@]} " =~ " ${r} " ]]; then
          changed_roots+=("$r")
        fi
      fi
    done
  done
  for value in "${changed_roots[@]}"; do
    echo "\033[0;34mLinting \033[0;31m${value}\033[0m"
    pushd $value 
    yarn lint:fix
    popd
  done
fi
