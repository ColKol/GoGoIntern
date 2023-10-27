const express = require('express');
const router = express.Router();
const userInfo = require('..//models/userCreation')
const verificationCodes = require('..//models/verificationCodes')
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt')
const passport = require('passport')
const nodemailer = require('nodemailer');


//Verification middleware to make sure users can't just access it regularly
const verifyRegistration = (req, res, next) => {

    if(!req.session.newUser) {
        console.log("Restricted access")
        return res.redirect('/users/register');
    }
  
    next();
  
}

//Checking if the person already has a verification code in the database, and removing it so that there are no copies
const checkIfVerificationCodeExists = async (req, res, next) => {
    try {
      const user = await verificationCodes.findOne({ email: req.session.newUser.email });
      if (user) {
        console.log("its real");
        await verificationCodes.deleteOne({ email: req.session.newUser.email });
      }
      next();
    } catch (error) {
      console.error(error);
      next(error);
    }
};
//Login Renderer
router.get('/login', (req, res)=>{
    if (!req.session.newUser){
        res.render('login',{
            name:"",
            password:""
     })
    } else {
        res.render('login', {
            name: req.session.newUser.username,
            password: req.session.newUser.password
        })
    }
})

//Register Renderer
router.get('/register', (req,res)=>{
    res.render('register')
})

//Registration Handler
router.post('/register', (req, res)=>{
    const {name, email, password} = req.body;
    let errors = [];

    if(password.length < 6) {
        console.log("Password is too short!")
    }

    if(errors.length > 0){
        res.render('register',{
            errors,
            name,
            email,
            password
        })
    } else {
        userInfo.findOne({email: email})
        .then(user =>{
            if (user){
                console.log("Email is already in use!")
                res.render('register',{
                    errors,
                    name,
                    email,
                    password
                })
            } else {
                var newUser = new userInfo ({
                    username: name,
                    email: email,
                    password: password
                })
                console.log(newUser)
                req.session.newUser = newUser;
                res.redirect('/users/verification')
            }
        })
    }
});

router.get('/verification', verifyRegistration, checkIfVerificationCodeExists, async (req, res) => {
    const newUser = req.session.newUser;
    const key = Math.floor(Math.random() * (9999 - 1000) + 1000);
    const TheVerificationCode = new verificationCodes({
      email: newUser.email,
      verificationCode: key
    });

    req.session.TheVerificationCode = TheVerificationCode;
    req.session.newUser = newUser;
  
    try {
      await TheVerificationCode.save();
      console.log(TheVerificationCode);
  
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'ian.kaneko.chan@gmail.com',
          pass: 'cnck kdyu lfdg qvpe'
        }
      });
  
      var mailOptions = {
        from: 'ian.kaneko.chan@gmail.com',
        to: newUser.email,
        subject: 'Verification Code For Rayreader',
        text: 'Your verification code is ' + key
      };
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
  
      setTimeout(function () {
        TheVerificationCode.deleteOne({ email: newUser.email });
      }, 120000);
  
      res.render('verificationCheck');
    } catch (error) {
      console.error(error);
      res.redirect('/users/register');
    }
  });

//Finsihing up verification and adding user to database
router.post('/verification', verifyRegistration, async (req, res)=>{

    const newUserObj = req.session.newUser;
    const TheVerificationCode1 = req.session.TheVerificationCode;

    console.log(newUserObj);
    console.log(newUserObj.email)
    console.log(req.body.num);
    console.log(TheVerificationCode1);
    if (req.body.num === String(TheVerificationCode1.verificationCode)){
        console.log("you made it")
        const implementUser = new userInfo ({
            username: newUserObj.username,
            email: newUserObj.email,
            password: newUserObj.password,
            verified: true
        })
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(newUserObj.password, salt, (err, hash)=>{
                if (err) throw err;
                implementUser.password = hash;
                console.log(implementUser.password)
                implementUser.save()
            })
                verificationCodes.findOneAndDelete({'email': TheVerificationCode1.email}).then((user)=>{
                    console.log("it worked?")
                    res.redirect('/users/login')
            })
        })

    } else {
        console.log("You failed")
        await verificationCodes.findOneAndDelete({'email': TheVerificationCode1.email})
        res.redirect('/users/verification')
    }

})




//Login handle
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/userpage',
        failureRedirect: '/users/login',
        failureFlash: true
    })
     (req,res,next);
})

// Logout handle
router.get('/logout', function(req, res,next) {
    req.logout(function(err){
        if (err) {return next (err)}
        console.log("You Logged Out!")
        res.redirect('/')
    })
});

module.exports = router;
