require('dotenv').config();

const Googlepassport = require('passport')
var GoogleStrategy = require('passport-google-oauth2').Strategy;
const userInfo = require('..//models/userCreation');
const findOrCreate = require('mongoose-findorcreate');


Googlepassport.use(new GoogleStrategy({
  clientID:     process.env.clientID,
  clientSecret: process.env.clientSecret,
  callbackURL: "http://localhost:3000/auth/google/redirect",
  passReqToCallback   : true
},
function(request, accessToken, refreshToken, profile, cb) {
  userInfo.findOrCreate({googleId: profile.id}, {username: profile.displayName}, {email: profile.emails[0].value}, function (err, user){
    return cb (err, user);
  })
}
));

Googlepassport.serializeUser((user, done)=>{
  done(null, user);
})

Googlepassport.deserializeUser((user, done)=>{
  done(null, user);
})