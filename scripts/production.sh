#!/usr/bin/env bash

# clean build cache
rm -rf dist

# build typescript
npm run tsc

cp -r  package.json Dockerfile scripts typings yarn.lock tsconfig dist

cd docker

docker-compose up

