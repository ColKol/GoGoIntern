//Simple importing of nessesary libraries and files
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const userInfo = require('../models/userCreation')



//This entire thing is basically for checking if the user even exists, and then giving them a pass on the website
module.exports = async function(passport) {
  passport.use("local", new LocalStrategy({ usernameField: 'name' }, async (name, password, done) => {
      try {
        const user = await userInfo.findOne({ username: name, verified: true });

        if (!user) {
          console.log("User does not exist");
          return done(null, false);
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;

          if (isMatch) {
            return done(null, user);
          } else {
            console.log("Incorrect password");
            return done(null, false);
          }
        });
      } catch (err) {
        console.log(err);
        return done(err);
      }
    })
  );

  passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });

  passport.deserializeUser(function(id, cb) {
    userInfo.findById(id, function(err, user) {
      if (err) return cb(err);
      cb(null, obj);
    });
  });
};