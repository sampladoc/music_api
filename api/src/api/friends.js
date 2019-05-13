'use strict'

const status = require('http-status');
const jwt = require('jwt-simple');
const { hash } = require('../config');

const responseTemplate = (success, content) => {
  return {
    success,
    data: content
  }
}

module.exports = (app, options) => {
  const {repo, helper, models} = options

  app.get('/healthz', (req, res, next) => {
    res.status(status.OK).end()
  })
  //*
  app.post('/friends/add', (req, res, next) => {
    repo.makeFriend(req.body.nid)
    .then(response => {
      const payLoad = {
        success: true,
        data: response,
        message: 'Success'
      }
      
      return res.json(payLoad)

    }).catch(err => {
      res.json({
        success: false,
        message: `error ${err}`
      })
    })
  })

  app.post('/friends/accept', (req, res, next) => {
    repo.deleteNotification(req.body.notifyId)
    .then(response => {
      const payLoad = {
        success: true,
        data: response,
        message: 'Success'
      }
      
      
      repo.makeNotification(req.body.notificationAcceptedObject)
      .then(response1 => {
        const payLoad1 = {
          success: true,
          data: response1,
          message: 'Success'
        }

        repo.makeFriend(req.body.friendObject)
        .then(response2 => {
          const payLoad2 = {
            success: true,
            data: response,
            message: 'Success'
          }
          
          return res.json(payLoad2)

        }).catch(err => {
          res.json({
            success: false,
            message: `error ${err}`
          })
        })

      }).catch(err => {
        res.json({
          success: false,
          message: `errorS ${err}`
        })
      })

    }).catch(err => {
      res.json({
        success: false,
        message: `error ${err}`
      })
    })
  })

  app.post('/friends/reject', (req, res, next) => {
    repo.deleteNotification(req.body.notifyId)
    .then(response => {
      const payLoad = {
        success: true,
        data: response,
        message: 'Success'
      }
      
      
      repo.makeNotification(req.body.notificationRejectedObject)
      .then(response1 => {
        const payLoad1 = {
          success: true,
          data: response1,
          message: 'Success'
        }

        return res.json(payLoad1)
      }).catch(err => {
        res.json({
          success: false,
          message: `errorS ${err}`
        })
      })

    }).catch(err => {
      res.json({
        success: false,
        message: `error ${err}`
      })
    })
  })

  app.post('/friends/getUsersFriends', (req, res, next) => {
    repo.getUsersFriends(req.body.emails)
    .then(response => {
      const payLoad = {
        success: true,
        data: response,
        message: 'Success'
      }
      
      return res.json(payLoad)

    }).catch(err => {
      res.json({
        success: false,
        message: `error ${err}`
      })
    })
  })

  app.post('/friends/drop', (req, res, next) => {
    
    repo.dropFriends(req.body.email)
    .then(response => {
      const payLoad = {
        success: true,
        data: response,
        message: 'Success'
      }
      
      return res.json(payLoad)

    }).catch(err => {
      res.json({
        success: false,
        message: `error ${err}`
      })
    })
  })
  //*/
  /*app.post('/friends/get', (req, res, next) => {
    const payLoads = {
      success: true,
      data: req.body,
      message: 'Success'
    }
    
    //return res.json(payLoads)
    repo.getFriendsByOutEmail(req.body.email)
    .then(response => {
      const payLoad = {
        success: true,
        data: response,
        message: 'Success'
      }
      
      return res.json(payLoad)
    }).catch(err => {
      res.json({
        success: false,
        message: `errorS ${err}`
      })
    })
  })*/

  app.post('/friends/get', (req, res, next) => {
    const payLoads = {
      success: true,
      data: req.body,
      message: 'Success'
    }

    repo.getFriends(req.body.email)
    .then(response => {
      const payLoad = {
        success: true,
        data: response,
        message: 'Success'
      }
      
      repo.getUsersFriends(response)
      .then(response1 => {
        const payLoad1 = {
          success: true,
          data: response1,
          message: 'Success'
        }

        return res.json(payLoad1)
      }).catch(err => {
        res.json({
          success: false,
          message: `errorS ${err}`
        })
      })

    }).catch(err => {
      res.json({
        success: false,
        message: `errorS ${err}`
      })
    })

  })
}