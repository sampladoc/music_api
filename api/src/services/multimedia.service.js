var request = require('request');

const addMediaTemplate = (medias, userId) => {
  return new Promise((resolve, reject) => {
    request({
        url: `http://${process.env.MULTIMEDIA_SERVICE}/media_template`,
        method: "POST",
        json: true,
        body: {medias, userId}
    }, (error, response, body) => {
          if (error) {
            reject(new Error('An error occured with the multimedia service, err: ' + error))
          }
          resolve(body)
    });
  })
}

const getMediaTemplate = (userId) => {
  return new Promise((resolve, reject) => {
    request({
        url: `http://${process.env.MULTIMEDIA_SERVICE}/media_template/${userId}`,
        method: "GET",
        json: true
    }, (error, response, body) => {
          if (error) {
            reject(new Error('An error occured with the multimedia service, err: ' + error))
          }
          resolve(body)
    });
  })
}

module.exports = Object.assign({}, {addMediaTemplate, getMediaTemplate})
