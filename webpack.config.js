const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: "development",
  entry: "./src/ui/app.js",
  plugins: [
    new webpack.DefinePlugin({
      STATS_HOST: JSON.stringify(process.env.STATS_HOST)
    })
  ]
}