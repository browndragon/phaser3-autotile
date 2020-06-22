module.exports = {
  mode: 'development',
  entry: [
    './src/Autotile.js'
  ],
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: '[name].js',
    library: 'phaser-autotile',
    libraryTarget: 'umd',
    devtoolModuleFilenameTemplate: 'webpack:///[resource-path]', // string
    devtoolFallbackModuleFilenameTemplate: 'webpack:///[resource-path]?[hash]', // string
    umdNamedDefine: true,    
  },
};