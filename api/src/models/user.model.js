const userSchema = (joi) => ({
  name: joi.string().regex(/^[a-zA-Z '-]+$/i).required(),
  alias: joi.string().required(),
  lastName: joi.string().regex(/^[a-zA-Z '-]+$/i).required(),
  email: joi.string().email().required(),
  facebookEmail: joi.string().email().allow(''),
  role: joi.string().regex(/\b(?:song_writer|producer)\b/).required(),
  profilePicture: joi.string().uri({ scheme: ['http', 'https'] }).allow(''),
  ascapLink: joi.string().max(70).allow(''),
  bmiLink: joi.string().max(70).allow(''),
  sesacLink: joi.string().max(70).allow(''),
  birthDate: joi.string(),
  password: joi.string().min(5),
  phoneNumber: joi.string(),
  publisher: joi.string(),
  fullAddress: joi.string().allow(''),
  medias: joi.array(),
  notifications: joi.array(),
  accessToken: joi.array().items(joi.object().keys({
    type: joi.string().required(), value: joi.string().required(), until: joi.date().required()
  }))
})

module.exports = userSchema
