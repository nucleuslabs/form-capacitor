// import Path from 'path';
import {ProvidePlugin,IgnorePlugin} from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const src = `${__dirname}/src`;

export default {
    context: `${__dirname}/src`,
    entry: `${__dirname}/src/index.js`,
    output: {
        path: `${__dirname}/src/public`,
        filename: 'bundle.js',
        publicPath: '/',
        pathinfo: true,
        crossOriginLoading: 'anonymous'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                include: src,
            },
            {
                test: /\.(jpe?g|png|gif)($|\?)/i,
                include: src,
                loader: 'sizeof-loader',
                options: {
                    limit: 1024 * 2,
                }
            },
            {
                test: /\.svg($|\?)/i,
                include: src,
                loader: 'svg-url-loader',
                options: {
                    limit: 1024 * 2,
                    noquotes: true,
                }
            },
            {
                test: /\.less$/,
                include: src,
                use: [
                    'style-loader',
                    {loader: 'css-loader', options: {modules: true}},
                    {loader: 'less-loader', options: {strictMath: true, strictUnits: true}},
                ]
            }
        ]
    },
    target: 'web',
    resolve: {
        modules: ['node_modules'],
        extensions: ['.jsx', '.js'],
    },
    devtool: 'cheap-module-source-map',
    plugins: [
        new ProvidePlugin({
            React: 'react',
        }),
        new ExtractTextPlugin('style.css'),
    ],
    devServer: {
        host: '0.0.0.0',
        disableHostCheck: true,
        // hot: true,
        inline: true,
        port: 8080,
        contentBase: `${__dirname}/src/public`,
        historyApiFallback: true,
        stats: 'errors-only',
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        watchOptions: {
            aggregateTimeout: 250,
            poll: 50
        },
    },
};