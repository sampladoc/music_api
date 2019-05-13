const mediaTemplateSchema = (Joi) => ({
  id: Joi.objectId(),
  userId: Joi.objectId(),
  fileName: Joi.string().allow(''),
  url: Joi.string().uri({ scheme: ['http', 'https'] }).allow(''),
})

module.exports = mediaTemplateSchema
