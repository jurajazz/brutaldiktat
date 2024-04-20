const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require ('copy-webpack-plugin');
const path = require('path');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      title: 'Diktatik with webpack',
      header: 'Diktatik',
      metaDesc: 'Diktatik aplikacia',
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body'
    }),
    new CopyWebpackPlugin({ 
      patterns: [ 
       // relative path is from src
       { from: './assets/favicon.ico', to: "assets" }, // <- your path to favicon
       { from: './assets/diktat-data.yaml', to: "assets" }, // <- your path to favicon
      ]
   })
  ],
  mode: 'development',
  output: {
    clean: true
  },
  devServer: {
    static: './dist',
    open: true
  },
  module: {
    rules: [
      {
        test: /\.(jpg|png)$/,
        use:
        {
          loader: 'url-loader',
        },
        type: 'javascript/auto'
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ya?ml$/,
        use: 'yaml-loader',
        // Webpack v4, you'll need to set the rule to have type: "json".
        // see https://github.com/eemeli/yaml-loader/blob/master/README.md
        type: 'json'
      },
    ]
  },
};

