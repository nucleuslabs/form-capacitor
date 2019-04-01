const path = require('path');
const srcDir = path.resolve(__dirname,'../../src');
const {ProvidePlugin} = require('webpack');
const SvgStorePlugin = require('external-svg-sprite-loader/lib/SvgStorePlugin');

// TODO: move this under examples/.

module.exports = {
    context: __dirname,
    entry: './entry',
    output: {
        path: __dirname,
        filename: 'bundle.js',
        publicPath: '/',
        pathinfo: true,
    },
    /*
        "@babel/plugin-transform-react-jsx",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-syntax-object-rest-spread",
    "@babel/plugin-proposal-object-rest-spread"
     */
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [__dirname,srcDir],
                loader: 'babel-loader',
                options: {
                    // presets: [['env',{target:'last 1 chrome versions'}]],
                    plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-proposal-class-properties', '@babel/syntax-object-rest-spread', '@babel/proposal-object-rest-spread'],
                },
            },
            {
                test: /\.(jpe?g|png|gif)($|\?)/i,
                include: [__dirname],
                loader: 'url-loader',
                options: {
                    limit: 1024*2,
                }
            },
            {
                test: /\.svg($|\?)/i,
                include: [__dirname],
                loader: 'external-svg-sprite-loader',
            },
            {
                test: /\.less$/,
                include: [__dirname],
                use: [
                    'style-loader',
                    {loader: 'css-loader', options: {importLoaders: 2}},
                    {loader: 'less-loader', options: {strictMath: true, strictUnits: true}},
                ]
            }
        ]
    },
    target: 'web',
    resolve: {
        modules: ['node_modules'],
        extensions: ['.jsx', '.js'],
        alias: {
            'form-capacitor': srcDir,
        },
    },
    devtool: 'cheap-module-eval-source-map',
    plugins: [
        new ProvidePlugin({
            React: 'react',
        }),
        new SvgStorePlugin(),
    ]
};