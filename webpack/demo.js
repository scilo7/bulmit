const path = require('path');

module.exports = {
  entry: './demo/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../demo')
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './demo'
  },
  resolve: {
    modules: [
      path.resolve('./node_modules')
    ]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
