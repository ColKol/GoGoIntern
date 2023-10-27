//Calling on .env file and the values stored in there
require('dotenv').config();

//Libraries required for this entire Google Authentication system to work
const Googlepassport = require('passport')
var GoogleStrategy = require('passport-google-oauth2').Strategy;
const userInfo = require('..//models/userCreation');
const findOrCreate = require('mongoose-findorcreate');

//Defining a Google Strategy to use for whenever we want to log in or register with google
Googlepassport.use(new GoogleStrategy({
  clientID:     process.env.clientID,
  clientSecret: process.env.clientSecret,
  callbackURL: "http://localhost:3000/auth/google/redirect",
  passReqToCallback   : true
},
function(request, accessToken, refreshToken, profile, cb) {
  //Using findOrCreate to basically just check if the user exists, if they do, they will be logged in. If they don't, then the account will be created and they will be logged in.
  userInfo.findOrCreate({email: profile.emails[0].value, username: profile.displayName, googleId: profile.id, verified: true}, function (err, user){
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