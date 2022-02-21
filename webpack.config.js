const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.bundle.js',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.tmpl.html',
      hash: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets/img', to: 'img' },
        { from: 'assets/aud', to: 'aud' },
        { from: 'assets/fnt', to: 'fnt' },
      ],
    }),
  ],
  devtool: 'source-map',
  devServer: {
    static: './dist',
    compress: true,
    port: 2022,
  },
};
