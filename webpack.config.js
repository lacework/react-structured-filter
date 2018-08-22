var webpack = require("webpack");
var path = require( 'path' );

module.exports = {
    entry: './src/main.js',
    devtool: 'source-map',
    output: {
        path: __dirname,
        filename: 'react-structured-filter.js',
        library: 'react-structured-filter',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                 options: {
                     presets: ["react"]
                 },
                include: path.resolve( __dirname, 'src' ),
                exclude: /node_modules/
            }
        ]
    },
    externals: {
        'react-dom': {
            root: 'ReactDOM',
            commonjs: 'react-dom',
            commonjs2: 'react-dom'
        },
        react: {
            root: 'React',
            commonjs: 'react',
            commonjs2: 'react'
        }
    }
}