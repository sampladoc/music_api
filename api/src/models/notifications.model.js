const notificationSchema = (joi) => ({
  id: joi.objectId(),
  notificationType: joi.string().required(),
  notification: joi.string().required(),
  notificationInEmail: joi.string().email().required(),
  notificationOutEmail: joi.string().email().required(),
  notificationInName: joi.string(),
  notificationOutName: joi.string(),
  notificationEntryDate: joi.string(),
  notificationSeen: joi.number().interger(),
})

module.exports = notificationSchema
