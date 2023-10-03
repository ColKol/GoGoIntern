//Simple importing of nessesary libraries and files
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userInfo = require('../models/userCreation')


//This entire thing is basically for checking if the user even exists, and then giving them a pass on the website
module.exports = async function(passport){
  passport.use(
    new LocalStrategy({ usernameField: 'name' }, (name, password, done)=>{
      userInfo.findOne({username: name})
      .then(user =>{
        if(!user){
          return done (null, false)
        }

        bcrypt.compare(password, user.password, (err, isMatch)=>{
          if (err) throw err;

          if(isMatch){
            return done(null, user)
          } else {
            return done (null, false)
          }
        });
      })
      .catch(err => console.log(err))
    })
  );
  passport.serializeUser(function(user, cb){
    process.nextTick(function(){
      return cb (null, {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password
      })
    })
  })

  passport.deserializeUser(function(user, cb){
    process.nextTick(function(){
      return cb (null, user)
    })
  })
}