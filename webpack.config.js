var webpack = require("webpack");
var path = require( 'path' );

module.exports = {
    entry: './src/main.js',
    devtool: 'source-map',
    mode: 'none',
    output: {
        path: path.resolve('dist'),
        filename: 'react-structured-filter.js',
        library: 'react-structured-filter',
        libraryTarget: 'commonjs2',
    },
    module: {
        rules: [
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
        underscore: {
            root: '_',
            commonjs: 'underscore',
            commonjs2: 'underscore',
            amd: 'underscore',
        },
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