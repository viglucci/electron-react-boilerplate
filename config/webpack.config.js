var webpack = require('webpack');
var jetpack = require('fs-jetpack');

var projectDir = jetpack;
var configDir = projectDir.cwd('./config');
var srcDir = projectDir.cwd('./app');
var componentsDir = srcDir.cwd('./components');
var destDir = projectDir.cwd('./build');
var publicDir = projectDir.cwd('./public');
var builtDir = publicDir.cwd('./built');

var config = {
  entry: {
    app: [
      'webpack/hot/dev-server', 
      componentsDir.path('test.js')
    ],
  },
  output: {
    path: builtDir.cwd(),
    filename: 'bundle.js',
    publicPath: 'http://localhost:8080/public/',
  },
  devServer: {
    contentBase: publicDir.cwd(),
    publicPath: 'http://localhost:8080/public/',
    hot: true,
    inline: true    
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.less$/,
      loader: 'style-loader!css-loader!less-loader'
    }]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}

module.exports = config;