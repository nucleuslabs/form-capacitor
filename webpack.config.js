const path = require('path');
const examplesDir = path.resolve(__dirname, 'examples');
const srcDir = path.resolve(__dirname, 'src');
const {ProvidePlugin} = require('webpack');
const SvgStorePlugin = require('external-svg-sprite-loader/lib/SvgStorePlugin');

// TODO: move this under examples/.

module.exports = {
    context: __dirname,
    entry: './examples/entry',
    output: {
        path: examplesDir,
        filename: 'bundle.js',
        publicPath: '/',
        pathinfo: true,
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [examplesDir,srcDir],
                loader: 'babel-loader',
                options: {
                    // presets: [['env',{target:'last 1 chrome versions'}]],
                    plugins: ['transform-react-jsx', 'transform-class-properties', 'syntax-object-rest-spread', 'transform-object-rest-spread'],
                },
            },
            {
                test: /\.(jpe?g|png|gif)($|\?)/i,
                include: [examplesDir],
                loader: 'url-loader',
                options: {
                    limit: 1024*2,
                }
            },
            {
                test: /\.svg($|\?)/i,
                include: [examplesDir],
                loader: 'external-svg-sprite-loader',
            },
            {
                test: /\.less$/,
                include: [examplesDir],
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
            'form-capacitor': path.resolve(__dirname, 'src'),
        },
    },
    // devtool: 'cheap-module-eval-source-map',
    plugins: [
        new ProvidePlugin({
            React: 'react',
        }),
        new SvgStorePlugin(),
    ]
};