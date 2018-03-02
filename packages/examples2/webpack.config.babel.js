import {ProvidePlugin,IgnorePlugin,NamedModulesPlugin,HotModuleReplacementPlugin} from 'webpack';

const src = `${__dirname}/src`;

const cssLoaders = [
    {
        loader: 'style-loader',
    },
    {
        loader: 'css-loader',
        options: {
            modules: true,
            localIdentName: '[name]_[local]--[hash:base64:5]',
        }
    }
];

export default {
    context: `${__dirname}/src`,
    mode: 'development',
    entry: [
        'react-hot-loader/patch',
        `${__dirname}/src/index.js`,
    ],
    output: {
        path: `${__dirname}/public`,
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
                options: {
                    cacheDirectory: true,
                    forceEnv: 'development'
                }
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
                loader: 'raw-loader',
            },
            {
                test: /\.css$/,
                use: cssLoaders
            },
            {
                test: /\.s[ca]ss$/,
                use: [...cssLoaders, 'sass-loader']
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
        new HotModuleReplacementPlugin,
    ],
    devServer: {
        host: '0.0.0.0',
        disableHostCheck: true,
        hot: true,
        inline: true,
        port: 8080,
        contentBase: `${__dirname}/public`,
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