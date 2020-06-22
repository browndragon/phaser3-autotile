'use strict';

const webpack = require('webpack');
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin")


module.exports = {
  mode: 'development',
  entry: {
    subtile: './src/SubtileExample.js',
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
    path: __dirname + '/dist/',
    publicPath: '/phaser3-autotile/dist/',
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