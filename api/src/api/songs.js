'use strict'

const status = require('http-status');
const jwt = require('jwt-simple');
const { hash } = require('../config');
const {ObjectID} = require('mongodb')

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

  app.post('/songs/add', (req, res, next) => {
    let email = req.body.producerEmail;
    req.body.profit = 50;
    repo.saveNewSong(req.body)
    .then(response => {
      const payLoad = {
        success: true,
        data: response,
        message: 'Success'
      }
      
      return res.json(payLoad)

     /* repo.getLastSong(email)
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
      })*/

    }).catch(err => {
      res.json({
        success: false,
        message: `error ${err}`
      })
    })
  })

  app.post('/songs/update', (req, res, next) => {
    let idSong = req.body.idSong;
    repo.updateSong(req.body.idSong, req.body.song)
    .then(response => {
      const payLoad = {
        success: true,
        data: response,
        message: 'Success'
      }
      
      repo.getSong(idSong)
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

  app.post('/songs/get', (req, res, next) => {
    repo.getSongsByProducerEmail(req.body.email)
    .then(response => {

      for(var i=0; i < response.length; i ++){
        if(response[i].collaborators.length > 0){
          for(var c=0; c < response[i].collaborators.length ; c++){
            var idCollaborator = response[i].collaborators[c]._id;
            var pendingLyrics = response[i].lyrics.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
            var acceptedLyrics = response[i].lyrics.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
            var rejectedLyrics = response[i].lyrics.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length;
            var pendingMedia = response[i].media.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
            var acceptedMedia = response[i].media.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
            var rejectedMedia = response[i].media.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length
            response[i].collaborators[c].pendingLyrics = pendingLyrics; 
            response[i].collaborators[c].acceptedLyrics = acceptedLyrics; 
            response[i].collaborators[c].rejectedLyrics = rejectedLyrics; 
            response[i].collaborators[c].pendingMedia = pendingMedia; 
            response[i].collaborators[c].acceptedMedia = acceptedMedia; 
            response[i].collaborators[c].rejectedMedia = rejectedMedia;
          }
        }
      }

      const payLoad = {
        success: true,
        data: response,
        message: 'Success'
      }
      

      //return res.json(payLoad)

      repo.getAccountByEmail(req.body.email)
      .then(response2 => {
        if(response2.songsParticipated != undefined){
          if(response2.songsParticipated.length > 0){
            repo.getSongsParticipated(response2.songsParticipated)
            .then(response3 => {

              for(var i=0; i < response3.length; i ++){
                var role = response3[i].collaborators.find(x => x.email === req.body.email).collaboratorRole;
                var idCollaborator = response3[i].collaborators.find(x => x.email === req.body.email)._id;
                switch(role) { 
                  case "1": { 
                    response3[i].role = "producer";
                    break; 
                  } 
                  case "2": { 
                    response3[i].role = "song_writer";
                    break; 
                  } 
                  case "3": { 
                    response3[i].role = "co_writer"; 
                    break; 
                 } 
               } 
                
                response3[i].idCollaborator = idCollaborator;
              }

              const payLoad2 = {
                success: true,
                data: response.concat(response3),
                message: 'Success'
              }
              return res.json(payLoad2);
            }).catch(err => {
              res.json({
                success: false,
                message: `error ${err}`
              })
            })

          }
          else{
            return res.json(payLoad);
          }
        }
        else{
          return res.json(payLoad);
        }
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
  })

  app.post('/songs/deleteall', (req, res, next) => {
    const payLoads = {
      success: true,
      data: req.body,
      message: 'Success'
    }
    
    //return res.json(payLoads)
    repo.deleteAllSongs(req.body)
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

  app.post('/songs/invite-collaborator', (req, res, next) => {
    repo.inviteCollaborator(req.body)
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

  app.post('/songs/invite-cowriter', (req, res, next) => {
    repo.inviteCoWriter(req.body)
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

  app.post('/songs/update-id-lyrics', (req, res, next) => {
    repo.getSong(req.body.idSong)
    .then(response => {

      response.lyrics.forEach(function(item,index){
        response.lyrics[index].id = new ObjectID();
      });

      repo.updateSong(req.body.idSong, response)
      .then(response1 => {
        const payLoad = {
          success: true,
          data: response1,
          message: 'Success'
        }
        
        repo.getSong(req.body.idSong)
        .then(response2 => {
          const payLoad2 = {
            success: true,
            data: response2,
            message: 'Success'
          }
          return res.json(payLoad2)
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

  app.post('/songs/update-profits', (req, res, next) => {
    repo.updateSongsProfits()
      .then(response1 => {
        const payLoad = {
          success: true,
          data: response1,
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

  app.post('/songs/add-lyric', (req, res, next) => {
    repo.getSong(req.body.idSong)
    .then(response => {
      req.body.lyric.id = new ObjectID();
      response.lyrics.push(req.body.lyric);

      repo.updateSong(req.body.idSong, response)
      .then(response1 => {
        const payLoad = {
          success: true,
          data: response1,
          message: 'Success'
        }
        
        repo.getSong(req.body.idSong)
        .then(response2 => {
          var role = response2.collaborators.find(x => x.email === req.body.email).role;
          response2.role = role;
          response2.idCollaborator = req.body.lyric.idCollaborator;

          const payLoad2 = {
            success: true,
            data: response2,
            message: 'Success'
          }
          return res.json(payLoad2)
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

  app.post('/songs/add-lyric-change', (req, res, next) => {
    repo.getSong(req.body.idSong)
    .then(response => {
      req.body.lyricChange.id = new ObjectID();

      let lyric = response.lyrics.find(x => x.id == req.body.idLyric);

      if(lyric.hasOwnProperty('pendingChanges')){
        lyric.pendingChanges.push(req.body.lyricChange);
      }
      else{
        lyric.pendingChanges = [];
        lyric.pendingChanges.push(req.body.lyricChange);
      }

      repo.updateSong(req.body.idSong, response)
      .then(response1 => {
        const payLoad = {
          success: true,
          data: response1,
          message: 'Success'
        }
        
        repo.getSong(req.body.idSong)
        .then(response2 => {
          var role = response2.collaborators.find(x => x.email === req.body.email).collaboratorRole;
          response2.role = role;
          response2.idCollaborator = req.body.lyricChange.idCollaborator;

          const payLoad2 = {
            success: true,
            data: response2,
            message: 'Success'
          }
          return res.json(payLoad2)
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

  app.post('/songs/add-media', (req, res, next) => {
    repo.getSong(req.body.idSong)
    .then(response => {

      response.media.push(req.body.media);

      repo.updateSong(req.body.idSong, response)
      .then(response1 => {
        const payLoad = {
          success: true,
          data: response1,
          message: 'Success'
        }
        
        repo.getSong(req.body.idSong)
        .then(response2 => {
          var role = response2.collaborators.find(x => x.email === req.body.email).role;
          response2.role = role;
          response2.idCollaborator = req.body.media.idCollaborator;

          const payLoad2 = {
            success: true,
            data: response2,
            message: 'Success'
          }
          return res.json(payLoad2)
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


  app.post('/songs/reject-lyric', (req, res, next) => {
    repo.getSong(req.body.idSong)
    .then(response => {
      var lyric = response.lyrics.find(x => x.id == req.body.idLyric);
      var lyricIndex = response.lyrics.findIndex(x => x.id == req.body.idLyric);

      lyric.status = 2;
      lyric.reason = req.body.reasonRejected;

      response.lyrics[lyricIndex] = lyric;

      repo.updateSong(req.body.idSong, response)
      .then(response1 => {
        const payLoad = {
          success: true,
          data: response1,
          message: 'Success'
        }
        repo.makeNotification(req.body.notificationObject)
        .then(response2 => {
          const payLoad2 = {
            success: true,
            data: response2,
            message: 'Success'
          }
        
            repo.getSong(req.body.idSong)
            .then(response3 => {

              if(response3.collaborators.length > 0){
                for(var c=0; c < response3.collaborators.length ; c++){
                  var idCollaborator = response3.collaborators[c]._id;
                  var pendingLyrics = response3.lyrics.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
                  var acceptedLyrics = response3.lyrics.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
                  var rejectedLyrics = response3.lyrics.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length;
                  var pendingMedia = response3.media.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
                  var acceptedMedia = response3.media.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
                  var rejectedMedia = response3.media.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length
                  response3.collaborators[c].pendingLyrics = pendingLyrics; 
                  response3.collaborators[c].acceptedLyrics = acceptedLyrics; 
                  response3.collaborators[c].rejectedLyrics = rejectedLyrics; 
                  response3.collaborators[c].pendingMedia = pendingMedia; 
                  response3.collaborators[c].acceptedMedia = acceptedMedia; 
                  response3.collaborators[c].rejectedMedia = rejectedMedia;
                }
              }
              
              const payLoad3 = {
                success: true,
                data: response3,
                message: 'Success'
              }
            return res.json(payLoad3)
      
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


  app.post('/songs/reject-lyric-change', (req, res, next) => {
    repo.getSong(req.body.idSong)
    .then(response => {
      var lyric = response.lyrics.find(x => x.id == req.body.idLyric);
      var lyricIndex = response.lyrics.findIndex(x => x.id == req.body.idLyric);
      var lyricPendingChange = lyric.pendingChanges.find(x => x.id == req.body.idPendingChange);

      var lyricPendingChangeIndex = lyric.pendingChanges.findIndex(x => x.id == req.body.idPendingChange);

      lyricPendingChange.status = 2;
      lyricPendingChange.reason = req.body.reasonRejected;
      lyric.pendingChanges[lyricPendingChangeIndex] = lyricPendingChange;

      response.lyrics[lyricIndex] = lyric;

      repo.updateSong(req.body.idSong, response)
      .then(response1 => {
        const payLoad = {
          success: true,
          data: response1,
          message: 'Success'
        }
        repo.makeNotification(req.body.notificationObject)
        .then(response2 => {
          const payLoad2 = {
            success: true,
            data: response2,
            message: 'Success'
          }
        
            repo.getSong(req.body.idSong)
            .then(response3 => {

              if(response3.collaborators.length > 0){
                for(var c=0; c < response3.collaborators.length ; c++){
                  var idCollaborator = response3.collaborators[c]._id;
                  var pendingLyrics = response3.lyrics.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
                  var acceptedLyrics = response3.lyrics.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
                  var rejectedLyrics = response3.lyrics.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length;
                  var pendingMedia = response3.media.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
                  var acceptedMedia = response3.media.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
                  var rejectedMedia = response3.media.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length
                  response3.collaborators[c].pendingLyrics = pendingLyrics; 
                  response3.collaborators[c].acceptedLyrics = acceptedLyrics; 
                  response3.collaborators[c].rejectedLyrics = rejectedLyrics; 
                  response3.collaborators[c].pendingMedia = pendingMedia; 
                  response3.collaborators[c].acceptedMedia = acceptedMedia; 
                  response3.collaborators[c].rejectedMedia = rejectedMedia;
                }
              }
              
              const payLoad3 = {
                success: true,
                data: response3,
                message: 'Success'
              }
            return res.json(payLoad3)
      
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

  app.post('/songs/reject-media', (req, res, next) => {
    repo.getSong(req.body.idSong)
    .then(response => {
      var media = response.media.find(x => x.id == req.body.idMedia);
      var mediaIndex = response.media.findIndex(x => x.id == req.body.idMedia);

      media.status = 2;
      media.reason = req.body.reasonRejected;

      response.media[mediaIndex] = media;

      repo.updateSong(req.body.idSong, response)
      .then(response1 => {
        const payLoad = {
          success: true,
          data: response1,
          message: 'Success'
        }
        repo.makeNotification(req.body.notificationObject)
        .then(response2 => {
          const payLoad2 = {
            success: true,
            data: response2,
            message: 'Success'
          }
        
            repo.getSong(req.body.idSong)
            .then(response3 => {

              if(response3.collaborators.length > 0){
                for(var c=0; c < response3.collaborators.length ; c++){
                  var idCollaborator = response3.collaborators[c]._id;
                  var pendingLyrics = response3.lyrics.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
                  var acceptedLyrics = response3.lyrics.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
                  var rejectedLyrics = response3.lyrics.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length;
                  var pendingMedia = response3.media.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
                  var acceptedMedia = response3.media.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
                  var rejectedMedia = response3.media.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length
                  response3.collaborators[c].pendingLyrics = pendingLyrics; 
                  response3.collaborators[c].acceptedLyrics = acceptedLyrics; 
                  response3.collaborators[c].rejectedLyrics = rejectedLyrics; 
                  response3.collaborators[c].pendingMedia = pendingMedia; 
                  response3.collaborators[c].acceptedMedia = acceptedMedia; 
                  response3.collaborators[c].rejectedMedia = rejectedMedia;
                }
              }

              const payLoad3 = {
                success: true,
                data: response3,
                message: 'Success'
              }
            return res.json(payLoad3)
      
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

  app.post('/songs/accept-lyric', (req, res, next) => {
    repo.getSong(req.body.idSong)
    .then(response => {
      var lyric = response.lyrics.find(x => x.id == req.body.idLyric);
      var lyricIndex = response.lyrics.findIndex(x => x.id == req.body.idLyric);

      lyric.status = 1;

      response.lyrics[lyricIndex] = lyric;

      repo.updateSong(req.body.idSong, response)
      .then(response1 => {
        const payLoad = {
          success: true,
          data: response1,
          message: 'Success'
        }
        repo.makeNotification(req.body.notificationObject)
        .then(response2 => {
          const payLoad2 = {
            success: true,
            data: response2,
            message: 'Success'
          }
        
            repo.getSong(req.body.idSong)
            .then(response3 => {

              if(response3.collaborators.length > 0){
                for(var c=0; c < response3.collaborators.length ; c++){
                  var idCollaborator = response3.collaborators[c]._id;
                  var pendingLyrics = response3.lyrics.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
                  var acceptedLyrics = response3.lyrics.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
                  var rejectedLyrics = response3.lyrics.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length;
                  var pendingMedia = response3.media.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
                  var acceptedMedia = response3.media.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
                  var rejectedMedia = response3.media.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length
                  response3.collaborators[c].pendingLyrics = pendingLyrics; 
                  response3.collaborators[c].acceptedLyrics = acceptedLyrics; 
                  response3.collaborators[c].rejectedLyrics = rejectedLyrics; 
                  response3.collaborators[c].pendingMedia = pendingMedia; 
                  response3.collaborators[c].acceptedMedia = acceptedMedia; 
                  response3.collaborators[c].rejectedMedia = rejectedMedia;
                }
              }

              const payLoad3 = {
                success: true,
                data: response3,
                message: 'Success'
              }
            return res.json(payLoad3)
      
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


  app.post('/songs/accept-lyric-change', (req, res, next) => {
    repo.getSong(req.body.idSong)
    .then(response => {
      var lyric = response.lyrics.find(x => x.id == req.body.idLyric);
      var lyricIndex = response.lyrics.findIndex(x => x.id == req.body.idLyric);
      var lyricPendingChange = lyric.pendingChanges.find(x => x.id == req.body.idPendingChange);
      var lyricPendingChangeIndex = lyric.pendingChanges.findIndex(x => x.id == req.body.idPendingChange);

      lyricPendingChange.status = 1;
      
      lyric.pendingChanges[lyricPendingChangeIndex] = lyricPendingChange;
      lyric.title = lyricPendingChange.title;
      lyric.lyric = lyricPendingChange.lyric;

      response.lyrics[lyricIndex] = lyric;

      repo.updateSong(req.body.idSong, response)
      .then(response1 => {
        const payLoad = {
          success: true,
          data: response1,
          message: 'Success'
        }
        repo.makeNotification(req.body.notificationObject)
        .then(response2 => {
          const payLoad2 = {
            success: true,
            data: response2,
            message: 'Success'
          }
        
            repo.getSong(req.body.idSong)
            .then(response3 => {

              if(response3.collaborators.length > 0){
                for(var c=0; c < response3.collaborators.length ; c++){
                  var idCollaborator = response3.collaborators[c]._id;
                  var pendingLyrics = response3.lyrics.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
                  var acceptedLyrics = response3.lyrics.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
                  var rejectedLyrics = response3.lyrics.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length;
                  var pendingMedia = response3.media.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
                  var acceptedMedia = response3.media.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
                  var rejectedMedia = response3.media.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length
                  response3.collaborators[c].pendingLyrics = pendingLyrics; 
                  response3.collaborators[c].acceptedLyrics = acceptedLyrics; 
                  response3.collaborators[c].rejectedLyrics = rejectedLyrics; 
                  response3.collaborators[c].pendingMedia = pendingMedia; 
                  response3.collaborators[c].acceptedMedia = acceptedMedia; 
                  response3.collaborators[c].rejectedMedia = rejectedMedia;
                }
              }

              const payLoad3 = {
                success: true,
                data: response3,
                message: 'Success'
              }
            return res.json(payLoad3)
      
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

  app.post('/songs/accept-media', (req, res, next) => {
    repo.getSong(req.body.idSong)
    .then(response => {
      var media = response.media.find(x => x.id == req.body.idMedia);
      var mediaIndex = response.media.findIndex(x => x.id == req.body.idMedia);

      media.status = 1;

      response.media[mediaIndex] = media;

      repo.updateSong(req.body.idSong, response)
      .then(response1 => {
        const payLoad = {
          success: true,
          data: response1,
          message: 'Success'
        }
        repo.makeNotification(req.body.notificationObject)
        .then(response2 => {
          const payLoad2 = {
            success: true,
            data: response2,
            message: 'Success'
          }
        
            repo.getSong(req.body.idSong)
            .then(response3 => {

              if(response3.collaborators.length > 0){
                for(var c=0; c < response3.collaborators.length ; c++){
                  var idCollaborator = response3.collaborators[c]._id;
                  var pendingLyrics = response3.lyrics.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
                  var acceptedLyrics = response3.lyrics.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
                  var rejectedLyrics = response3.lyrics.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length;
                  var pendingMedia = response3.media.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
                  var acceptedMedia = response3.media.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
                  var rejectedMedia = response3.media.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length
                  response3.collaborators[c].pendingLyrics = pendingLyrics; 
                  response3.collaborators[c].acceptedLyrics = acceptedLyrics; 
                  response3.collaborators[c].rejectedLyrics = rejectedLyrics; 
                  response3.collaborators[c].pendingMedia = pendingMedia; 
                  response3.collaborators[c].acceptedMedia = acceptedMedia; 
                  response3.collaborators[c].rejectedMedia = rejectedMedia;
                }
              }

              const payLoad3 = {
                success: true,
                data: response3,
                message: 'Success'
              }
            return res.json(payLoad3)
      
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
  
  app.post('/songs/get-song', (req, res, next) => {
    repo.getSong(req.body.nid)
    .then(response => {
      for(var c=0; c < response.collaborators.length ; c++){
        var idCollaborator = response.collaborators[c]._id;
        var pendingLyrics = response.lyrics.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
        var acceptedLyrics = response.lyrics.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
        var rejectedLyrics = response.lyrics.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length;
        var pendingMedia = response.media.filter(x => x.status == 0 && x.idCollaborator == idCollaborator).length;
        var acceptedMedia = response.media.filter(x => x.status == 1 && x.idCollaborator == idCollaborator).length;
        var rejectedMedia = response.media.filter(x => x.status == 2 && x.idCollaborator == idCollaborator).length
        response.collaborators[c].pendingLyrics = pendingLyrics; 
        response.collaborators[c].acceptedLyrics = acceptedLyrics; 
        response.collaborators[c].rejectedLyrics = rejectedLyrics; 
        response.collaborators[c].pendingMedia = pendingMedia; 
        response.collaborators[c].acceptedMedia = acceptedMedia; 
        response.collaborators[c].rejectedMedia = rejectedMedia;
      }
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

  app.post('/songs/get-collaborator', (req, res, next) => {
    repo.getSong(req.body.songId)
    .then(response => {
      var collaborator;
      for(var c=0; c < response.collaborators.length ; c++){
        if(response.collaborators[c].email == req.body.collaboratorEmail){
          collaborator = response.collaborators[c];
        }
      }

      const payLoad = {
        success: true,
        data: collaborator,
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

  /*app.post('/songs/delete', (req, res, next) => {
    repo.deleteSong(req.body.nid)
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
  })*/
  
}
