# Anticrm Platform

[![Gitter](https://badges.gitter.im/anticrm/community.svg)](https://gitter.im/anticrm/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) ![GitHub last commit](https://img.shields.io/github/last-commit/anticrm/platform) ![CI](https://github.com/anticrm/platform/workflows/CI/badge.svg) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Code structure

Anticrm code falls into three major parts: [packages](./packages), [plugins](./plugins) and [server](./server).

- [packages](./packages) contains code shared among client and server, except [packages/platform](./packages/platform)
  which defines plugin architecture and client-side only. _These packages defines most of the core Anticrm concepts._
- [plugins](./plugins) contains client-side code packaged in form of Anticrm Plugins.
- [server](./server) contains server-side platform code.

Here's the breakdown of the repo:

- Packages:

  - [@anticrm/foundation](./packages/foundation) –- Anticrm Platform Foundation Types.
  - [@anticrm/platform](./packages/platform) -- Plugin architecture and implementation. Client-side only.
  - [@anticrm/core](./packages/core) -- Core concepts shared by Client plugins and Server components.
  - [@anticrm/model](./packages/model) -- Utils to define and manage domain models. Used by tooling, not a part of
    client/server runtimes.

- Plugins:

More on [Code Structure](https://platform-one.now.sh/docs/concepts/code-structure/).

## Install and Run

**Note:** Please use _nodejs_ version 14.x or later!

Use following commands to install and run demo application:

Running MongoDB in docker:

```bash
docker run -d -p 127.0.0.1:27017:27017 mongo
```

Running MongoDB for MacOS using brew:

```bash
brew tap mongodb/brew # Only first time
brew install mongodb-community # Only first time
brew services start mongodb-community # Stop could be used to stop.
```

```bash
yarn
# start Mongo using Docker or locally
yarn workspace @anticrm/tool create-workspace workspace --organization "My Organization"
yarn workspace @anticrm/tool create-user john.appleseed@gmail.com -w workspace -p 123 -f "John Appleseed"
yarn workspace @anticrm/tool create-user brain.appleseed@gmail.com -w workspace -p 123 -f "Brain Appleseed"
yarn workspace @anticrm/server start
```

Open new console and run:

```bash
yarn workspace @anticrm/server-front start
```

Open one more console and run:

```bash
yarn workspace prod dev
```

You need to log in first, go to: http://localhost:8080  
After login you will be redirected to default application (ex: 'workbench')

Add more users:

```bash
yarn workspace @anticrm/tool create-user john.someseed@gmail.com -w workspace -p 123 -f "John Someseed"
```

Upgrade DB models:

```bash
yarn workspace @anticrm/tool upgrade-workspace workspace
```

# The Platform Documentation

- [Platform Architecture](https://platform-one.now.sh/docs/concepts/architecture/)
- [Мотивационная статья](https://medium.com/платформа/го-я-создал-4250ec3dab76)

# Development

## Git hooks

### pre-commit

Create symlink to format and autofix changed files on commit:

```bash
ln -s ../../scripts/hooks/pre-commit .git/hooks/pre-commit
```
