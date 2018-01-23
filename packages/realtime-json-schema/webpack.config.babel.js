// import Path from 'path';
import {ProvidePlugin,IgnorePlugin,NamedModulesPlugin,HotModuleReplacementPlugin} from 'webpack';

const src = `${__dirname}/src`;

export default {
    context: `${__dirname}/src`,
    entry: [
        // 'react-hot-loader/patch',
        `${__dirname}/src/index.js`,
    ],
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
                test: /\.pegjs$/,
                loader: 'pegjs-loader',
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
        new NamedModulesPlugin,
        // new HotModuleReplacementPlugin,
    ],
    resolveLoader: {
        modules: ['node_modules', `${__dirname}/loaders`],
    },
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