NM := node_modules/.bin
SRC := $(shell find src -type f -print)
.SUFFIXES:

dist/package.json: $(SRC) yarn.lock
	$(NM)/bundilio

test: dist/package.json
	$(NM)/ava

yarn.lock:: package.json
	@yarn install --production=false
	@touch -mr $@ $<

yarn.lock:: node_modules
	@yarn install --production=false --check-files
	@touch -mr $@ $<

clean:
	rm -rf node_modules dist

node_modules:
	mkdir -p $@