FROM node:alpine

LABEL MAINTAINER = "小富 <woaiso@woaiso.com>"
LABEL NAME="wst-app"
LABEL VERSION="1"

# Copy source code
RUN mkdir -p /usr/src/app

COPY app config typings package.json tsconfig.json yarn.lock /usr/src/app/

WORKDIR /usr/src/app

RUN npm install -g yarn && yarn && yarn run tsc
EXPOSE 7001
CMD [ "yarn", "run", "start:docker" ]
