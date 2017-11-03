import Path from 'path';
import {ProvidePlugin} from 'webpack';

export default {
    context: `${__dirname}/src`,
    entry: `${__dirname}/src/index.jsx`,
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
                loader: 'babel-loader'
            },
            // {
            //     test: /\.jsx?$/,
            //     include: __dirname,
            //     loader: 'babel-loader',
            //     options: {
            //         // presets: [['env',{target:'last 1 chrome versions'}]],
            //         plugins: ['transform-react-jsx', 'transform-class-properties', 'syntax-object-rest-spread', 'transform-object-rest-spread'],
            //     },
            // },
            {
                test: /\.(jpe?g|png|gif)($|\?)/i,
                // include: __dirname,
                loader: 'url-loader',
                options: {
                    limit: 1024 * 2,
                }
            },
            // {
            //     test: /\.less$/,
            //     include: __dirname,
            //     use: [
            //         'style-loader',
            //         {loader: 'css-loader', options: {importLoaders: 2}},
            //         {loader: 'less-loader', options: {strictMath: true, strictUnits: true}},
            //     ]
            // }
        ]
    },
    target: 'web',
    resolve: {
        modules: ['node_modules'],
        extensions: ['.jsx', '.js'],
        // alias: {
        //     'form-capacitor': `${__dirname}/../src`,
        // },
        // plugins: [
        //     new TsConfigPathsPlugin(/* { tsconfig, compiler } */)
        // ],
    },
    devtool: 'cheap-module-source-map',
    plugins: [
        new ProvidePlugin({
            React: 'react',
        }),
        // new CheckerPlugin(),
    ],
    devServer: {
        historyApiFallback: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    },
};