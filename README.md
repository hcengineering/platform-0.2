# Anticrm Platform

[![Gitter](https://badges.gitter.im/anticrm/community.svg)](https://gitter.im/anticrm/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) ![GitHub last commit](https://img.shields.io/github/last-commit/anticrm/platform) ![CI](https://github.com/anticrm/platform/workflows/CI/badge.svg) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Code structure

Here's the breakdown of the repo:

* Packages:
  * [@anticrm/foundation](./packages/foundation) –- Anticrm Platform Foundation Types.
  * [@anticrm/platform](./packages/platform) -- Plugin architecture and implementation. Client-side only. 
  * [@anticrm/core](./packages/core) -- Core concepts shared by Client plugins and Server components.
  * [@anticrm/model](./packages/model) -- Utils to define and manage domain models. Used by tooling, not a part of client/server runtimes.
  
* Plugins:

More on [Code Structure](https://platform-one.now.sh/docs/concepts/code-structure/).

## Install and Run

**Note:** Please use *nodejs* version 14.x or later!

Use following commands to install and run demo application:

```
yarn
docker run -d -p 27017:27017 mongo
yarn workspace @anticrm/tool create-workspace workspace --organization "My Organization"
yarn workspace @anticrm/tool create-user john.appleseed@gmail.com -w workspace -p 123 -f "John Appleseed"
yarn workspace @anticrm/tool create-user brain.appleseed@gmail.com -w workspace -p 123 -f "Brain Appleseed"
yarn workspace @anticrm/server start
```

Open new console and run:

```
yarn workspace @anticrm/server-front start
```

Open one more console and run:

```
yarn workspace prod dev
```

You need to log in first, go to: http://localhost:8080/component:login.LoginForm
Then, go to http://localhost:8080/component:workbench.Workbench/application:workbench.Default

Add more users:
```
yarn workspace @anticrm/tool create-user john.someseed@gmail.com -w workspace -p 123 -f "John Someseed"
```

Upgrade DB models:
```
yarn workspace @anticrm/tool upgrade-workspace workspace
```

# The Platform Documentation

* [Platform Architecture](https://platform-one.now.sh/docs/concepts/architecture/)
* [Мотивационная статья](https://medium.com/платформа/го-я-создал-4250ec3dab76)

## Run with Server and MongoDb (obsolete, version 1)

1. You have to run mongodb instance locally. Easiest way to do this is to run official mongodb container: `docker run -d -p 27017:27017 mongo`.
2. Initialize database with `boot` package: `yarn && ./scripts/build-packages.sh && yarn workspace @anticrm/dev-boot dump`. Note: the `boot` will use `MONGODB_URI` environment variable, failover to `localhost` and default mongodb port if variable not present.
3. From the Cloud repo run WebSocket server: `yarn && yarn workspace @anticrm/server build && yarn workspace @anticrm/server start`.
4. From the Platform (this) repo run `prod` launcher: `yarn workspace prod serve`.

## Continuous Integration (obsolete, version 1)

* Build system deploy in-memory-database client to: https://platform-one.now.sh and/or branch-specific URLs (see particular commit comments).
* Build system deploy production client to: http://anticrm-platform.s3-website.us-east-2.amazonaws.com/

# Development

## Enable project eslint

`yarn add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-standard eslint-plugin-import eslint-plugin-node eslint-plugin-promise eslint-plugin-standard`
