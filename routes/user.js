require('dotenv').config();
const express = require('express');
const router = express.Router();
const userInfo = require('..//models/userCreation')
const verificationCodes = require('..//models/verificationCodes')
const bcrypt = require('bcrypt')
// const passport = require('passport')
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const multer = require('multer')
const stream = require('stream')

const { getDB } = require('../databased/database')

const mongodb = require('mongodb')
const fs = require('fs');
const assert = require('assert')

const { studentInfo } = require('../config/studentInfo');

const passport = require('..//config/cookie+registration')

router.use(cookieParser())

const storage = multer.memoryStorage()
const upload = multer({ storage })

//get rid of this later?
const request = require('request');


//Verification middleware to make sure users can't just access it regularly
const verifyRegistration = (req, res, next) => {

    if(!req.session.newEmail && !req.session.newUser) {
        console.log("Restricted access")
        return res.redirect('/users/register');
    }
  
    next();
  
};

//Checking if the person already has a verification code in the database, and removing it so that there are no copies
const checkIfVerificationCodeExists = async (req, res, next) => {
  let userEmail;
    try {
      if(!req.session.newUser){
        userEmail = req.user
      } else {
        userEmail = req.session.newUser
      }
      const user = await verificationCodes.findOne({ email: userEmail.email });
      if (user) {
        console.log("its real");
        await verificationCodes.deleteOne({ email: userEmail.email });
      }
      next();
    } catch (error) {
      console.error(error);
      next(error);
    }
};


router.get("/login/transition", (req, res)=>{
    if(!req.cookies.userInfo){
        res.redirect("/users/login")
    } else{
        res.redirect('/users/login/cookieCheck')
    }
})

//Login Renderer and cookie handler
router.get('/login/cookieCheck',passport.authenticate('cookie', { session: true}), (req,res)=>{
    if(req.user){
        res.redirect("/userpage")
    } else if(!req.user){
        res.redirect("/users/login")
    }
})

router.get('/login', (req, res, next)=>{
    console.log(req.cookies.userInfo)
    res.render('login',{
      errors: req.query.errors
    })
})

//Register Renderer
router.get('/register', (req,res)=>{
    res.render('chooseRegistrationType')
})

//Registration Handler
router.get('/register/newUser', (req,res)=>{
    const user = req.query.user;
    if(user === "student"){
        res.cookie("userType", "student")
        res.render('register',{
            username: "Username",
            errors: []
        })
    } else {
        res.cookie("userType", "business")
        res.render('register',{
            username:"Business/Firm name",
            errors: []
        })
    }
})

router.post('/register/newUser', async (req, res, next)=>{
  async function verifyEmail(){
    const {name, email, password} = req.body;
    let errors = [];
    let usernameReq

    if(password.length < 6) {
        errors.push("Password is too short! Password must be at least 6 characters!")
    }

    if(req.cookies.userType === "student"){
        usernameReq = "Username"
    } else {
        usernameReq = "Business/Firm name"
    }
    
    await userInfo.findOne({email: email}).then(user =>{
        if (user){
            errors.push("Email is already in use!")
            return
        } else {
            var newUser = new userInfo ({
                userType: req.cookies.userType,
                username: name,
                email: email,
                password: password,
            })
            console.log(newUser)
            req.session.newUser = newUser;
            res.redirect('/users/verification?failed=false')
        }
    })

    if(errors.length > 0){
      res.render('register',{
        username: usernameReq,
        errors
      })
    }
  }

  // the captcha
  // if captcha didn't have anything, send the user back to registration page
  if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
  {
    return res.redirect('/users/register');
  }

  // getting the recaptca secret key from the .env file
  const secretKey = process.env.Recaptcha_Secret_Key;

  //console.log(req.body['g-recaptcha-response'])

  // verifying captcha using secret key
  const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response']}&remoteip=req.socket.remoteAddress`;
  request(verificationURL, function(error,response,body) {
    body = JSON.parse(body);
    console.log("recaptcha test results:");
    console.log(body);

    // if not successful
    if(body.success !== undefined && !body.success) {
      return res.redirect('/users/register'); //res.json({"success": false, "msg":"failed captcha verification"});
    }
    //return res.json({"success": true, "msg":"you're in!"});

    verifyEmail();
  });
});

router.get('/verification', verifyRegistration, checkIfVerificationCodeExists, async (req, res) => {
    let newUser
    let error = req.query.failed;
    const key = Math.floor(Math.random() * (9999 - 1000) + 1000);
    if(req.session.newUser){
      newUser = req.session.newUser
    } else {
      newUser = req.session.newUserInfo
    }
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
          user: process.env.Verification_Bot_Email,
          pass: process.env.Verification_Bot_pass
        }
      });
  
      var mailOptions = {
        from: process.env.Verification_Bot_Email,
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
  
      res.render('verificationCheck', {
        failure: error
      });
    } catch (error) {
      console.error(error);
      error = true;
      res.redirect('/users/register');
    }
});

//Finsihing up verification and adding user to database
router.post('/verification', verifyRegistration, async (req, res)=>{

    const newUserObj = req.session.newUser;
    const TheVerificationCode1 = req.session.TheVerificationCode;

    if (req.body.num === String(TheVerificationCode1.verificationCode)){
      if(req.session.newEmail){
        await userInfo.updateOne({_id: req.user._id}, {email: req.session.newUserInfo.email, username: req.session.newUserInfo.username})
      } else {
        var implementUser = new userInfo ({
            userType: newUserObj.userType,
            username: newUserObj.username,
            email: newUserObj.email,
            password: newUserObj.password,
            verified: true,
            firstTime: true
        })
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(newUserObj.password, salt, (err, hash)=>{
                if (err) throw err;
                implementUser.password = hash;
                console.log(implementUser.password)
                req.session.implementUser = implementUser
                implementUser.save();
            })
        })
      }

        verificationCodes.findOneAndDelete({'email': TheVerificationCode1.email}).then((user)=>{
            console.log("it worked?")

          if(req.session.newEmail){
            req.session.newEmail = false;
            return res.redirect('/userpage')
          }

          if(implementUser.userType === "student"){
              return res.redirect('/users/registration/studentQuestionnare')
          } else if(implementUser.userType === "business"){
              return res.redirect('/users/registration/businessQuestionnare')
          }
        })

    } else {
        await verificationCodes.findOneAndDelete({'email': TheVerificationCode1.email})
        res.redirect('/users/verification?failed=true')
    }
})


//The part where we ask the user questions and determine what they are
router.get('/registration/studentQuestionnare', studentInfo, (req,res)=>{
    res.clearCookie("userType")
    res.render('studentQuestionnare')
})

router.post('/registration/studentQuestionnare' ,studentInfo, upload.single('cv'), async (req, res, next) => {
    const checkedValues = [];
    const hi = req.session.newUser
    const db = getDB()
    var bucket = new mongodb.GridFSBucket(db, {bucketName: 'cvStorage'})

    const cv = req.file
    const readstream = stream.Readable.from(cv.buffer)

    const uploadstream = bucket.openUploadStream(cv.originalname)

    readstream.pipe(uploadstream);

     uploadstream.on('finish', ()=>{
        console.log("File uploaded")
    })
  
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === 'on') {
        checkedValues.push(key);
      }
    });


    const user = await userInfo.updateOne({username: hi.username}, {interests: checkedValues, firstTime: false, cv: uploadstream.id})

    passport.authenticate('Register', (err,user,info)=>{
        if (err) {
            console.error('Passport authentication error:', err);
            return res.sendStatus(500);
          }
      
          if (!user) {
            console.error('User authentication failed:', info.message);
            return res.redirect('/users/register')
          }
      
          req.login(user, (err) => {
            if (err) {
              console.error('Error logging in the user:', err);
              return res.redirect('/userpage');
            }

            return res.redirect('/userpage')
          })
    }) (req,res,next);
});

router.get("/registration/businessQuestionnare", studentInfo, (req,res)=>{
    res.clearCookie("userType")
    res.render('businessQuestionnare')
})

router.post("/registration/businessQuestionnare", studentInfo, async (req,res, next)=>{
  const checkedValues = [];
  const hi = req.session.newUser
  Object.keys(req.body).forEach(key => {
    if (req.body[key] === 'on') {
      checkedValues.push(key);
    }
  });

  const user = await userInfo.updateOne({username: hi.username}, {interests: checkedValues, firstTime: false, address: req.body.address, description: req.body.about})

  passport.authenticate('Register', (err,user,info)=>{
        if (err) {
            console.error('Passport authentication error:', err);
            return res.sendStatus(500);
          }
      
          if (!user) {
            console.error('User authentication failed:', info.message);
            return res.redirect('/users/register')
          }
      
          req.login(user, (err) => {
            if (err) {
              console.error('Error logging in the user:', err);
              return res.redirect('/userpage');
            }

            return res.redirect('/userpage')
          })
  }) (req,res,next);
})

//Login handle
router.post('/login', (req, res, next)=>{

    passport.authenticate('local', (err, user) => {
        if(err){
            return next (err)
        }

        if(!user){
            req.flash('error', 'Invalid username or password');
            return res.redirect('/users/login?errors=true');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            
            if(req.body.remember){
                req.session.userCookie = req.body.name
                return res.redirect('/users/login/redirect');
            } else {
                return res.redirect('/userpage')
            }
            

        });

    })(req,res,next);
})

router.get('/login/redirect', (req,res)=>{
    userInfo.findOne({'email': req.session.userCookie}).then((user)=>{
        res.cookie("userInfo", String(user.id), {expires: new Date(Date.now() + (30*24*60*60*1000))})
        return res.redirect("/userpage")
    })
})

/*
// forgot password
router.get('/forgotPassword', (req,res)=>{
  console.log("sending user to forgot password page!")
  return res.redirect('/users/forgotPassword1')
})*/

router.get("/forgotPassword1", (req,res)=>{
  return res.render('forgotPassword1');
})

router.get('/backtoHome', function(req, res,next) {
  res.redirect('/')
});

// Logout handle
router.post('/logout', function(req, res,next) {
    req.logout(function(err){
        if (err) {return next (err)}
        console.log("You Logged Out!")
        res.clearCookie('userInfo')
        res.redirect('/')
    })
});



//captcha key = process.env.Recaptcha_Secret_Key

module.exports = router;
