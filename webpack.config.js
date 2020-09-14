'use strict';

// const path = require('path');
// const webpack = require('webpack');

module.exports = {
    mode: 'development',
    module: {
        rules: [
            { test: /\.(js|mjs)$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
    },
    entry: './src/index.js',
    output: {
    // path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    devtool: 'cheap-module-eval-source-map',
    //   path: __dirname + '/dist',
    //   publicPath: '/',
    //   filename: '[name].js',
    //   library: 'phaser-autotile',
    //   libraryTarget: 'umd',
    //   devtoolModuleFilenameTemplate: 'webpack:///[resource-path]', // string
    //   devtoolFallbackModuleFilenameTemplate: 'webpack:///[resource-path]?[hash]', // string
    //   umdNamedDefine: true,    
    // },
};