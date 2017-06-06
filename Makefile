BIN := node_modules/.bin
SRC_FILES := $(shell find src -name '*.js')

# these are not files
.PHONY: clean test publish dev

# disable default suffixes
.SUFFIXES:

.deps/dist: $(SRC_FILES) yarn.lock .deps bundilio.config.js
#	rm -rf dist/*
	node --trace-warnings $(BIN)/bundilio .
	@touch $@

yarn.lock:: package.json
	@yarn install --production=false
	@touch -mr $@ $<

yarn.lock:: node_modules
	@yarn install --production=false --check-files
	@touch -mr $@ $<
	
node_modules .deps:
	mkdir -p $@

publish: .deps/dist
	yarn version
	cp package.json dist/package.json
	npm publish dist

clean:
	rm -rf node_modules dist .deps

test: .deps/dist
	$(BIN)/jest

dev: .deps/dist
	$(BIN)/concurrently -k -n "http,wp" -c "bgGreen.bold.white,bgBlue.bold.white" -p "{name}" \
		"$(BIN)/http-server -p 8456 ./examples/bootstrap" \
		"BABEL_ENV=test $(BIN)/babel-node $(BIN)/webpack --config examples/bootstrap/webpack.config.js --watch"