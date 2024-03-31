const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/ensureUserIsLoggedIn')
const { checkIfStudentInfoThere } = require('../config/checkIfStudentInfoThere')
const cookieParser = require('cookie-parser')
const nodemailer = require('nodemailer');
const internshipCreator = require('..//models/internship')

router.use(cookieParser())
const { getDB } = require('../databased/database')

const mongodb = require('mongodb')
const fs = require('fs');
const assert = require('assert')

router.get('/', (req, res,next)=>{
    res.render('index')
})

router.get('/account', (req, res)=>{
    res.render('account')
})

router.get('/about', (req,res)=>{
    res.render('about')
})

router.get('/citations', (req,res)=>{
    res.render('citations')
})

router.get('/page/practice', (req,res)=>{
    res.render('page-practice')
})

router.get('/userpage', ensureAuthenticated, checkIfStudentInfoThere, (req,res)=>{
    res.render('userpage', {
        name: req.user.username,
        email: req.user.email,
        userType: req.user.userType
    })
})

// router.get('/account', ensureAuthenticated, checkIfStudentInfoThere, (req,res)=>{
//     res.render('account', {
//         name: req.user.username,
//         email: req.user.email,
//         userType: req.user.userType
//     })
// })

// router.get('/userpage', ensureAuthenticated, checkIfStudentInfoThere, async (req,res)=>{
//     let recommendedCourses = []
//     console.log(req.user.interests)

//     const recommended = await internshipCreator.find({typeOfInternship: {
//         $in: req.user.interests
//       }}).limit(6)

//     recommended.forEach(async (reccomend)=>{
//         recommendedCourses.push(reccomend)
//     })

//     recommendedCourses.forEach((course)=>{
//         console.log(course.creatorName)
//     })

//     res.render('userpage', {
//         name: req.user.username,
//         email: req.user.email,
//         userType: req.user.userType,
//         internships: recommendedCourses
//     })

//     req.session.completedForm = false;
// })


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