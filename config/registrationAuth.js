const { Strategy } = require('passport-strategy');
const userInfo = require('../models/userCreation')

class RegistrationStrategy extends Strategy {
  constructor(options, verify) {
    super();
    this.name = 'Register';
    this.verify = verify;
  }

  authenticate(req) {
    const user = req.session.newUser;
    if (!user) {
        return this.fail({ message: 'User ID not found in cookie' });
    }

    userInfo.findOne({ username: req.session.newUser.username })
    .then(user2 => {
      if (!user2) {
        return this.fail({ message: 'Invalid user' });
      }
      return this.success(user2);
    })
    .catch(err => this.error(err));
  }
}

module.exports = RegistrationStrategy;
