const joi = require('joi')
joi.objectId = require('joi-objectid')(joi);

const user = require('./user.model')(joi)
const mediaTemplate = require('./media_template.model')(joi)

const schemas = Object.create({user})

const schemaValidator = (object, type) => {
  return new Promise((resolve, reject) => {
    if (!object) {
      reject('object to validate not provided')
    }
    if (!type) {
      reject('schema type to validate not provided')
    }

    const {error, value} = joi.validate(object, schemas[type])

    if (error) {
      reject(`${error.details[0].message}`)
    }
    resolve(value)
  })
}

module.exports = Object.create({validate: schemaValidator, schemas})
