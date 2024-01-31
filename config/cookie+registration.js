const userInfo = require('..//models/userCreation')
const passport = require('passport')
const CookieStrategy = require('..//config/cookiePassportJS');
const RegistrationStrategy = require('../config/registrationAuth');

passport.use(new CookieStrategy({}, (userId, done) => {
    userInfo.findOne({ _id: userId }, (err, user) => {
      if (err) {
        return done(null, false);
      }
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    });
}));

passport.use(new RegistrationStrategy({}, (user, done) => {
    userInfo.findOne({ _id: user }, (err, user) => {
      if (err) {
        return done(null, false);
      }
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    });
}));

module.exports = passport