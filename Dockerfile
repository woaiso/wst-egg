FROM node:alpine

LABEL MAINTAINER = "小富 <woaiso@woaiso.com>"
LABEL NAME="wst-app"
LABEL VERSION="1"

# Copy source code
RUN mkdir -p /usr/src/app

RUN apk add --no-cache bash

COPY . /usr/src/app/

WORKDIR /usr/src/app

RUN npm install -g yarn && yarn install && yarn run tsc
EXPOSE 7001
CMD [ "yarn", "run", "start:docker" ]
