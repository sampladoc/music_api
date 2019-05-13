const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyparser = require('body-parser')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const apiAccounts = require('../api/accounts');
const apiNotifications = require('../api/notifications');
const apiInvitations = require('../api/invitations');
const apiFriends = require('../api/friends');
const apiMedia = require('../api/media');
const apiSongs =  require('../api/songs');
const showExplorer = true;

const start = (options) => {
  return new Promise((resolve, reject) => {
    if (!options.repo) {
      reject(new Error('The server must be started with a connected repository'))
    }
    if (!options.port) {
      reject(new Error('The server must be started with an available port'))
    }

    const app = express()
    app.use(morgan('dev'))
    app.use(bodyparser.urlencoded({ extended: false }));
    app.use(bodyparser.json());
    app.use(cors())
    app.use(helmet())
    app.use((err, req, res, next) => {
      reject(new Error('Something went wrong!, err:' + err))
      res.status(500).send('Something went wrong!')
      next()
    })

    apiAccounts(app, options)
    apiNotifications(app, options)
    apiFriends(app, options)
    apiInvitations(app, options)
    apiMedia(app, options)
    apiSongs(app, options)

    
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, showExplorer));

    const server = app.listen(options.port, () => resolve(server))
  })
}

module.exports = Object.assign({}, {start})
