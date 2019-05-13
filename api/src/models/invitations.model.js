const invitationSchema = (joi) => ({
  id: joi.objectId(),
  invitationType: joi.string().required(),
  invitation: joi.string().required(),
  invitationInEmail: joi.string().email().required(),
  invitationOutEmail: joi.string().email().required(),
  invitationInName: joi.string(),
  invitationOutName: joi.string(),
  invitationEntryDate: joi.string(),
  invitationSeen: joi.number().interger(),
})

module.exports = invitationSchema
