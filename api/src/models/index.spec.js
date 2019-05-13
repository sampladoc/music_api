/* eslint-env mocha */
const test = require('assert')
const {validate} = require('./')

console.log(Object.getPrototypeOf(validate))

describe('Schemas Validation', () => {

  it('can validate a user object', (done) => {
    const testUser = {
      name: 'John',
      lastName: 'Petrucci',
      email: 'sceneforamemoryrules@dreamtheater.com',
      alias: 'God',
      role: 'producer',
    }

    validate(testUser, 'user')
      .then(value => {
        console.log('validated')
        console.log(value)
        done()
      })
      .catch(err => {
        console.log(err)
        done(err)
      })
  })
})
