const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractSass = new ExtractTextPlugin({
    filename: '[name].css'
});

module.exports = {
    entry: './src/entry.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build')
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: extractSass.extract({
                use: [{
                    loader: 'css-loader' // translates CSS into CommonJS
                }, {
                    loader: 'sass-loader', // compiles Sass to CSS
                    options: {
                        includePaths: [path.resolve(__dirname, 'node_modules')]
                    }
                }]
            })
        }]
    },
    plugins: [
        extractSass
    ]
};
