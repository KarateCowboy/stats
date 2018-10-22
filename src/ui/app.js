const feathers = require('@feathersjs/feathers')
const Rest = require('@feathersjs/rest-client')
const auth = require('@feathersjs/authentication-client')

const app = feathers()

const NumbersClient = Rest(STATS_HOST + '/api/numbers')

app.configure(NumbersClient.jquery($))
app.configure(auth())

global.app = app

//component requires
global.DownloadsByWeek = require('./components/downloads')
