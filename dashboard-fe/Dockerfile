FROM node:16.6-alpine as test-target
ENV NODE_ENV=test
ENV PATH $PATH:/usr/src/app/node_modules/.bin
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install
RUN test -f .env || touch .env
COPY . .

# Build
FROM test-target as build-target

ENV NODE_ENV=production
ENV PATH $PATH:/usr/src/app/node_modules/.bin
WORKDIR /usr/src/app
RUN yarn build
RUN yarn install --production

# Archive
FROM node:16.6-alpine as archive-target
ENV NODE_ENV=production
ENV PATH $PATH:/usr/src/app/node_modules/.bin
WORKDIR /usr/src/app

# Include only the release build and production packages.
COPY --from=build-target /usr/src/app/node_modules node_modules
COPY --from=build-target /usr/src/app/.next .next
COPY --from=build-target /usr/src/app/server server
COPY --from=build-target /usr/src/app/.next public

ENV DATA_DIR /data
RUN mkdir -p /data

EXPOSE 3000
CMD ["node","./server"]
