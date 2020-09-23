# Anticrm Platform

[![Gitter](https://badges.gitter.im/anticrm/community.svg)](https://gitter.im/anticrm/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) ![GitHub last commit](https://img.shields.io/github/last-commit/anticrm/platform) ![CI](https://github.com/anticrm/platform/workflows/CI/badge.svg) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**Note:** Please use *nodejs* version 14.x or later!

## Install and Run

Use following commands to install and run demo application.

```
yarn
docker run -d -p 27017:27017 mongo
yarn workspace @anticrm/tool create-workspace john.appleseed@gmail.com -w workspace -p 123 -f "John Appleseed"
yarn workspace @anticrm/server start
yarn workspace @anticrm/server-front start
yarn workspace prod dev
```

Go to http://localhost:8080

# The Platform Documentation

* [Platform Architecture](./packages/platform/README.md)

## Run with Server and MongoDb (obsolete, version 1)

1. You have to run mongodb instance locally. Easiest way to do this is to run official mongodb container: `docker run -d -p 27017:27017 mongo`.
2. Initialize database with `boot` package: `yarn && ./scripts/build-packages.sh && yarn workspace @anticrm/dev-boot dump`. Note: the `boot` will use `MONGODB_URI` environment variable, failover to `localhost` and default mongodb port if variable not present.
3. From the Cloud repo run WebSocket server: `yarn && yarn workspace @anticrm/server build && yarn workspace @anticrm/server start`.
4. From the Platform (this) repo run `prod` launcher: `yarn workspace prod serve`.

## Continuous Integration (obsolete, version 1)

* Build system deploy in-memory-database client to: https://platform-one.now.sh and/or branch-specific URLs (see particular commit comments).
* Build system deploy production client to: http://anticrm-platform.s3-website.us-east-2.amazonaws.com/
