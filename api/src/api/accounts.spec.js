/* eslint-env mocha */
const request = require('supertest')
const server = require('../server/server')
const models = require('../models')

describe('Accounts API', () => {
  let app = null
  let testUsers = [{
    'id': '1',
    'name': 'Testing user 1',
    'email': 'testeruser1@musicapp.co',
    'alias': 'test',
    'lastName': 'lastName',
    'role': 'producer',
  }, {
    'id': '2',
    'name': 'Testing user 2',
    'email': 'testeruser2@musicapp.co',
    'alias': 'test',
    'lastName': 'lastName',
    'role': 'producer',
  }, {
    'id': '3',
    'name': 'Testing user 3',
    'email': 'testeruser3@musicapp.co',
    'alias': 'test',
    'lastName': 'lastName',
    'role': 'producer',
  }]

  let testRepo = {
    getAccountByEmail (email) {
      return Promise.resolve(testUsers.find(account => account.email === email))
    },
    getAllAccounts () {
      return Promise.resolve(testUsers)
    },
    getAccountById (id) {
      return Promise.resolve(testUsers.find(account => account.id === id))
    }
  }

  beforeEach(() => {
    return server.start({
      port: 3000,
      accountRepo: testRepo,
      models,
    }).then(serv => {
      app = serv
    })
  })

  afterEach(() => {
    app.close()
    app = null
  })

  let token = '';
  it('can hit login', (done) => {
    request(app)
      .post('/accounts/login')
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        token = res.body.data.token.value;
        done();
      })
  })

  it('can hit signup', (done) => {
    request(app)
      .post('/accounts/signup')
      .expect(200, done)
  })


  it('returns 200 for an known account', (done) => {
    request(app)
      .get('/accounts/info')
      .expect(200, done)
  })

  it('returns 200 for an know account', (done) => {
    request(app)
      .get('/accounts/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('returns 200 for healthz endpoint', (done) => {
    request(app)
      .get('/healthz')
      .expect(200, done)
  })
})
