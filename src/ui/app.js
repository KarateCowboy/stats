
const feathers = require('@feathersjs/feathers')
const Rest = require('@feathersjs/rest-client')

const app = feathers()


const NumbersClient = Rest('http://localhost:3030')

app.configure(NumbersClient.jquery($))

global.app = app

