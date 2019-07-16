const path = require('path')
const webpack = require('webpack')
const {VueLoaderPlugin} = require('vue-loader')

module.exports = {
  mode: 'development',
  entry: './src/ui/app.js',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      STATS_HOST: JSON.stringify(process.env.STATS_HOST)
    }),
    new VueLoaderPlugin()
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  }
}
