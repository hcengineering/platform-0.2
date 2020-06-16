FROM node:alpine

WORKDIR /usr/src/server

COPY package.json yarn.lock ./
COPY packages/platform ./packages/platform
COPY packages/platform-core ./packages/platform-core
COPY packages/server ./packages/server

RUN yarn

EXPOSE 8080

CMD ["yarn", "workspace", "@anticrm/server", "start"]
