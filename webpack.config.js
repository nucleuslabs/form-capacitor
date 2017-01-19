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
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                include: [examplesDir],
                loader: 'babel-loader',
                options: {
                    // presets: [['env',{target:'last 1 chrome versions'}]],
                    plugins: ['transform-react-jsx'],
                },
            }
        ]
    },
    target: 'web',
    resolve: {
        modules: ['node_modules'],
        extensions: ['.jsx','.js'],
    },
    devtool: 'cheap-module-eval-source-map',
    plugins: [
        new ProvidePlugin({
            React: 'react',
        }),
    ]
};