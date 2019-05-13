/* eslint-env mocha */
const {createToken} = require('./index')
const assert = require('assert');

const user = {
  name: 'Test',
  alias: 'User',
  role: 'song_writer',
  id: '1'
}
describe('CreateToken', () => {
  it('should create a token', () => {
    const token = createToken(user);
    assert.notEqual(token, undefined)
  })
})
