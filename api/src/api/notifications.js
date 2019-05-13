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
  app.post('/notifications/add', (req, res, next) => {
    
    repo.makeNotification(req.body)
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
  app.post('/notifications/get', (req, res, next) => {
    const payLoads = {
      success: true,
      data: req.body,
      message: 'Success'
    }
    
    //return res.json(payLoads)
    repo.getNotificationByOutEmail(req.body.email)
    .then(response => {
      const payLoad = {
        success: true,
        data: response,
        message: 'Success'
      }
      
      repo.getProfilesPicturesNotifiers(response)
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

  app.post('/notifications/delete', (req, res, next) => {
    const payLoads = {
      success: true,
      data: req.body,
      message: 'Success'
    }
    
    //return res.json(payLoads)
    repo.deleteNotification(req.body)
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
  })

  app.post('/notifications/deleteall', (req, res, next) => {
    const payLoads = {
      success: true,
      data: req.body,
      message: 'Success'
    }
    
    //return res.json(payLoads)
    repo.deleteAllNotifications(req.body)
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
  })

  app.post('/notifications/deleteall', (req, res, next) => {
    const payLoads = {
      success: true,
      data: req.body,
      message: 'Success'
    }
    
    //return res.json(payLoads)
    repo.deleteAllNotificationByOutEmail(req.body.email)
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
  });

  app.get('/notifications/all', (req, res, next) => {
    repo.getAccountByEmail(req.query.email).then(user => {
      res.status(status.OK).json(user)
    }).catch(next)
  });

}
