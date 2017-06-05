import Path from 'path';
import {ProvidePlugin} from 'webpack';
import SvgStorePlugin from 'external-svg-sprite-loader/lib/SvgStorePlugin';
const srcDir = Path.resolve(__dirname,'../../dist/web');


export default {
    context: __dirname,
    entry: './entry',
    output: {
        path: __dirname,
        filename: 'bundle.js',
        publicPath: '/',
        pathinfo: true,
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: __dirname,
                loader: 'babel-loader',
                options: {
                    // presets: [['env',{target:'last 1 chrome versions'}]],
                    plugins: ['transform-react-jsx', 'transform-class-properties', 'syntax-object-rest-spread', 'transform-object-rest-spread'],
                },
            },
            {
                test: /\.(jpe?g|png|gif)($|\?)/i,
                include: __dirname,
                loader: 'url-loader',
                options: {
                    limit: 1024*2,
                }
            },
            {
                test: /\.svg($|\?)/i,
                include: __dirname,
                loader: 'external-svg-sprite-loader',
            },
            {
                test: /\.less$/,
                include: __dirname,
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