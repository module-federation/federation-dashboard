FROM node:12.8-alpine as test-target
ENV NODE_ENV=test
ENV PATH $PATH:/usr/src/app/node_modules/.bin
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install
COPY . .

# Build
FROM test-target as build-target
ENV NODE_ENV=production
ENV PATH $PATH:/usr/src/app/node_modules/.bin
WORKDIR /usr/src/app
RUN yarn build
RUN yarn install --production --ignore-scripts

# Archive
FROM node:12.8-alpine as archive-target
ENV NODE_ENV=production
ENV PATH $PATH:/usr/src/app/node_modules/.bin
WORKDIR /usr/src/app

# Include only the release build and production packages.
COPY --from=build-target /usr/src/app/node_modules node_modules
COPY --from=build-target /usr/src/app/.next .next

ENV DATA_DIR /data
# Auth0 Env Vars
ENV AUTH0_CLIENT_ID=JldqTRWvEuGSRedeHGMA7hwfOUz4YW3n
ENV AUTH0_CLIENT_SECRET=5znZQebom4M8vvyPvQaE-4h_naSYv8vdcAcXoERly4eyKo2MOd7dYraua7Awy4fy
ENV AUTH0_DOMAIN=federation-dashboard.us.auth0.com
ENV REDIRECT_URI=http://localhost:3000/api/callback
ENV POST_LOGOUT_REDIRECT_URI=http://localhost:3000
ENV SESSION_COOKIE_SECRET=3m`PfnYrCxQ(taddpfp7!RxNgBmSckWCm&7GeAX#sr!(4'2Vr:Xjr5Ayn2$XXw7
RUN mkdir -p /data

EXPOSE 3000
CMD ["next", "start"]
