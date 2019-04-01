const path = require('path')
const UUID = require('uuid-js')
const _ = require('underscore')

var shouldCache = true
if (process.env.LOCAL) {
  shouldCache = false
}

// Setup authentication and user interface components
exports.setup = async (server, db) => {
  // The ADMIN_PASSWORD environment variable must be set
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD not set')
  }

  // The SESSION_SECRET environment variable must be set
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET not set')
  }
  server.register(require('hapi-auth-basic'))

  // Register the server side templates
  server.register(require('vision'))
  server.views({
    engines: {
      html: require('handlebars')
    },
    isCached: shouldCache,
    relativeTo: path.join(__dirname, '..'),
    path: './views',
    partialsPath: './views/partials',
    layoutPath: './views/layout',
    helpersPath: './views/helpers'
  })
  // Single user for now
  const users = {
    admin: {
      id: 'admin',
      password: process.env.ADMIN_PASSWORD,
      name: 'Administrator'
    }
  }

  // Login handler
  const login = async function (request, h) {
    if (request.auth.isAuthenticated) {
      return h.redirect('/dashboard#overview')
    }

    let message = ''
    let account = null

    if (request.method === 'post') {
      if (!request.payload.username || !request.payload.password) {
        message = 'Missing username or password'
      } else {
        account = users[request.payload.username]
        if (!account || account.password !== request.payload.password) {
          message = 'Invalid username or password'
        }
      }
    }

    if (request.method === 'get' || message) {
      return h.view('signin', {message: message})
    }

    const uuid4 = UUID.create()
    const sid = String(uuid4.toString())
    const accountToStore = _.clone(account)
    delete accountToStore.password
    await request.server.app.cache.set(sid, {account: accountToStore}, 0)
    request.cookieAuth.set({sid: sid})
    return h.redirect('/dashboard#overview')
  }

  const logout = function (request, h) {
    request.cookieAuth.clear()
    return h.redirect('/dashboard#overview')
  }

  // Static directory handling
  server.register(require('inert'))

  // Auth library
  server.register(require('hapi-auth-cookie'))

  let cache = require('./catbox-pg').setup(server, {db})
  server.app.cache = cache

  // For local development set LOCAL to true
  var secure = true
  if (process.env.LOCAL) {
    secure = false
  }

  // Auth strategy
  server.auth.strategy('session', 'cookie', {
    password: process.env.SESSION_SECRET,
    cookie: 'sid',
    redirectTo: '/login',
    isSecure: secure,
    validateFunc: async (request, session) => {

      const cached = await cache.get(session.sid)
      const out = {
        valid: !!cached
      }

      if (out.valid) {
        out.credentials = cached.account
      }

      return out
    }
  })
  if(process.env.TEST){
    const scheme = () => {
      return {
        authenticate: (request,h) => {
          return h.authenticated({credentials: { user: 'admin'}})
        }
      }
    }
    server.auth.scheme('test', scheme)
    const validate = (request, username, password ) => { 
      return { isValid: true, credentials: {id: users.admin.id, name: users.admin.name } }
    }
    server.auth.strategy('test', 'test')
     server.auth.default('test', 'test', validate)
  } else {
     server.auth.default('session')
  }
  server.route([
    {
      method: ['GET', 'POST'],
      path: '/login',
      options: {handler: login, auth: {mode: 'try'}, plugins: {'hapi-auth-cookie': {redirectTo: false}}}
    },
    {method: 'GET', path: '/logout', options: {handler: logout}}
  ])

  server.route({
    method: 'GET',
    path: '/dashboard',
    handler: function (request, h) {
      return h.view('dashboard', {
        name: request.auth.credentials.name
      })
    }
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, h) {
      return h.redirect('/dashboard#overview')
    }
  })

  // List of static directories and endpoints
  var statics = [
    ['/bootstrap/{param*}', './node_modules/bootstrap/dist'],
    ['/jquery/{param*}', './node_modules/jquery/dist'],
    ['/local/{param*}', './local'],
    ['/dist/{param*}', './dist'],
    ['/bower/{param*}', './bower_components'],
    ['/ss/{param*}', './node_modules/simple-statistics/dist']
  ]

  statics.forEach((stat) => {
    server.route({
      method: 'GET',
      path: stat[0],
      config: {
        auth: false
      },
      handler: {
        directory: {
          path: stat[1]
        }
      }
    })
  })
}
