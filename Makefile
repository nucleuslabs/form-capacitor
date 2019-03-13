BIN := node_modules/.bin
SRC_FILES := $(shell find src -name '*.js')

# these are not files
.PHONY: clean publish

# disable default suffixes
.SUFFIXES:

dist: $(SRC_FILES) yarn.lock webpack.config.babel.js
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

publish: dist
	yarn version
	cp package.json dist/package.json
	npm publish dist

clean:
	rm -rf node_modules dist