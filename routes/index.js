const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/ensureUserIsLoggedIn')
const { checkIfStudentInfoThere } = require('../config/checkIfStudentInfoThere')
const cookieParser = require('cookie-parser')
const nodemailer = require('nodemailer');
const internshipCreator = require('..//models/internship')
const natural = require('natural')
const stemmer= natural.PorterStemmer;

router.use(cookieParser())
const { getDB } = require('../databased/database')

const mongodb = require('mongodb')
const fs = require('fs');
const assert = require('assert')

require('dotenv').config({ path: '../target.env' });
const userInfo = require('..//models/userCreation')
const verificationCodes = require('..//models/verificationCodes')
const bcrypt = require('bcrypt')
const multer = require('multer')
const stream = require('stream')

const { studentInfo } = require('../config/studentInfo');

const passport = require('passport')

router.use(cookieParser())

const storage = multer.memoryStorage()
const upload = multer({ storage })

const autosignout = async (req, res, next) => {
  if (req.user) {
    req.logout((err) => {
      if (err) {
        console.error('Error during user logout:', err);
      }
      next();
    });
  } else {
    next();
  }
}

router.get('/', autosignout, (req, res,next)=>{
    delete req.session.errorsInRegistration
    res.render('index',{
        errors: req.query.errors
    })
})

router.post('/', (req, res, next)=>{

    passport.authenticate('local', (err, user) => {
        if(err){
            return next (err)
        }

        if(!user){
            req.flash('error', 'Invalid username or password');
            return res.redirect('/?errors=true');
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


router.get('/userpage', ensureAuthenticated, checkIfStudentInfoThere, async (req, res) => {
    // const numberOfItemsPerPage = 3;
    // const page = req.query.page;
    // const skipItems = (page - 1) * numberOfItemsPerPage;
    const filter = {};
    filter.creator = req.user._id


    if(req.session.search){
        filter.nameOfInternship = { $regex: new RegExp(req.session.search, 'i') };
    } else {
        filter.nameOfInternship = { $regex: /.*/ };
    }
  
    const foundInternships = await internshipCreator
      .find(filter)
    //   .skip(skipItems)
    //   .limit(numberOfItemsPerPage);
  
    const db = getDB();
    const bucket = new mongodb.GridFSBucket(db, { bucketName: 'profilePicStorage' });
  
    const downloadStream = bucket.openDownloadStream(new mongodb.ObjectId(req.user.profilePicture));
  
    const chunks = [];
    let theImage;
  
    // Creating a promise to collect all image chunks
    const collectImageChunks = new Promise((resolve, reject) => {
      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });
  
      downloadStream.on('end', () => {
        theImage = Buffer.concat(chunks);
        resolve();
      });
  
      downloadStream.on('error', (error) => {
        console.error('Error retrieving file from database:', error);
        reject(error);
      });
    });
  
    try {
      await collectImageChunks; // Wait for the image data to be collected
  
      res.render('userpage', {
        name: req.user.username,
        id: req.user._id,
        email: req.user.email,
        userType: req.user.userType,
        internships: foundInternships,
        image: theImage.toString('base64'), // Convert the image data to Base64
      });
    } catch (error) {
      console.error('Error rendering userpage:', error);
      res.sendStatus(500);
    }
});

router.post('/userpage', ensureAuthenticated, checkIfStudentInfoThere, async(req,res)=>{
    req.session.search = req.body.search
    res.redirect('/userpage')
})

//UBER IMPORTANT CODE FOR LATER, DON'T TOUCH
// router.get('/testing', ensureAuthenticated, (req,res)=>{
//     //UBER IMPORTANT CODE FOR LATER, DON'T TOUCH
//     const db = getDB()
//     var bucket = new mongodb.GridFSBucket(db, {bucketName: 'cvStorage'})

//     const downloadStream = bucket.openDownloadStream(new mongodb.ObjectId(req.user.cv));
//     const chunks = []

//     downloadStream.on('data', (chunk) => {
//       chunks.push(chunk);
//     });

//     downloadStream.on('end', () => {
//       const pdfBuffer = Buffer.concat(chunks);
//       try {
//           var transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//               user: process.env.Verification_Bot_Email,
//               pass: process.env.Verification_Bot_pass
//             }
//           });
    
//           var mailOptions = {
//             from: process.env.Verification_Bot_Email,
//             to: 'chani5@rchk.edu.hk',
//             subject: 'PDF Text',
//             text: 'Here is the CV',
//             attachments: [{
//               filename: req.user.cv +".pdf",
//               content: pdfBuffer,
//               encoding: 'base64'
//             }]
//           };
      
//           transporter.sendMail(mailOptions, function (error, info) {
//               if (error) {
//                 console.log(error);
//               } else {
//                 console.log('Email sent: ' + info.response);
//               }
//           })     
//       } catch (error) {
//           console.error(error);
//           res.redirect('/users/register');
//       }
//     });
// })

module.exports = router;