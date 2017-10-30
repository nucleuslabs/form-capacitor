PACKAGES = $(shell find ../.. \( -type d -name node_modules -prune \) -o -type f -name "package.json" -print | sed 's/ /\\ /g')

# these are not files
.PHONY: all clean

# disable default suffixes
.SUFFIXES:

#--open
all: .deps/lerna
	npx webpack-dev-server --host 0.0.0.0 --disable-host-check --hot --inline --colors --port 3123 --content-base src/public --history-api-fallback src

.deps/lerna: .deps $(PACKAGES)
	(cd ../.. && npm i)
	lerna bootstrap
	@touch -m .deps/lerna
	
.deps:
	mkdir -p $@

clean:
	rm -rf node_modules dist .deps