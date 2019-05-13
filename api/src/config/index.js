const {dbSettings, serverSettings, hash, aws} = require('./config')
const db = require('./mongo')

module.exports = Object.assign({}, {dbSettings, serverSettings, db, hash, aws})
