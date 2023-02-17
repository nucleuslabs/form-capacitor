const path = require('path');
const src = path.resolve('./src');
const dist = path.resolve('./dist');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    mode: "production",
    entry: src + "/index.js",
    output: {
        library: "FormCapacitor",
        libraryTarget: 'umd',
        filename: "index.js",
        path: dist,
        globalObject: 'this',
        hashFunction: "xxhash64"    // Needed for node 18, which no longer allows old hash algos. Also required upgrading webpack to latest 5.54+ See. https://stackoverflow.com/a/73027407/15825770
    },
    externals: {
        "react": "react",
        "react-dom": "react-dom"
    },
    module: {
        rules: [
            {
                test: /\.(jsx?)$/,
                include: src,
                use: "babel-loader",
                sideEffects: false
            }
        ]
    },
    optimization: {
        minimize: true,
        usedExports: true,
    },
    plugins: [
        new NodePolyfillPlugin({
            excludeAliases: ["console"]
        })
    ]
};