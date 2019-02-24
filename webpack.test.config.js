const hostname = 'localhost'
const port = '9001'
module.exports = {
  entry: 'mocha-loader!./test/ui/index.js',
  output: {
    filename: 'test.build.js',
    path: __dirname + '/test/ui',
    publicPath: 'http://' + hostname + ':' + port + '/test'
  },
  node: {
    fs: 'empty'
  },
  module: {
    // loaders: [
    //   {
    //     test: /\.js$/,
    //     loaders: ['babel-loader']
    //   },
    //   {
    //     test: /(\.css|\.less)$/,
    //     loader: 'null-loader',
    //     exclude: [
    //       /build/
    //     ]
    //   },
    //   {
    //     test: /(\.jpg|\.jpeg|\.png|\.gif)$/,
    //     loader: 'null-loader'
    //   }
    // ]
  },
  devServer: {
    host: hostname,
    port: port
  }
}
