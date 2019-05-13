'use strict'
const {EventEmitter} = require('events')
const server = require('./server/server')
const repository = require('./repository/repository')
const config = require('./config/')
const helper = require('./helpers/')
const models = require('./models')

const mediator = new EventEmitter()

console.log('--- Accounts Service ---')
console.log('Connecting to accounts repository...')

process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception', err)
})

process.on('uncaughtRejection', (err, promise) => {
  console.error('Unhandled Rejection', err)
})

mediator.on('db.ready', (db) => {
  console.error('db.ready')
  let rep
  repository.connect(db)
    .then(repo => {
      console.log('Connected. Starting Server')
      rep = repo
      return server.start({
        port: config.serverSettings.port,
        repo,
        helper,
        models
      })
    })
    .then(app => {
      console.log(`Server started succesfully, running on port: ${config.serverSettings.port}.`)
      app.on('close', () => {
        rep.disconnect()
      })
    })
})

mediator.on('db.error', (err) => {
  console.error('db.error', err)
})

mediator.on('db.nofound', (err) => {
  console.log('ERROR THERE IS NOT DATABASE AVAILABLE')
  console.log(err)
})

config.db.connect(config.dbSettings, mediator)

mediator.emit('boot.ready')
