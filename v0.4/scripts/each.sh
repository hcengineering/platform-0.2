#!/usr/bin/env bash

roots=$(rush list -f --json | grep "fullPath" | cut -f 2 -d ':' | cut -f 2 -d '"')
for i in $roots
do  
  echo -e "\n\033[0;34mProcessing \033[0;31m${i}\033[0m"
  exec 3>&1
  exec 1> >(paste /dev/null -)
  pushd ${i} > /dev/null
  $@
  retVal=$?  
  if [ $retVal -ne 0 ]; then
    echo "Error"
    exit 1
  fi
  popd > /dev/null
  exec 1>&3 3>&-  
done
