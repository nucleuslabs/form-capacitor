BIN := node_modules/.bin
SRC_FILES := $(shell find src -name '*.js')

# these are not files
.PHONY: clean publish

# disable default suffixes
.SUFFIXES:

dist: $(SRC_FILES) yarn.lock
	mkdir -p $@
	@yarn build

yarn.lock:: package.json
	@yarn install --production=false
	@touch -mr $@ $<

yarn.lock:: node_modules
	@yarn install --production=false --check-files
	@touch -mr $@ $<

node_modules:
	mkdir -p $@

publish: test
	cp package.json dist/package.json && cp README.md dist/README.md
	yarn version
	yarn publish dist --tag legacy

test: $(SRC_FILES) yarn.lock dist
	node_modules/.bin/jest --coverage

clean:
	rm -rf node_modules dist