'use strict'
const {ObjectID} = require('mongodb')
const mediaTemplate = 'media_template'

const repository = (db) => {
  const collection = db.collection('users') 


  const getAllAccounts = () => {
    return new Promise((resolve, reject) => {
      const projection = {
        _id: 1,
        id: 1,
        email: 1,
        role: 1,
        name: 1,
        profilePicture: 1,
        lastName: 1,
        alias: 1,
        birthDate: 1,
        email: 1,
        password: 1,
        phoneNumber: 1,
        fullAddress: 1,
        ascapLink: 1,
        bmiLink: 1,
        sesacLink: 1,
        publisher: 1,
        medias: 1,
        facebookEmail: 1,
        notifications: 1,
        songsParticipated: 1
      };
      //*
      collection.find({}).toArray(function(err, results){
        if (err) {
          reject(`An error occured fetching notifications, err: ${err}`)
        }
        resolve(results)
      })
      //*/
    })
  }

  const addAccount = (user) => {
    return new Promise((resolve, reject) => {
      collection.insertOne(user, (err, newUser) => {
        if (err) {
          reject(`An error occuered registring user, ${err}`)
        }
        resolve(Object.assign(user, {
          id: newUser.insertedId
        }))
      })
    })
  }

  const addCredentials = (email, credential) => {
    return new Promise((resolve, reject) => {
      const sendAccount = (err, account) => {
        if (err || !account) {
          reject(`An error occured adding login to ${email}, err ${err}`)
        }
        resolve(account)
      }
      collection.update({email: email}, {$push: {accessToken: [credential]}}, sendAccount)
    })
  }

  const getAccountByEmail = (email) => {
    return new Promise((resolve, reject) => {
      const projection = {
        _id: 1,
        id: 1,
        email: 1,
        role: 1,
        name: 1,
        profilePicture: 1,
        lastName: 1,
        alias: 1,
        birthDate: 1,
        email: 1,
        password: 1,
        phoneNumber: 1,
        fullAddress: 1,
        ascapLink: 1,
        bmiLink: 1,
        sesacLink: 1,
        publisher: 1,
        medias: 1,
        facebookEmail: 1,
        notifications: 1,
        songsParticipated: 1
      };
      const sendAccount = (err, account) => {
        if (err) {
          reject(`An error occured fetching an account with id: ${id}, err: ${err}`)
        }
        resolve(account)
      }
      collection.findOne({email: email}, projection, sendAccount)
    })
  }

  const updateProfile = (email, fields) => {
    return new Promise((resolve, reject) => {
      const projection = {};
      const sendAccount = (err, account) => {
        if (err) {
          reject(`An error occured fetching an account with id: ${id}, err: ${err}`)
        }
        resolve(account)
      }
      collection.updateOne({email: email}, { $set: fields }, sendAccount)
    })
  }

  const getEmailExists = (email) => {
    return new Promise((resolve, reject) => {
      getAccountByEmail(email).then(user => {
        if(user){
          reject('Email already exits')
        }else{
          resolve(false)
        }
      }).catch(reject)
    })
  }

  const getPhoneNumber = (email) => {
    return new Promise((resolve, reject) => {
      getAccountByEmail(email).then(user => {
        if(user){
          resolve(user.phoneNumber)
        }else{
          reject("No account exists with that email.")
        }
      }).catch(reject)
    })
  }

  const getAccountById = (id) => {
    return new Promise((resolve, reject) => {
      const projection = { _id: 1, id: 1, email: 1, password: 1 }
      const sendAccount = (err, account) => {
        if (err) {
          reject(new Error(`An error occured fetching an account with id: ${id}, err: ${err}`))
        }
        resolve(account)
      }
      collection.findOne({id: id}, projection, sendAccount)
    })
  }

  const makeEmptyMediaTemplate = () => {
    return new Promise((resolve, reject) => {
      const ID = new ObjectID();
      const payload = { _id: ID }
      db.collection(mediaTemplate).insertOne(payload, (err, newMediaTemplate) => {
        if(err){
          reject(new Error('Could not create a new media tempalte, err:' + err))
        }
        resolve(payload)
      })

    })
  }

  const updateMediaTemplate = (object) => {
    return new Promise((resolve, reject) => {
      db.collection(mediaTemplate).update({_id: object.id},{
        user_id: object.userId || '',
        file_name: object.fileName || '',
      }, (err, newMediaTemplate) => {
        if(err){
          reject(new Error('Could not update media tempalte, err:' + err))
        }
        resolve(object)
      })

    })
  }

  const addToUserMediaTemplates = (userId, mediaTemplateID) => {
    return new Promise((resolve, reject) => {
      const arrayIDs = mediaTemplateID.map(id => safeObjectId(id));
      db.collection(mediaTemplate).update(
        {_id: {$in: arrayIDs}},
        {$set: {user_id: safeObjectId(userId)}},
        {multi: true}
      , (err, updates) => {
        if(err){
          reject(new Error('Could not update media tempalte, err:' + err))
        }
        resolve(updates)
      })
    })
  }

  const getUserMediaTemplates = (userId) => {
    return new Promise((resolve, reject) => {
      const mediasTemplates = []
      const cursor = db.collection(mediaTemplate)
        .find({user_id: safeObjectId(userId)})
      const addMediaTemplate = (template) => {
        mediasTemplates.push({
          id: template._id,
          fileName: template.file_name,
        })
      }
      const sendMediasTemplates = (err) => {
        if (err) {
          reject(new Error('An error occured fetching all movies, err:' + err))
        }
        resolve(mediasTemplates.slice())
      }
      cursor.forEach(addMediaTemplate, sendMediasTemplates)
    })
  }

  const deleteMediaTemplate = (id) => {
    return new Promise((resolve, reject) => {
      db.collection(mediaTemplate).remove({_id: id}, (err, newMediaTemplate) => {
        if(err){
          reject(new Error('Could not remove media tempalte, err:' + err))
        }
        resolve(true)
      })
    })
  }

  // ====================================================================================================================================================================
  // ====================================================================================================================================================================

  const friends_collection = db.collection('friends')

  const makeFriend = (friendObject) => {
    return new Promise((resolve, reject) => {
      const ID = new ObjectID();
      const payload = { _id: ID }
      const pendingFriend = Object.assign(friendObject, {
        _id: ID
      })
      friends_collection.insertOne(pendingFriend, (err, newFriendsTemplate) => {
        if(err){
          reject(new Error('Could not create a new friend template, err:' + err))
        }
        resolve(newFriendsTemplate)
      })
      //*/
    })
  }

  const acceptFriend = (friendObject) => {
    return new Promise((resolve, reject) => {
      friends_collection.insertOne(pendingFriend, (err, newFriendsTemplate) => {
        if(err){
          reject(new Error('Could not create a new friend template, err:' + err))
        }
        resolve(newFriendsTemplate)
      })
    })
  } 

  const getFriends = (email) => {
    return new Promise((resolve, reject) => {
      const projection = {
        _id: 1,
        friendIdIn: 1,
        friendIdOut: 1,
        friendInEmail: 1,
        friendOutEmail: 1
      };
      
      friends_collection.find({ $or: [ {friendOutEmail: email}, { friendInEmail: email} ] }, projection).toArray(function(err, results){
        if (err) {
          reject(`An error occured fetching friends, err: ${err}`)
        }
        let emails = results.map(m => m.friendInEmail == email ? m.friendOutEmail : m.friendInEmail);
        resolve(emails);
      })
    })
  }

  const getUsersFriends = (emails) => {
    return new Promise((resolve, reject) => {
      collection.find( { email: { $in: emails } } ).toArray(function(err,results){
        resolve(results);
      })
    });
  } 

  const getFriend = (email) => {
    new Promise((resolve, reject) => {
      const projection = {
        _id: 1,
        friendIdIn: 1,
        friendIdOut: 1,
        friendInEmail: 1,
        friendOutEmail: 1
      };
      
      friends_collection.find({ $or: [ {friendOutEmail: email}, { friendInEmail: email} ] }, projection).toArray(function(err, results){
        if (err) {
          reject(`An error occured fetching friends, err: ${err}`)
        }

        resolve(getUsersFriends(results));
      })
    })
  }

  const dropFriends = (email) => {
    return new Promise((resolve, reject) => {
      friends_collection.remove( { $or: [ {friendOutEmail: email}, { friendInEmail: email} ] },function(err, results){
        if (err) {
          reject(`An error occured deleting friends, err: ${err}`)
        }
        resolve(results)
      })
    })
  }

  //=====================================================================================================================================================================
  //=====================================================================================================================================================================

  const songs_collection = db.collection('songs')

  const saveNewSong = (songObject) => {
    return new Promise((resolve, reject) => {
      const ID = new ObjectID();
      const payload = { _id: ID }
      const pendingSong = Object.assign(songObject, {
        _id: ID
      })
      songs_collection.insertOne(pendingSong, (err, newSongTemplate) => {
        if(err){
          reject(new Error('Could not create a new song template, err:' + err))
        }
        newSongTemplate.id = ID;
        resolve(newSongTemplate.ops[0])
      })
    })
  }

  const getLastSong = (email) => {
    return new Promise((resolve, reject) => {
      const projection = {
        _id: 1,
        title: 1,
        genre: 1,
        status: 1,
        statusImage: 1,
        current: 1,
        idProducer: 1,
        producerEmail: 1,
        isActive: 1,
        media: 1,
        lyrics: 1,
        collaborators: 1,
        collaboratorsInvited: 1,
        profit: 1
      };

      songs_collection.find({producerEmail: email}, projection).limit(1).sort({$natural :-1}).toArray(function(err, results){
        if (err) {
          reject(`An error occured fetching the last Song, err: ${err}`)
        }
        resolve(results[0])
      })
    })
  }

  const getSong = (idSong) => {
    return new Promise((resolve, reject) => {
      const projection = {
        _id: 1,
        title: 1,
        genre: 1,
        status: 1,
        statusImage: 1,
        current: 1,
        idProducer: 1,
        producerEmail: 1,
        isActive: 1,
        media: 1,
        lyrics: 1,
        collaborators: 1,
        collaboratorsInvited: 1,
        profit: 1,
      };

      const sendSong = (err, song) => {
        if (err) {
          reject(`An error occured fetching a song with id: ${id}, err: ${err}`)
        }
        resolve(song)
      }
      songs_collection.findOne({_id: new ObjectID(idSong) }, projection, sendSong)
    })
  }


  const getSongsByProducerEmail = (email) => {
    return new Promise((resolve, reject) => {
      const projection = {
        _id: 1,
        title: 1,
        genre: 1,
        status: 1,
        statusImage: 1,
        current: 1,
        idProducer: 1,
        producerEmail: 1,
        isActive: 1,
        media: 1,
        lyrics: 1,
        collaborators: 1,
        collaboratorsInvited: 1,
        profit: 1,
      };
      
      songs_collection.find({producerEmail: email}, projection).toArray(function(err, results){
        if (err) {
          reject(`An error occured fetching songs, err: ${err}`)
        }
        resolve(results)
      })
    })
  }

  const getSongsParticipated = (idsSongs) => {
    return new Promise((resolve, reject) => {
      var i;

      const projection = {
        _id: 1,
        title: 1,
        genre: 1,
        status: 1,
        statusImage: 1,
        current: 1,
        idProducer: 1,
        producerEmail: 1,
        isActive: 1,
        media: 1,
        lyrics: 1,
        collaborators: 1,
        collaboratorsInvited: 1,
        profit: 1
      };
      
      let songsIds = idsSongs.map(function(item){
        return new ObjectID(item)
      });

      songs_collection.find( { _id: { $in: songsIds } }, projection ).toArray(function(err,results){

        resolve(results);
      })
    })
  }


  const deleteAllSongs = () => {
    return new Promise((resolve, reject) => {
      songs_collection.remove(function(err, results){
        if (err) {
          reject(`An error occured deleting notifications, err: ${err}`)
        }
        resolve(results)
      })
    })
  }

  const updateSong = (idSong,fields) => {
    return new Promise((resolve, reject) => {
      const sendSong = (err, song) => {
        if (err) {
          reject(`An error occured fetching an song with id: ${idSong}, err: ${err}`)
        }
        resolve(song)
      }
      songs_collection.updateOne({_id: new ObjectID(idSong)}, { $set: fields }, sendSong)
    })
  }

  const updateSongsProfits = () => {
    return new Promise((resolve, reject) => {
      
      songs_collection.update({},
        {$set : {"profit":50}},
        {upsert:false,
        multi:true}) 
    })
  }

  //=====================================================================================================================================================================
  //=====================================================================================================================================================================
  const notifications_collection = db.collection('notifications') 

  const makeNotification = (notificationObject) => {
    return new Promise((resolve, reject) => {
      const ID = new ObjectID();
      const payload = { _id: ID }
      const pendingNotification = Object.assign(notificationObject, {
        _id: ID
      })
      notifications_collection.insertOne(pendingNotification, (err, newNotificationsTemplate) => {
        if(err){
          reject(new Error('Could not create a new notifications template, err:' + err))
        }
        resolve(newNotificationsTemplate)
      })
    })
  }

  const getAllNotifcations = () => {
    return new Promise((resolve, reject) => {
      const notifications = []
      const cursor = notifications_collection.find({}, {title: 1, id: 1})
      const addAccount = (account) => {
        notifications.push(account)
      }
      const sendAccounts = (err) => {
        if (err) {
          reject(new Error('An error occured fetching all accounts, err:' + err))
        }
        resolve(cursor)
      }
      sendAccounts()
    })
  }

  const addNotification = (notification) => {
    return new Promise((resolve, reject) => {
      notifications_collection.insertOne(notification, (err, newNotification) => {
        if (err) {
          reject(`An error occuered registring user, ${err}`)
        }
        resolve(Object.assign(notification, {
          id: newNotification.insertedId
        }))
      })
    })
  }
 
  const getNotificationByOutEmail = (email) => {
    return new Promise((resolve, reject) => {
      const projection = {
        _id: 1,
        notificationType: 1,
        notification: 1,
        notificationInEmail: 1,
        notificationOutEmail: 1,
        notificationInName: 1,
        notificationOutName: 1,
        notificationEntryDate: 1,
        notificationIdSong: 1,
        notificationSeen: 1,
        notificationIdLyric: 1,
      };
      
      notifications_collection.find({notificationOutEmail: email}, projection).toArray(function(err, results){
        if (err) {
          reject(`An error occured fetching notifications, err: ${err}`)
        }
        resolve(results)
      })
    })
  }

  const getNotificationByInEmail = (email) => {
    return new Promise((resolve, reject) => {
      const projection = {
        _id: 1,
        notificationType: 1,
        notification: 1,
        notificationInEmail: 1,
        notificationOutEfail: 1,
        notificationInName: 1,
        notificationOutName: 1,
        notificationEntryDate: 1,
        notificationIdSong: 1,
        notificationSeen: 1,
        notificationIdLyric: 1,
      };
      const sendNotification = (err, notification) => {
        if (err) {
          reject(`An error occured fetching notifications, err: ${err}`)
        }
        resolve(notification)
      }
      notifications_collection.find({notificationInEmail: email}, projection).toArray(function(err, results){
        if (err) {
          reject(`An error occured fetching notifications, err: ${err}`)
        }
        resolve(results)
      })
    })
  }

  const deleteNotification = (objectId) => {
    return new Promise((resolve, reject) => {
      notifications_collection.deleteOne( { "_id" : new ObjectID(objectId) },function(err, results){
        if (err) {
          reject(`An error occured deleting notifications, err: ${err}`)
        }
        resolve(results)
      })
    })
  }

  const deleteAllNotifications = () => {
    return new Promise((resolve, reject) => {
      notifications_collection.remove(function(err, results){
        if (err) {
          reject(`An error occured deleting notifications, err: ${err}`)
        }
        resolve(results)
      })
    })
  }

  const deleteAllNotificationByOutEmail = (email) => {
    return new Promise((resolve, reject) => {
      notifications_collection.remove( { "notificationOutEmail" : email },function(err, results){
        if (err) {
          reject(`An error occured deleting notifications, err: ${err}`)
        }
        resolve(results)
      })
    })
  }

  const getProfilesPicturesNotifiers = (notifications) => {
    return new Promise((resolve, reject) => {
      var i; var j;
      
      let emails = notifications.map(m => m.notificationInEmail);

      const projection = {
        email: 1,
        profilePicture: 1,
      };

      collection.find( { email: { $in: emails } }, projection ).toArray(function(err,results){
        for(i=0;i < results.length; i ++){
          for(j=0; j < notifications.length; j++){
            if(notifications[j].notificationInEmail == results[i].email){
              notifications[j].profilePicture = results[i].profilePicture;
            }
          }
          
        }
        resolve(notifications);
      })
    })
  }

  //=====================================================================================================================================================================
  //=====================================================================================================================================================================
  const invitations_collection = db.collection('invitations') 

  const makeInvitation = (invitationObject) => {
    return new Promise((resolve, reject) => {
      const ID = new ObjectID();
      const payload = { _id: ID }
      const pendingInvitation = Object.assign(invitationObject, {
        _id: ID
      })
      //resolve(pendingNotification)
      //*
      invitations_collection.insertOne(pendingInvitation, (err, newInvitationsTemplate) => {
        if(err){
          reject(new Error('Could not create a new notifications template, err:' + err))
        }
        resolve(newInvitationsTemplate)
      })
      //*/

    })
  }

  const getInvitationByOutEmail = (email) => {
    return new Promise((resolve, reject) => {
      const projection = {
        _id: 1,
        invitationType: 1,
        invitation: 1,
        invitationInEmail: 1,
        invitationOutEmail: 1,
        invitationInName: 1,
        invitationOutName: 1,
        invitationEntryDate: 1,
        invitationSeen: 1,
      };
      const sendInvitation = (err, invitation) => {
        if (err) {
          reject(`An error occured fetching invitations, err: ${err}`)
        }
        resolve(invitation)
      }
      invitations_collection.find({email: email}, projection, sendInvitation)
    })
  }


  const disconnect = () => {
    db.close()
  }

  return Object.create({
    addAccount,
    addCredentials,
    getAllAccounts,
    getAccountById,
    getAccountByEmail,
    getEmailExists,
    updateProfile,
    makeEmptyMediaTemplate,
    updateMediaTemplate,
    getUserMediaTemplates,
    addToUserMediaTemplates,
    deleteMediaTemplate,
    disconnect,
    makeFriend,
    acceptFriend,
    getFriends,
    dropFriends,
    getUsersFriends,
    saveNewSong,
    getSong,
    getLastSong,
    getSongsByProducerEmail,
    getSongsParticipated,
    deleteAllSongs,
    updateSong,
    updateSongsProfits,
    makeNotification,
    getNotificationByOutEmail,
    deleteNotification,
    deleteAllNotifications,
    deleteAllNotificationByOutEmail,
    getProfilesPicturesNotifiers,
    makeInvitation,
    getInvitationByOutEmail,
  })
}

const connect = (connection) => {
  return new Promise((resolve, reject) => {
    if (!connection) {
      reject(new Error('connection db not supplied!'))
    }
    resolve(repository(connection))
  })
}

module.exports = Object.assign({}, {connect})
