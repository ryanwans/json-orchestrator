#!make

MAKEFLAGS += --silent
include .env
export $(shell sed 's/=.*//' .env)

dev:
    node_modules/.bin/nodemon testing/testServer.js

test:
    NODE_ENV=test \
    LOG_ENABLED=false \
    LOG_LEVEL=silent \
    npm test

watch:
    node_modules/.bin/chokidar 'test/**/*.js' -c 'node_modules/.bin/tape {path}'

.PHONY: test
.PHONY: dev
.PHONY: watch

push:
    git pull origin master

push:
    git add -A
    git commit -m "Automated Push"
    git push origin master
