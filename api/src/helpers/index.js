const {hash} = require('../config')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')
const moment = require('moment')

const createToken = (user) => {
  const utcMoment = moment.utc().add(100, 'days');
  const payload = {
    id: user.id || '',
    email: user.email || '',
    role: user.role || '',
    name: user.name || '',
    alias: user.alias || '',
    profilePicture: user.profilePicture || '',
    ascapLink: user.ascapLink || '',
    bmiLink: user.bmiLink || '',
    sesacLink: user.sesacLink || '',
    publisher: user.publisher || '',
  };
  const token = jwt.encode(payload, hash)
  return {
    type: 'jtw', value: token, until: utcMoment.format()
  }
};

const createPassword = (password) => {
  return bcrypt.hashSync(password);
};

const comparePassword = (typedPassword, targetPassword) => {
  return bcrypt.compareSync(typedPassword, targetPassword)
}

module.exports = Object.assign({}, {createToken, createPassword, comparePassword})
