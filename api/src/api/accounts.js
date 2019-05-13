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

  app.post('/accounts/login', (req, res, next) => {
    Promise.all([
      repo.getAccountByEmail(req.body.email),
    ]).then(([user]) => {
      if(!user){
        res.status(status.OK).json(responseTemplate(false, {message: "Wrong email or password"}))
      }else if(helper.comparePassword(req.body.password, user.password)){
        const newToken = helper.createToken(user)
        repo.addCredentials(user.email, newToken)
        .then(() => {
          res.status(status.OK).json(responseTemplate(true, {
            token: newToken, message: 'Logged in succesfully', user: user
          }))
        }).catch((error) => {
          res.status(status.OK).json(responseTemplate(false, {message: error}))
        })
      }else{
        res.status(status.OK).json(responseTemplate(false, {message: "Wrong email or password"}))
      }
    }).catch((err) => {
      res.status(status.OK).json(responseTemplate(false, {message: err}))
    })
  })

  app.post('/accounts/signup', (req, res, next) => {
    console.log('------ /accounts/signup --------', `body: ${JSON.stringify(req.body)}`)
    const pendingUser = Object.assign(req.body, {
      password: req.body.password ? helper.createPassword(req.body.password) : ''
    })
    models.validate(pendingUser, 'user')
    .then((pendingUser) => {
      console.log('------ /accounts/signup --------', `validated: ${JSON.stringify(pendingUser)}`)
      repo.getEmailExists(pendingUser.email)
      .then((exits) => {
        console.log('------ /accounts/signup --------', `exits: ${exits}`)
        repo.addAccount(pendingUser)
        .then((newUser) => {
          console.log('------ /accounts/signup --------', `newUser: ${JSON.stringify(newUser)}`)
          const newToken = helper.createToken(newUser)
          repo.addCredentials(newUser.email, newToken)
          .then(() => {
            console.log('------ /accounts/signup --------', `Your new account was succesfully created : ${JSON.stringify(newToken)}`)
            res.status(status.OK).json(responseTemplate(true, {
              token: newToken, message: 'Your new account was succesfully created'
            }))
          }).catch((error) => {
            res.status(status.OK).json(responseTemplate(false, {message: error}))
          })
        })
      }).catch((error) => res.status(status.OK).json(responseTemplate(false, {message: error})))
    }).catch((error) => res.status(status.OK).json(responseTemplate(false, {message: error})))
  });

  app.get('/accounts/info', (req, res, next) => {
    repo.getAccountByEmail(req.query.email).then(user => {
      res.status(status.OK).json(user)
    }).catch(next)
  });

  app.get('/accounts/profile', (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(403).send('Your request has no authorization header.');
    }

    const token = req.headers.authorization.musicapp(' ')[1];

    var payload = jwt.decode(token, hash);

    repo.getAccountByEmail(payload.email).then(user => {
      res.status(status.OK).json(responseTemplate(true, { user: user }));
    }).catch(next)
  });

  app.post('/accounts/single/profile', (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(403).send('Your request has no authorization header.');
    }

    const token = req.headers.authorization.musicapp(' ')[1];
    var payload = jwt.decode(token, hash);

    repo.getAccountByEmail(req.body.email).then(user => {
      res.status(status.OK).json(responseTemplate(true, { user: user }));
    }).catch(next)
  });

  app.get('/accounts/all', (req, res, next) => {
    const payLoads = {
      success: true,
      data: req.headers.authorization,
      message: 'Success'
    }
    
    //return res.json(payLoads)
    if (!req.headers.authorization) {
      return res.status(403).send('Your request has no authorization header.');
    }

    const token = req.headers.authorization.musicapp(' ')[1];

    var payload = jwt.decode(token, hash);

    repo.getAllAccounts().then(user => {
      res.status(status.OK).json(responseTemplate(true, { user: user }));
    }).catch(next)
  });

  app.put('/accounts/profile', (req, res, next) => {
    // Update
    if (!req.headers.authorization) {
      return res.status(403).send('Your request has no authorization header.');
    }

    const token = req.headers.authorization.musicapp(' ')[1];
    var payload = jwt.decode(token, hash);

    repo.updateProfile(payload.email, req.body).then(user => {
      res.status(status.OK).json(responseTemplate(true, { user: user }));
    }).catch(next)
  });

  app.put('/accounts/reset/password', (req, res, next) => {
    // Update
    if (!req.headers.authorization) {
      return res.status(403).send('Your request has no authorization header.');
    }

    const token = req.headers.authorization.musicapp(' ')[1];

    var payload = jwt.decode(token, hash);
    const pendingUserPassword = Object.assign(req.body, {
      password: req.body.password ? helper.createPassword(req.body.password) : ''
    })
    repo.updateProfile(payload.email, pendingUserPassword).then(user => {
      res.status(status.OK).json(responseTemplate(true, { user: user }));
    }).catch(next)
  });

  app.post('/accounts/reset/password', (req, res, next) => {
    Promise.all([
      repo.getAccountByEmail(req.body.email),
    ]).then(([user]) => {
      if(!user){
        res.status(status.OK).json(responseTemplate(false, {message: "There is no accounts with this email address."}))
      }else{
        const newToken = helper.createToken(user)
        repo.addCredentials(user.email, newToken)
        .then(() => {
          res.status(status.OK).json(responseTemplate(true, {
            token: newToken, message: 'User data returned', user: user
          }))
        }).catch((error) => {
          res.status(status.OK).json(responseTemplate(false, {message: error}))
        })
      }
    }).catch((err) => {
      res.status(status.OK).json(responseTemplate(false, {message: err}))
    })
  });


  app.post('/accounts/reset/songs_participated', (req, res, next) => {

    repo.getAccountByEmail(req.body.collaboratorInvitedEmail)
    .then(response5 => {
      response5.songsParticipated = [];

      repo.updateProfile(req.body.collaboratorInvitedEmail,response5)
      .then(response6 => {

        const payLoad6 = {
          success: true,
          data: response5,
          message: 'Success'
        }
        return res.json(payLoad6);

      }).catch(err => {
        res.json({
          success: false,
          message: `error ${err}`
        })
      });
        
    }).catch(err => {
      res.json({
        success: false,
        message: `error ${err}`
      })
    })
  });
}
