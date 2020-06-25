'use strict';

const webpack = require('webpack');
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin")


module.exports = {
  mode: 'development',
  entry: {
    autotiling: './src/AutotilingExample.js',
    blobIndexer: './src/BlobIndexerExample.js',
    dynamic: './src/DynamicExample.js',
    tilesheet: './src/TilesheetExample.js',
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: [/\.vert$/, /\.frag$/], use: 'raw-loader' },
      {
        test: /\.(gif|png|jpe?g|svg|xml)$/i,
        use: "file-loader"
      },
      { test: /\.(csv)$/i, use: "file-loader"},
    ]
  },
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    library: '[name]',
    libraryTarget: 'umd',
    sourceMapFilename: '[name].map',
    filename: '[name].bundle.js'
  },
  plugins: [
    new CleanWebpackPlugin({
      root: path.resolve(__dirname, "../")
    }),
    new webpack.DefinePlugin({
      WEBGL_RENDERER: true,
      CANVAS_RENDERER: true
    }),
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ],
  devServer: {
    contentBase: __dirname,
    publicPath: '/dist'
  },
  devtool: 'source-map',
};