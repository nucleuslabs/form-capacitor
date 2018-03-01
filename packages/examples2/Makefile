NM := node_modules/.bin
.SUFFIXES:

wds: yarn.lock
	BABEL_ENV=webpack $(NM)/webpack-dev-server

yarn.lock:: package.json
	@yarn install --production=false
	@touch -mr $@ $<

yarn.lock:: node_modules
	@yarn install --production=false --check-files
	@touch -mr $@ $<

clean:
	rm -rf node_modules

node_modules:
	mkdir -p $@