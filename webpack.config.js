var path = require('path');
var GasPlugin = require("gas-webpack-plugin");
module.exports = {
  context: __dirname,
  entry: './main.js',
  output: {
    filename: 'bundle/index.gs'
  },
  module: {
    noParse: [
        /mycrypto/,
        /myrequest/,
        /request/,
        /crypto/,
        /crypto-browserify/
    ],
    loaders: [
      {
        test: /\.js$/,
        exclude: [
            /request/,
            /crypto/,
            /crypto-browserify/
        ]
      }
    ]
  },
  plugins: [
    new GasPlugin()
  ]
};
