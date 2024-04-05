require('dotenv').config({ path: '../target.env' });
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
const crypto = require('crypto')
const { MongoClient, ObjectId } = require('mongodb');

const { getDB } = require('../databased/database')

const mongodb = require('mongodb')
const fs = require('fs');
const assert = require('assert')

const { studentInfo } = require('../config/studentInfo');

const passport = require('passport')
const registerPassport = require('../config/registrationAuth')

router.use(cookieParser())

const storage = multer.memoryStorage()
const upload = multer({ storage })

//Verification middleware to make sure users can't just access it regularly
const verifyRegistration = (req, res, next) => {

    if(!req.session.newUser) {
        return res.redirect('/');
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
        await verificationCodes.deleteOne({ email: userEmail.email });
      }
      next();
    } catch (error) {
      console.error(error);
      next(error);
    }
};

//Deleting the profile picture if there is more than one of them being entered
const deleteProfilePicture = async (req, res, next) => {
  const db = getDB();
  const bucket = new mongodb.GridFSBucket(db, { bucketName: 'profilePicStorage' });

  if (req.cookies.profilePicID) {
    try {
      const file = await bucket.find(new ObjectId(req.cookies.profilePicID)).toArray();

      if (file.length > 0) {
        await bucket.delete(new ObjectId(file[0]._id));
      }
    } catch (error) {
      console.error('Error deleting profile picture:', error);
    }
  }

  next();
};



// router.get("/login/transition", (req, res)=>{
//     if(!req.cookies.userInfo){
//         res.redirect("/users/login")
//     } else{
//         res.redirect('/users/login/cookieCheck')
//     }
// })

//Login Renderer and cookie handler
// router.get('/login/cookieCheck',passport.authenticate('cookie', { session: true}), (req,res)=>{
//     if(req.user){
//         res.redirect("/userpage")
//     } else if(!req.user){
//         res.redirect("/users/login")
//     }
// })

// router.get('/login', (req, res, next)=>{
//     console.log(req.cookies.userInfo)
//     res.render('login',{
//       errors: req.query.errors
//     })
// })

//Register Renderer
router.get('/register', (req,res)=>{
    res.render('chooseRegistrationType')
})

//Registration Handler
router.get('/register/newUser', deleteProfilePicture, (req,res)=>{
    res.cookie('userType', req.query.user)
    const user = req.query.user;
    var changingQuestion = (user === "student")? "Username":"Firm name";

    const googeStoredUser = req.cookies.googleInfo;

    const errorValues = req.session.errorsInRegistration || null

    if(googeStoredUser){
      let key = Buffer.from(process.env.Encryption_Secret_key, 'hex')
      let iv = Buffer.from(process.env.Encryption_IV, 'hex')
      let tag = Buffer.from(req.cookies.tag, 'hex')
      const decipher = crypto.createDecipheriv('aes-128-gcm', key, iv)
      decipher.setAuthTag(tag)
      let decryptedText = decipher.update(googeStoredUser, 'hex', 'utf-8')

      decryptedText += decipher.final('utf-8')

      const fulldecipher = JSON.parse(decryptedText)
      res.render('register',{
        username: changingQuestion,
        emailValue: fulldecipher.email.trimStart(),
        usernameValue: fulldecipher.username.trimStart(),
        profilePictureValue: fulldecipher.profilePicture.trimStart(),
        errors: errorValues
      })
    } else {
      res.render('register',{
        username: changingQuestion,
        emailValue: undefined,
        usernameValue: undefined,
        profilePictureValue: undefined,
        errors: errorValues
      })
    }
})

router.post('/register/newUser', upload.single('profilePic'),async (req, res, next)=>{
  async function verifyEmail() {
    try {
      const { name, email, password, about, checked } = req.body;


      let errors = [];
      let usernameReq;
      let aboutUs;
      const filteredInterests = req.body.checked.split(',').filter((interest) => interest !== "");

      const user = await userInfo.findOne({ email: email });
      if (user) {
        errors.push("email");
      }

      if (password.length < 6) {
        errors.push("length");
      }

      if (req.cookies.userType === "student") {
        usernameReq = "student";
      } else {
        usernameReq = "business";
      }

      if (about != (null || '')) {
        aboutUs = about;
      } else {
        aboutUs = null;
      }

      if (errors.length > 0) {
        req.session.errorsInRegistration = errors
        return res.redirect('/users/register/newUser?user='+usernameReq)
      }

      const db = getDB();

      var bucket = new mongodb.GridFSBucket(db, { bucketName: 'profilePicStorage' });

      const profilePic = req.file;

      const readstream = stream.Readable.from(profilePic.buffer);

      const uploadstream = bucket.openUploadStream(profilePic.originalname);

      readstream.pipe(uploadstream);

      uploadstream.on('finish', () => {
        var newUser = {
          userType: req.cookies.userType,
          username: name,
          email: email,
          password: password,
          description: aboutUs,
          interests: filteredInterests,
          profilePicture: uploadstream.id
        };
        res.cookie('profilePicID', uploadstream.id)
        req.session.newUser = newUser;
  
        res.redirect('/users/verification?failed=false');
      });

    } catch (error) {
      console.error(error);
      res.redirect('/users/register');
    }
  }

  await verifyEmail();

  // // the captcha
  // // if captcha didn't have anything, send the user back to registration page
  // if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
  // {
  //   return res.redirect('/users/register');
  // }

  // // getting the recaptca secret key from the .env file
  // const secretKey = process.env.Recaptcha_Secret_Key;

  // //console.log(req.body['g-recaptcha-response'])

  // // verifying captcha using secret key
  // const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response']}&remoteip=req.socket.remoteAddress`;
  // request(verificationURL, function(error,response,body) {
  //   body = JSON.parse(body);
  //   console.log("recaptcha test results:");
  //   console.log(body);

  //   // if not successful
  //   if(body.success !== undefined && !body.success) {
  //     return res.redirect('/users/register'); //res.json({"success": false, "msg":"failed captcha verification"});
  //   }
  //   //return res.json({"success": true, "msg":"you're in!"});

  //   verifyEmail();
  // });
});

router.get('/verification', verifyRegistration, checkIfVerificationCodeExists, async (req, res) => {
    delete req.session.errorsInRegistration
    res.clearCookie('googleInfo')
    res.clearCookie('tag')
    res.clearCookie('userType')
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
        subject: 'Verification Code For GoGoIntern',
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
        failed: error
      });
    } catch (error) {
      console.error(error);
      error = true;
      res.redirect('/users/register');
    }
});

//Finsihing up verification and adding user to database
router.post('/verification', verifyRegistration, async (req, res, next)=>{

    const newUserObj = req.session.newUser;
    const TheVerificationCode1 = req.session.TheVerificationCode;

    if (req.body.num.join('') === String(TheVerificationCode1.verificationCode)){
      if(req.session.newEmail){
        await userInfo.updateOne({_id: req.user._id}, {email: req.session.newUserInfo.email, username: req.session.newUserInfo.username})
      } else {
        res.clearCookie('profilePicID')
        var implementUser = new userInfo ({
            userType: newUserObj.userType,
            username: newUserObj.username,
            email: newUserObj.email,
            password: newUserObj.password,
            description: newUserObj.description,
            interests: newUserObj.interests,
            profilePicture: newUserObj.profilePicture,
            verified: true,
            firstTime: false
        })
        bcrypt.genSalt(10, (err, salt)=>{
            if(err) throw err;
            bcrypt.hash(newUserObj.password, salt, async(err, hash)=>{
                if (err) throw err;
                implementUser.password = hash;
                req.session.implementUser = implementUser
                return await implementUser.save();
            })
        })
      }

      await verificationCodes.findOneAndDelete({'email': TheVerificationCode1.email}).then(async(user)=>{

        if(req.session.newEmail){
          req.session.newEmail = false;
        }

        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          passport.authenticate('Register', (err, userLogin, info) => {
            if (err) {
              console.error('Passport authentication error:', err);
              return res.sendStatus(500);
            }
        
            if (!userLogin) {
              console.error('User authentication failed:', info.message);
              return res.redirect('/users/register');
            }
        
            req.login(userLogin, (err) => {
              if (err) {
                console.error('Error logging in the user:', err);
                return res.redirect('/userpage');
              }
        
              return res.redirect('/userpage');
            });
          })(req, res, next);
        } catch (err) {
          console.error('Error during authentication:', err);
          res.redirect('/users/verification?failed=true')
        }
      })

    } else {
      await verificationCodes.findOneAndDelete({'email': TheVerificationCode1.email})
      res.redirect('/users/verification?failed=true')
    }
})

//For personal refernece
// router.post('/registration/studentQuestionnare' ,studentInfo, upload.single('cv'), async (req, res, next) => {
//     const checkedValues = [];
//     const hi = req.session.newUser
//     const db = getDB()
//     var bucket = new mongodb.GridFSBucket(db, {bucketName: 'cvStorage'})

//     const cv = req.file
//     const readstream = stream.Readable.from(cv.buffer)

//     const uploadstream = bucket.openUploadStream(cv.originalname)

//     readstream.pipe(uploadstream);

//      uploadstream.on('finish', ()=>{
//         console.log("File uploaded")
//     })
  
//     Object.keys(req.body).forEach(key => {
//       if (req.body[key] === 'on') {
//         checkedValues.push(key);
//       }
//     });


//     const user = await userInfo.updateOne({username: hi.username}, {interests: checkedValues, firstTime: false, cv: uploadstream.id})

//     passport.authenticate('Register', (err,user,info)=>{
//         if (err) {
//             console.error('Passport authentication error:', err);
//             return res.sendStatus(500);
//           }
      
//           if (!user) {
//             console.error('User authentication failed:', info.message);
//             return res.redirect('/users/register')
//           }
      
//           req.login(user, (err) => {
//             if (err) {
//               console.error('Error logging in the user:', err);
//               return res.redirect('/userpage');
//             }

//             return res.redirect('/userpage')
//           })
//     }) (req,res,next);
// });



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
router.get('/logout', function(req, res,next) {
    req.logout(function(err){
        if (err) {return next (err)}
        res.clearCookie('userInfo')
        res.redirect('/')
    })
});



//captcha key = process.env.Recaptcha_Secret_Key

module.exports = router;
