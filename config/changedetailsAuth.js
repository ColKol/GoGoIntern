const { Strategy } = require('passport-strategy');
const userInfo = require('../models/userCreation')

class ChangeDetailsStrategy extends Strategy {
  constructor(options, verify) {
    super();
    this.name = 'ChangeDetails';
    this.verify = verify;
    this.options = options
  }

  async authenticate(req) {
    const user = req.session.createNewDetails;
    if (!user) {
        return this.fail({ message: 'User ID not found in cookie' });
    }

    await userInfo.findOne({ _id: user._id })
    .then((user2) => {
      if (!user2) {
        return this.fail({ message: 'Invalid user' });
      }
      return this.success(user2);
    })
    .catch(err => this.error(err));
  }
}

module.exports = ChangeDetailsStrategy;