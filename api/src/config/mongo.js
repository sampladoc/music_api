const MongoClient = require('mongodb')

const getMongoURL = (options) => {
  return `mongodb://${options.database_server}/${options.db}`
}

const connect = (options, mediator) => {
  mediator.once('boot.ready', () => {
    MongoClient.connect(
      getMongoURL(options), {
      }, (err, db) => {
        if (err) {
          mediator.emit('db.nofound', err)
        }
        mediator.emit('db.ready', db)
      })
  })
}

module.exports = Object.assign({}, {connect})
