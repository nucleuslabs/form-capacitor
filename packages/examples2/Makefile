NM := node_modules/.bin
.SUFFIXES:

wds: yarn.lock
	BABEL_ENV=webpack $(NM)/webpack-dev-server

svgo:
	find src/icons -type d -links 2 -print0 | xargs -0 -n 1 -P 6 npx svgo --config=svgo.yml

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