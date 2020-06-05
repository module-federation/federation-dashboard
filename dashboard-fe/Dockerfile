FROM node:12

ENV PORT 3000
ENV DATA_DIR /data

RUN mkdir -p /data
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN yarn install
RUN yarn run build
RUN rm -fr components pages src

EXPOSE 3000

CMD "yarn" "run" "start"
