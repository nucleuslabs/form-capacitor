const path = require('path');
const examplesDir = path.resolve(__dirname, 'examples');
const {ProvidePlugin} = require('webpack');

module.exports = {
    context: examplesDir,
    entry: './entry',
    output: {
        path: examplesDir,
        filename: 'bundle.js',
        publicPath: '/',
        pathinfo: true,
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                // include: [examplesDir],
                loader: 'babel-loader',
                options: {
                    // presets: [['env',{target:'last 1 chrome versions'}]],
                    plugins: ['transform-react-jsx', 'transform-class-properties'],
                },
            },
            {
                test: /\.(jpe?g|png|gif|svg)($|\?)/i,
                loader: 'url-loader',
                options: {
                    limit: 1024*2,
                }
            },
            {
                test: /\.less$/,
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
    ]
};