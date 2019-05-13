/* eslint-env mocha */
const supertest = require('supertest')

describe('account-service', () => {
  const api = supertest('http://localhost:3000')
  it('returns a 200', (done) => {
    api.get('/accounts')
      .expect(200, done)
  })
})
