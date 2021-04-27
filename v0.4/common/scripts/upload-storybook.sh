#!/bin/bash

# storybook will be uploaded to http://anticrm-storybook.s3.us-east-2.amazonaws.com/index.html

cd dev/storybook/storybook-static
aws s3 sync . s3://anticrm-storybook --delete --acl public-read
cd ../../..

