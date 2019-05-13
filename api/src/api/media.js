'use strict'
const status = require('http-status')
const { uploaderMedia, urlMedia, uploaderImage } = require('../modules/aws');
module.exports = (app, options) => {
  const { repo } = options

  app.get('/healthz', (req, res, next) => {
    res.status(status.OK).end()
  })
  app.post('/media_image/upload', (req, res, next) => {
    uploaderImage(req, res, (err) => {
      if(err){
        return res.status(200).send(res.json({
          success: false,
          message: err,
        }));
      }
      const payLoad = {
        success: true,
        data: {url: req.file.location},
        message: 'Success'
      }
      return res.json(payLoad)
    })
  })
  app.post('/media_template/upload', (req, res, next) => {
    repo.makeEmptyMediaTemplate()
    .then(response => {
      uploaderMedia(response._id.toString(), req, res, (err) => {
        if(err){
          return res.status(200).send(res.json({
            success: false,
            message: err,
          }));
        }
        const mediaTemplate = {
          id: response._id,
          fileName: req.file.originalname,
          url: urlMedia(response._id.toString()),
        }
        const payLoad = {
          success: true,
          data: mediaTemplate,
          message: 'Success'
        }
        repo.updateMediaTemplate(mediaTemplate)
        .then(result => {
          console.log(`Media Template ${mediaTemplate.id} Updated`)
        })
        .catch(err => console.log(`Media Template ${mediaTemplate.id} error`))
        return res.json(payLoad)
      })
    }).catch(err => {
      res.json({
        success: false,
        message: `error ${err}`
      })
    })
  })
  app.post('/media_template', (req, res, next) => {
    const user = req.body.userId;
    const medias = req.body.medias;

    repo.addToUserMediaTemplates(user, medias)
    .then((result) => {
      res.json({
        success: true,
        message: 'Success'
      })
    })
    .catch((err) => {
      res.json({
        success: false,
        message: `error ${err}`
      })
    })
  })
  app.get('/media_template/:id', (req, res, next) => {
    const user = req.params.id;
    repo.getUserMediaTemplates(user)
    .then((result) => {
      result = result.map(template =>
        Object.assign(template, {url: urlMedia(template.id.toString())})
      )
      res.json({
        success: true,
        message: 'Success',
        data: result,
      })
    })
    .catch((err) => {
      res.json({
        success: false,
        message: `error ${err}`
      })
    })
  })
}
