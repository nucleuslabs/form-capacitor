# these are not files
.PHONY: all clean

# disable default suffixes
.SUFFIXES:

#--open
all: yarn.lock
	npx webpack-dev-server --host 0.0.0.0 --hot --inline --colors --port 3123 --content-base src --history-api-fallback /

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