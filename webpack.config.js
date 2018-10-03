const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: "development",
  entry: "./src/ui/app.js",
  plugins: [
    new webpack.DefinePlugin({
      "STATS_HOST": process.env.STATS_URL || 'http://localhost:8193'
    })
  ]
}