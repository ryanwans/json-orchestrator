#!make

MAKEFLAGS += --silent
# include .env
# export $(shell sed 's/=.*//' .env)

PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

source_files    := $(wildcard lib/*.coffee)
build_files     := $(source_files:%.coffee=build/%.js)
template_source := templates/*.handlebars
template_js     := build/templates.js
app_bundle      := build/app.js
spec_coffee     := $(wildcard spec/*.coffee)
spec_js         := $(spec_coffee:%.coffee=build/%.js)

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
    
define npm_script_targets
TARGETS := $(shell node -e 'for (var k in require("./package.json").scripts) {console.log(k.replace(/:/g, "-"));}')
$$(TARGETS):
	npm run $(subst -,:,$(MAKECMDGOALS))

.PHONY: $$(TARGETS)
endef
