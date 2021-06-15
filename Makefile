BIN := node_modules/.bin
SRC_FILES := $(shell find src -name '*.js')

# these are not files
.PHONY: clean publish

# disable default suffixes
.SUFFIXES:

dist: $(SRC_FILES) yarn.lock webpack.config.js
	${BIN}/webpack .
	@touch $@

yarn.lock:: package.json
	@yarn install --production=false
	@touch -mr $@ $<

yarn.lock:: node_modules
	@yarn install --production=false --check-files
	@touch -mr $@ $<
	
node_modules:
	mkdir -p $@

publish: test
	cp package.json dist/package.json && cp README.md dist/README.md && cp -r docs dist/
	yarn version
	yarn publish dist --tag latest

lint: $(SRC_FILES) yarn.lock
	yarn run lint

test: $(SRC_FILES) yarn.lock lint dist
	node_modules/.bin/jest --coverage

clean:
	rm -rf node_modules dist