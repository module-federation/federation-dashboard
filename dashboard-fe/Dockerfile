FROM node:12.8-alpine as test-target
ENV NODE_ENV=test
ENV PATH $PATH:/usr/src/app/node_modules/.bin
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# Build
FROM test-target as build-target
ENV NODE_ENV=production
ENV PATH $PATH:/usr/src/app/node_modules/.bin
WORKDIR /usr/src/app
RUN npm run build
RUN npm prune --production

# Archive
FROM node:12.8-alpine as archive-target
ENV NODE_ENV=production
ENV PATH $PATH:/usr/src/app/node_modules/.bin
WORKDIR /usr/src/app

# Include only the release build and production packages.
COPY --from=build-target /usr/src/app/node_modules node_modules
COPY --from=build-target /usr/src/app/.next .next

EXPOSE 3000
CMD ["next", "start"]
