const http = require('http')

// the rest works just like any other normal HTTP request
exports.setup = async (server) => {

  let numbers_host, numbers_port
  if (!process.env.NUMBERS_HOST) {
    throw new Error('NUMBERS_HOST must be set in environment')
  } else {
    numbers_host = process.env.NUMBERS_HOST || 'localhost'
  }
  if (!process.env.NUMBERS_PORT) {
    throw new Error('NUMBERS_PORT must be set in environment')
  } else {
    numbers_port = process.env.NUMBERS_PORT
  }

  server.route({
    method: 'GET',
    path: '/api/numbers/{anything*}',
    handler: async (request, reply) => {
      const request_url = request.url.path.replace('/api/numbers', '')
      const options = {
        hostname: numbers_host,
        path: request_url,
        port: numbers_port,
        headers: {
          Authorization: `Bearer ${numbers_jwt}`,
          ContentType: 'application/json'
        }
      }
      return new Promise((resolve, reject) => {
        http.get(options, (res) => {
          res.on('error', (err) => {
            reject(err.message)
          })
          res.on('data', (data) => {
            resolve(reply(data))
          })
        })
      })
    }
  })
}