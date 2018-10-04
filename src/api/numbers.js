const common = require('./common')
var http = require('http')
const jquery = require('jquery')
const feathers = require('@feathersjs/feathers')
// const socketio = require('@feathersjs/socketio-client');
// const io = require('socket.io-client');
const auth = require('@feathersjs/authentication-client')
const Rest = require('@feathersjs/rest-client')

// the rest works just like any other normal HTTP request
exports.setup = async (server, client, mongo) => {

  let numbers_host, numbers_port, numbers_user, numbers_pwd
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
  if (!process.env.NUMBERS_USER) {
    throw new Error('NUMBERS_USER must be set in environment')
  } else {
    numbers_user = process.env.NUMBERS_USER
  }
  if (!process.env.NUMBERS_PWD) {
    throw new Error('NUMBER_PWD must be set in environment')
  } else {
    numbers_pwd = process.env.NUMBERS_PWD
  }
  const numbers_app = feathers()
  const rest_client = Rest('http://' + numbers_host + ':' + numbers_port)
  numbers_app.configure(rest_client.request(require('request')))
  numbers_app.configure(auth())
  const res = await numbers_app.authenticate({
    strategy: 'local',
    email: numbers_user,
    password: numbers_pwd
  })
  const token = res.accessToken

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
          Authorization: `Bearer ${token}`,
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