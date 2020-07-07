'use strict';

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');


module.exports = {
    mode: 'development',
    entry: {
        blob: './src/Blob.js',
        map: './src/Map.js',
        playpen: './src/Playpen.js',
        tile_ids: './src/TileIds.js'
    },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
            { test: [/\.vert$/, /\.frag$/], use: 'raw-loader' },
            {
                test: /\.(gif|png|jpe?g|svg|xml)$/i,
                use: 'file-loader'
            },
            { test: /\.(csv)$/i, use: 'file-loader'},
        ]
    },
    output: {
    // pathinfo: true,
        path: path.resolve(__dirname, 'dist'),
        // publicPath: '/',
        // library: '[name]',
        // libraryTarget: 'umd',
        // sourceMapFilename: '[name].map',
        filename: '[name].bundle.js'
    },
    resolve: {
        alias: {
            // Standin for actually importing the autotile library. In your code, just do an npm dependency.
            'phaser3-autotile': path.resolve(__dirname, '../'),
        }
    },
    plugins: [
    // new CleanWebpackPlugin({
    //   root: path.resolve(__dirname, "../")
    // }),
        new webpack.DefinePlugin({
            WEBGL_RENDERER: true,
            CANVAS_RENDERER: true
        }),
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: false,
        })
    ],

    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
    // publicPath: '/'
    },

    // devtool: 'source-map',
};