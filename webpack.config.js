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
        globalObject: 'this'
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