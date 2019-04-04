#!/usr/bin/env bash


# clean build cache
rm -rf dist

# build typescript
npm run tsc

cp -r  package.json Dockerfile scripts dist

cd docker

docker-compose up

