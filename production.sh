#!/bin/sh

# clean build cache
rm -rf dist

# build typescript
npm run tsc

cp  package.json Dockerfile dist

cd docker

docker-compose up

