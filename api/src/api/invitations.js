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
  
  app.get('/healthz', (req, res, next) => {
    res.status(status.OK).end()
  })

  app.post('/invitations/add', (req, res, next) => {
    
    repo.makeInvitation(req.body)
    .then(response => {
      const payLoad = {
        success: true,
        data: response,
        message: 'Success'
      }
      
      return res.json(payLoad)
      /*
      repo.getAllNotifcations().then((noti) => {
        if(err){
          return res.status(200).send(res.json({
            success: false,
            message: err,
          }));
        }
        
        const payLoad = {
          success: true,
          data: noti,
          message: 'Success'
        }
        
        return res.json(payLoad)
      }).catch(err => {
        res.json({
          success: false,
          message: `error ${err}`
        })
      })
      */
    }).catch(err => {
      res.json({
        success: false,
        message: `error ${err}`
      })
    })
  })
  //*/
  app.post('/invitations/get', (req, res, next) => {
    repo.getInvitationByOutEmail(req.body.email)
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
  /*
  app.post('/invitations/add', (req, res, next) => {
    const pendingUser = Object.assign(req.body, {
      password: req.body.password ? helper.createPassword(req.body.password) : ''
    })
    models.validate(pendingUser, 'user')
    .then((pendingUser) => {
      repo.getEmailExists(pendingUser.email)
      .then((exits) => {
        repo.addAccount(pendingUser)
        .then((newUser) => {
          const newToken = helper.createToken(newUser)
          repo.addCredentials(newUser.email, newToken)
          .then(() => {
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
  */


  app.post('/invitations/accept-collaboration', (req, res, next) => {
    repo.deleteNotification(req.body.notifyId)
    .then(response1 => {
      const payLoad1 = {
        success: true,
        data: response1,
        message: 'Success'
      }
        repo.makeNotification(req.body.notificationAcceptedObject)
          .then(response2 => {
            const payLoad2 = {
              success: true,
              data: response2,
              message: 'Success'
            }

            repo.getAccountByEmail(req.body.collaboratorInvitedEmail)
            .then(response3 => {
              const payLoad3 = {
                success: true,
                data: response3,
                message: 'Success'
              } 
              
              response3.collaboratorRole = req.body.collaboratorInvitedRole;

              if(req.body.collaboratorInvitedRole == 3){
                response3.collaboratorInvitedLyric = req.body.collaboratorInvitedLyric;
              }
              
              repo.getSong(req.body.songId)
              .then(response4 => {
              
              response4.collaborators.push(response3);

              /* Calculate percent of profit for producers (main producer and co-producers) */

              var totalCollaborators = response4.collaborators.length + 1 /* Plus one for the main Producer */ ;
              var percentPerCollaborator = 50 / totalCollaborators;

              response4.profit = percentPerCollaborator;
              
              for(var c=0; c < totalCollaborators-1; c ++ ){
                response4.collaborators[c].profit = percentPerCollaborator;
              }

              /* End Calculate */

                repo.updateSong(response4._id, response4)
                  .then(response5 => {
                    const payLoad5 = {
                      success: true,
                      data: response5,
                      message: 'Success'
                    }
                    

                    //return res.json(payLoad5);

                    repo.getAccountByEmail(req.body.collaboratorInvitedEmail)
                    .then(response5 => {
                      if(response5.songsParticipated != undefined){
                        response5.songsParticipated.push(req.body.songId)
                      }
                      else{
                        response5.songsParticipated = [];
                        response5.songsParticipated.push(req.body.songId)
                      }

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
                message: `errorS ${err}`
              })
            })

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
  })

  app.post('/invitations/reject-collaboration', (req, res, next) => {
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

        repo.getSong(req.body.songId)
        .then(response2 => {
        
        var collaboratorsInvited = response2.collaboratorsInvited;
        
        response2.collaboratorsInvited.forEach(function(item,index){
          if(item.collaboratorInvitedEmail == req.body.collaboratorInvitedEmail){
            collaboratorsInvited.splice(index,1);
          }
        });

        response2.collaboratorsInvited = collaboratorsInvited;

       /* const payLoad2 = {
          success: true,
          data: response2,
          message: 'Success'
        }

        return res.json(payLoad2)*/

          repo.updateSong(response2._id, response2)
            .then(response => {
              const payLoad3 = {
                success: true,
                data: response,
                message: 'Success'
              }
              
              return res.json(payLoad3);
        
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
  
}
