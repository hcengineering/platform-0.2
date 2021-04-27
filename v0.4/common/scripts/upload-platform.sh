#!/bin/bash

# Platfrom will be deployed to https://d1ki2i8h6jgk1u.cloudfront.net/login
# http://anticrm-platform.s3-website.us-east-2.amazonaws.com/login

cd dev/prod/dist
aws s3 sync . s3://anticrm-platform --delete --acl public-read
cd ../public
aws s3 sync . s3://anticrm-platform --acl public-read
cd ../../..

