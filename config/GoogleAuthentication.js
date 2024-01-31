//Calling on .env file and the values stored in there
require('dotenv').config();

//Libraries required for this entire Google Authentication system to work
const Googlepassport = require('passport')
var GoogleStrategy = require('passport-google-oauth2').Strategy;
const userInfo = require('..//models/userCreation');
const cookieParser = require('cookie-parser');

//Defining a Google Strategy to use for whenever we want to log in or register with google
Googlepassport.use(new GoogleStrategy({
  clientID:     process.env.clientID,
  clientSecret: process.env.clientSecret,
  callbackURL: "http://localhost:3000/auth/google/redirect",
  passReqToCallback   : true
},
async function(request, accessToken, refreshToken, profile, done) {
  //Using findOrCreate to basically just check if the user exists, if they do, they will be logged in. If they don't, then the account will be created and they will be logged in.
  await userInfo.findOne({email: profile.emails[0].value}).then((user, error) =>{
    if (user){
      return done (null, user);
    } else if (!user) {
      const newGoogleUser = new userInfo ({
        userType: request.cookies.userType,
        username: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        verified: true,
        firstTime: true,
      })
      newGoogleUser.save()
      return done (null, newGoogleUser)
    } else {
      return (null, error);
    }
  })
}
));

Googlepassport.serializeUser((user, done)=>{
  done(null, user);
})

Googlepassport.deserializeUser((user, done)=>{
  done(null, user);
})