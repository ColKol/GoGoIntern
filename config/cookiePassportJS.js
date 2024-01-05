const { Strategy } = require('passport-strategy');
const userInfo = require('../models/userCreation')

class CookieStrategy extends Strategy {
  constructor(options, verify) {
    super();
    this.name = 'cookie';
    this.verify = verify;
  }

  authenticate(req) {
    const userId = req.cookies.userInfo;
    if (!userId) {
        return this.fail({ message: 'User ID not found in cookie' });
    }

    userInfo.findOne({ _id: userId })
    .then(user => {
      if (!user) {
        return this.fail({ message: 'Invalid user' });
      }
      return this.success(user);
    })
    .catch(err => this.error(err));
  }
}

module.exports = CookieStrategy;