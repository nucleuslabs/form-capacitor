BIN := node_modules/.bin
SRC_FILES := $(shell find src -name '*.js')

# these are not files
.PHONY: clean test publish dev

# disable default suffixes
.SUFFIXES:

#--open
all: yarn.lock
	npx webpack-dev-server --hot --inline --colors --port 3123 --content-base src

yarn.lock:: package.json
	@yarn install --production=false
	@touch -mr $@ $<

yarn.lock:: node_modules
	@yarn install --production=false --check-files
	@touch -mr $@ $<
	
node_modules .deps:
	mkdir -p $@

clean:
	rm -rf node_modules dist