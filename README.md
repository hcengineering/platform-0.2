# Anticrm Platform

[![Gitter](https://badges.gitter.im/anticrm/community.svg)](https://gitter.im/anticrm/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) ![GitHub last commit](https://img.shields.io/github/last-commit/anticrm/platform) ![CI](https://github.com/anticrm/platform/workflows/CI/badge.svg) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install and Run

Use following commands to install and run demo application without server-side and without database.
In-memory database will be used with limited capabilities.

```
yarn install
./scripts/build-packages.sh
yarn workspace launch serve
```

## Run with Server and MongoDb

1. You have to run mongodb instance locally. Easiest way to do this is to run official mongodb container: `docker run -d mongo`.
2. Initialize database with `boot` package: `yarn workspace @anticrm/dev-boot dump`. Note: the `boot` will use `MONGODB_URI` environment variable, failover to `localhost` and default mongodb port if variable not present.
3. From the Cloud repo run WebSocket server: `yarn workspace @anticrm/server build && yarn workspace @anticrm/server start`.
4. From the Platform (this) repo run `prod` launcher: `yarn workspace prod serve`.

# The Platform Documentation

* [Platform Architecture](./packages/platform/README.md)

