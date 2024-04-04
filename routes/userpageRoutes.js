require('dotenv').config({ path: '../target.env' });
const express = require('express');
const router = express.Router();
const userInfo = require('..//models/userCreation')
const internshipCreator = require('..//models/internship')
const bcrypt = require('bcrypt')
// const passport = require('passport')
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const multer = require('multer')
const stream = require('stream')
const natural = require('natural')
const stemmer= natural.PorterStemmer;
const { MongoClient, ObjectId } = require('mongodb');
const changedetailsPassport = require('../config/changedetailsAuth')

const { getDB } = require('../databased/database')

const mongodb = require('mongodb')
const fs = require('fs');
const assert = require('assert')

const { studentInfo } = require('../config/studentInfo');

const passport = require('..//config/cookie+registration');
const { isNullOrUndefined } = require('util');

router.use(cookieParser())

const storage = multer.memoryStorage()
const upload = multer({ storage })

passport.use(new changedetailsPassport)

const checkUserType = (requiredUserType) => {
    return (req, res, next) => {
      const userType = req.user.userType; 
  
      if (userType === requiredUserType) {
        next();
      } else {
        res.redirect('/userpage')
      }
    };
};

const changedPasswordChecker = (req,res,next) =>{
    if(!req.session.changedPassword){
        return res.redirect("/userpage/userdetails")
    } else {
        next();
    }
}

const checkIfYours = async(req,res,next)=>{
    const checker = await internshipCreator.findOne({_id: req.query.internship})

    if(checker.creator === req.user._id){
        next();
    } else {
        res.redirect('/userpage')
    }
}


// router.get('/userdetails', (req,res)=>{
//     if(req.query.changepassword){
//         req.session.changedPassword = true;
//         res.clearCookie("userInfo")
//         try {
//             var transporter = nodemailer.createTransport({
//               service: 'gmail',
//               auth: {
//                 user: process.env.Verification_Bot_Email,
//                 pass: process.env.Verification_Bot_pass
//               }
//             });
      
//             var mailOptions = {
//               from: process.env.Verification_Bot_Email,
//               to: req.user.email,
//               subject: 'Renewal of password',
//               html: '<p>Click <a href ="http://localhost:3000/userpage/reset/password">here</a> to change your password'
                
//             };
        
//             transporter.sendMail(mailOptions, function (error, info) {
//                 if (error) {
//                   console.log(error);
//                 } else {
//                   console.log('Email sent: ' + info.response);
//                 }
//             })     
//         } catch (error) {
//             console.error(error);
//             res.redirect('/users/register');
//         }
//     }

//     res.render('userdetails', {
//       name: req.user.username,
//       email: req.user.email,
//       ps: req.user.password,
//       userType: req.user.userType,
//       fields: req.user.interests,
//       passwordCheck: req.query.changepassword
//     })
// })

// router.post('/userdetails', async (req,res)=>{

//     if(req.body.new_email != req.user.email){
//         await userInfo.findOne({email: req.body.new_email}).then((user)=>{
//             if(!user){
//                 req.session.newEmail = true;
//                 req.session.newUserInfo = {
//                     username: req.body.new_name,
//                     email: req.body.new_email
//                 }
//                 res.redirect("/users/verification")
//             } else {
//                 res.redirect('/userpage/userdetails')
//             }
//         })
//     } else {
//         await userInfo.updateOne({_id: req.user._id}, {interests: req.body.InterestedFields}).then(()=>{
//             res.redirect('/userpage/userdetails')
//         })
//     }
// })

router.get("/reset/password", changedPasswordChecker, (req,res)=>{
    res.render("resetPassword",{
        failed: req.query.failed
    })
})

router.post("/reset/password", changedPasswordChecker, async (req,res)=>{
    if(req.body.password1 != req.body.password2){
        res.redirect("/userpage/reset/password?failed=true")
    } else {
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(req.body.password2, salt, async(err, hash)=>{
                if (err) throw err;
                else{
                    req.session.changedPassword = false;
                    await userInfo.findByIdAndUpdate({_id: req.user._id},{password: hash}).then(()=>{
                        res.redirect("/users/logout")
                    })
                }
            })
        })
    }
})

router.get('/userdetails', async(req,res)=>{
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

    const userDetails = await userInfo.findOne({_id: req.user._id})

    const filteredInterests = userDetails.interests.filter((interest) => interest !== "");
    try{
        await collectImageChunks;

        res.render('userdetails',{
            image: theImage,
            firmName: userDetails.username,
            email: userDetails.email,
            fields: filteredInterests,
            about: userDetails.description
        })
    } catch(error){
        throw(error)
    }
})

router.post('/userdetails', upload.single('profilePic'), async (req,res,next)=>{
    const db = getDB();
    const bucket = new mongodb.GridFSBucket(db, { bucketName: 'profilePicStorage' });
    let ID_Of_uploadstream;

    if(req.file){
        try {
        
            const file = await bucket.find(new ObjectId(req.user.profilePicture)).toArray();
        
            await bucket.delete(new ObjectId(file[0]._id));

            const profilePic = req.file;

            const readstream = stream.Readable.from(profilePic.buffer);

            const uploadstream = bucket.openUploadStream(profilePic.originalname);

            readstream.pipe(uploadstream);

            await new Promise((resolve, reject) => {
                uploadstream.on('finish', () => {
                  ID_Of_uploadstream = uploadstream.id;
                  resolve();
                });
                uploadstream.on('error', (error) => {
                  reject(error);
                });
            });
        } catch (error) {
            console.error('Error deleting profile picture:', error);
        }
    } else {
        ID_Of_uploadstream = req.user.profilePicture
    }

    const findingEmail = await userInfo.findOne({email: req.body.email})

    if(findingEmail && req.body.email != req.user.email){
        return res.redirect('/userpage')
    }

    await userInfo.findOne({_id: req.user._id}).then(async(userdetails)=>{
        if(!userdetails){
            res.redirect('/userpage')
        } else {
            const filteredInterests = req.body.checked.split(',').filter((interest) => interest !== "");
            await userInfo.updateOne({_id: req.user._id},{
                username: req.body.name,
                email: req.body.email,
                description: req.body.about,
                interests: filteredInterests,
                profilePicture: ID_Of_uploadstream
            })

            req.session.createNewDetails = userdetails

            passport.authenticate('ChangeDetails', (err, user, info) => {
                if (err) {
                  console.error('Passport authentication error:', err);
                  return res.sendStatus(500);
                }
              
                if (!user) {
                  console.error('User authentication failed:', info.message);
                  return res.redirect('/');
                }
              
                // Serialize the user here
                req.login(user, (err) => {
                  if (err) {
                    console.error('Error logging in the user:', err);
                    return res.redirect('/userpage');
                  }
              
                  // Save the serialized user in the session
                  req.session.passport = { user: user };
                  return res.redirect('/userpage/userdetails');
                });
              })(req, res, next);
        }
    })
})


const checkIfCompleted = (req,res,next)=>{
    if(!req.session.completedForm ||  req.session.completedForm == undefined){
        res.redirect('/userpage')
    } else {
        next();
    }
}

const checkIfSignUppable = async (req,res,next)=>{
    await internshipCreator.findOne({_id: req.query.signupForm}).then((internship)=>{
        if(internship.personWhoSignedUp != undefined){
            res.redirect('/userpage/searchInternships?page=1')
        } else {
            next();
        }
    })
}



router.get('/createOpportunity', checkUserType('business'), (req,res)=>{
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
  
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
  
    const minDate = `${year}-${month}-${day}`;
  
    res.render('internshipCreator',{
        minDate: minDate
    })
})

router.post('/createOpportunity', checkUserType('business'), upload.single('coverPic'),async (req,res)=>{
    //Note to self (and team), make a option for flexible work periods!!!

    let dateStart = req.body.dateStart;
    let dateEnd = req.body.dateEnd;
    let flexibleOrNot;

    const db = getDB();

    var bucket = new mongodb.GridFSBucket(db, { bucketName: 'coverPicStorage' });

    const coverPic = req.file;

    const readstream = stream.Readable.from(coverPic.buffer);

    const uploadstream = bucket.openUploadStream(coverPic.originalname);

    readstream.pipe(uploadstream);


    if(!req.body.dateStart){
        dateStart = new Date()
        dateStart.setFullYear(dateStart.getFullYear()+1000)
    }

    if(!req.body.dateEnd){
        dateEnd = new Date()
        dateEnd.setFullYear(dateEnd.getFullYear()+1000)
    }

    if(req.body.flexibleCheck){
        flexibleOrNot = 'flexible'
    } else {
        flexibleOrNot = 'fixed'
    }

    const filteredInterests = req.body.checked.split(',').filter((interest) => interest !== "");

    const newInternship = new internshipCreator({
        creator: req.user._id,
        creatorName: req.user.username,
        nameOfInternship: req.body.nameOfInternship,
        typeOfInternship: filteredInterests,
        internshipTypeForWorking: flexibleOrNot,
        description: req.body.about,
        skillsRequired: req.body.skill,
        addressForWork: req.body.district,
        internshipSchedule: req.body.internshipSchedule,
        shiftStart: req.body.shiftStart,
        shiftEnd: req.body.shiftEnd,
        startDate: dateStart,
        endDate: dateEnd,
        screeningQuestions: req.body.question,
        coverPhotoID: uploadstream.id,
        creationDate: Date.now()
    })

    await newInternship.save();

    res.redirect('/userpage')

})

// router.get('/searchInternships', checkUserType('student'),async (req,res)=>{

//     const itemsPerPage = 1;
//     const currentPage = req.query.page;
//     const skipItems = (currentPage - 1) * itemsPerPage;

//     let numberOfPages;
//     let pageCount = [];


//     let searchQuery;
//     let queryNames = [];
//     const { placementType, internshipChoices, internshipSchedule, startDate, endDate, wageType, shiftStart, shiftEnd } = req.query;
//     const filter = {};

//     if(placementType){
//         filter.workplaceType = placementType;
//     }

//     if(internshipChoices){
//         filter.typeOfInternship = internshipChoices;
//     }

//     if(startDate){
//         filter.startDate = {$gte: startDate}
//     } else {
//         filter.startDate = {$gte: new Date}
//     }

//     if(endDate){
//         filter.endDate = {$lte: endDate}
//     }

//     if(wageType){
//         filter.wageType = wageType
//     }

//     if(shiftStart){
//         filter.shiftStart = {$gte: shiftStart}
//     }

//     if(shiftEnd){
//         filter.shiftEnd = {$lte: shiftEnd}
//     }

//     if(internshipSchedule){
//         filter.internshipSchedule = String(internshipSchedule)
//     }

//     console.log(Object.keys(req.query).length)

//     if(Object.keys(req.query).length == 1 && req.query.hasOwnProperty("page")){
//         return res.render('searchInternships',{
//             searchResults: undefined,
//             startPage: 1,
//             currentPage: 1,
//             numberOfPages: undefined,
//             justAccesed: true,
//         })
//     }


//     if(req.query.searchBar != undefined){
//         const query = stemmer.stem(req.query.searchBar)
//         const searchedItem = new RegExp(query, 'i')
//         filter.nameOfInternship = searchedItem;
//         filter.personWhoSignedUp = undefined;
//         console.log(filter)
//         searchQuery = await internshipCreator.find(filter).skip(skipItems).limit(itemsPerPage);

//         if(searchQuery.length == 0){
//             return res.render('searchInternships',{
//                 searchResults: undefined,
//                 startPage: 1,
//                 currentPage:1,
//                 numberOfPages: undefined,
//                 justAccesed: false,
//                 internshipSchedule: undefined
//             })
//         }
//         numberOfInternships = await internshipCreator.countDocuments(filter)

//         searchQuery.forEach(async (sQuery)=>{
//             queryNames.push(sQuery)
//         })

//         numberOfPages = Math.ceil(numberOfInternships/itemsPerPage);

//         for(let i = 0; i <= numberOfPages; i++){
//             pageCount.push(i)
//         }

//         pageCount.shift();


//         res.render('searchInternships',{
//             searchResults: queryNames,
//             startPage: 1,
//             currentPage: parseInt(req.query.page),
//             internshipSchedule: internshipSchedule,
//             searchBar: req.query.searchBar,
//             placementType: placementType,
//             internshipChoices: internshipChoices,
//             startDate: startDate,
//             endDate: endDate,
//             shiftStart: shiftStart,
//             shiftEnd: shiftEnd,
//             wageType: wageType,
//             numberOfPages: pageCount,
//         })
//     } else {
//         res.render('searchInternships',{
//             searchResults: searchQuery,
//             startPage: 1,
//             currentPage: 1,
//             numberOfPages: undefined,
//             justAccesed: false
//         })
//     }
// })

// router.get('/businessProfile', checkUserType('student'), async (req,res)=>{
//     console.log(req.query.business)
//     const businessProfile = await userInfo.findOne({_id: req.query.business})
//     res.render('businessProfile',{
//         businessName: businessProfile.username,
//         businessType: businessProfile.interests,
//         businessDescription: businessProfile.description,
//         businessAddress: businessProfile.address,
//         businessContacts: businessProfile.email
//     })
// })

// router.get('/signup', checkUserType('student'), checkIfSignUppable, async(req,res)=>{
//     const signupFormat = await internshipCreator.findOne({_id: req.query.signupForm})
//     res.render('signupForm',{
//         questions: signupFormat.screeningQuestions,
//         id: req.query.signupForm
//     })
// })

// router.post('/signup', checkUserType('student'), async(req,res)=>{
//     const signupFormat = await internshipCreator.findOne({_id: req.body.idForsignUp})
    
//     const emailForFirms = await userInfo.findOne({_id: signupFormat.creator})

//     var { bodyOfEmail } = req.body

//     const db = getDB()
//     var bucket = new mongodb.GridFSBucket(db, {bucketName: 'cvStorage'})

//     const downloadStream = bucket.openDownloadStream(new mongodb.ObjectId(req.user.cv));
//     const chunks = []

//     downloadStream.on('data', (chunk) => {
//       chunks.push(chunk);
//     });


//     downloadStream.on('end', () => {
//       const pdfBuffer = Buffer.concat(chunks);
//       var htmlString = ' <h3>Dear '+emailForFirms.username+',</h3>    <h4>'+req.user.username+' has signed up for '+signupFormat.nameOfInternship+', here is their Cirriculum Vitae and their application email:</h4>     <p>'+bodyOfEmail+'</p>    <h4>Answers to screening questions</h4>'
//       try {
//           var transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//               user: process.env.Verification_Bot_Email,
//               pass: process.env.Verification_Bot_pass
//             }
//           });

//           req.body.questionAnswer.forEach((question, index)=>{
//             htmlString += '<h4>Question '+(index+1)+': '+signupFormat.screeningQuestions[index]+'</h4>  <li>'+question+'</li>     '
//           })

//           console.log(htmlString)
    
//           var mailOptions = {
//             from: process.env.Verification_Bot_Email,
//             to: emailForFirms.email,
//             subject: 'Application for '+signupFormat.nameOfInternship,
//             html: htmlString,
//             attachments: [{
//               filename: req.user.username+"'s Cirriculum Vitae.pdf",
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

//     await internshipCreator.updateOne({_id: req.body.idForsignUp}, {personWhoSignedUp: req.user._id})

//     req.session.completedForm = true;

//     res.redirect('/userpage/signup/signupConfirm?signup=' + signupFormat.id)
// })

// router.get('/signup/signupConfirm', checkUserType('student'), checkIfCompleted, async(req,res)=>{
//     const firm = await internshipCreator.findOne({_id: req.query.signup})
//     console.log(firm)
//     res.render('signupConfirm',{
//         signupName: firm.nameOfInternship
//     })
// })

router.get('/editInformation', checkUserType('business'), async (req,res)=>{
    let internshipInfo = await internshipCreator.findOne({_id: req.query.internship})
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
  
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
  
    const minDate = `${year}-${month}-${day}`;

    const db = getDB();
    const bucket = new mongodb.GridFSBucket(db, { bucketName: 'coverPicStorage' });
  
    const downloadStream = bucket.openDownloadStream(new mongodb.ObjectId(internshipInfo.coverPhotoID));
  
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

    try{
        await collectImageChunks;
        res.render('editInfoOnInternship',{
            internshipInfo: internshipInfo,
            id: req.query.internship,
            minDate: minDate,
            image: theImage.toString('base64'),
        })

    } catch{
        console.error('Error rendering userpage:', error);
        res.sendStatus(500);
    }
})

router.post('/editInformation', checkUserType('business'), checkIfYours, upload.single('coverPic'), async (req,res)=>{

    const userID = await internshipCreator.findOne({_id: req.body.id})
    let flexibleOrNot;
    let dateStart;
    let dateEnd;

    if(req.body.flexibleCheck){
        flexibleOrNot = 'flexible'
    } else {
        flexibleOrNot = 'fixed'
    }

    if(!req.body.dateStart){
        dateStart = new Date()
        dateStart.setFullYear(dateStart.getFullYear()+1000)
    }

    if(!req.body.dateEnd){
        dateEnd = new Date()
        dateEnd.setFullYear(dateEnd.getFullYear()+1000)
    }

    const db = getDB();
    const bucket = new mongodb.GridFSBucket(db, { bucketName: 'coverPicStorage' });
    let ID_Of_uploadstream;

    if (req.file) {
        try {
        
            const file = await bucket.find(new ObjectId(userID.coverPhotoID)).toArray();
        
            await bucket.delete(new ObjectId(file[0]._id));

            const coverPic = req.file;

            const readstream = stream.Readable.from(coverPic.buffer);

            const uploadstream = bucket.openUploadStream(coverPic.originalname);

            readstream.pipe(uploadstream);

            uploadstream.on('finish',()=>{
                ID_Of_uploadstream = uploadstream.id
            })

        } catch (error) {
            console.error('Error deleting profile picture:', error);
        }
    } else {
        ID_Of_uploadstream = userID.coverPhotoID
    }

    const filteredInterests = req.body.checked.split(',').filter((interest) => interest !== "");

    await internshipCreator.updateOne({_id: req.body.id}, {
        nameOfInternship: req.body.nameOfInternship,
        internshipTypeForWorking: flexibleOrNot,
        typeOfInternship: filteredInterests,
        description: req.body.about,
        skillsRequired: req.body.skill,
        addressForWork: req.body.district,
        internshipSchedule: req.body.internshipSchedule,
        shiftStart: req.body.shiftStart,
        shiftEnd: req.body.shiftEnd,
        startDate: dateStart,
        endDate: dateEnd,
        screeningQuestions: req.body.question,
        coverPhotoID: ID_Of_uploadstream,
        creationDate: Date.now()
    })



    res.redirect('/userpage')
})

router.get('/editInformation/deleteInfo', checkUserType('business'), async(req,res)=>{
    const userData = await internshipCreator.findOne({ _id: req.query.internship });
    const db = getDB();
    const bucket = new mongodb.GridFSBucket(db, { bucketName: 'coverPicStorage' });
    
    try {
        const file = await bucket.find(new ObjectId(userData.coverPhotoID)).toArray();

        if (file.length === 0) {

        // Handle the case when the file is not found, e.g., show an error message or take appropriate action
        } else {
            await bucket.delete(new ObjectId(file[0]._id));
            await internshipCreator.deleteOne({ _id: req.query.internship });
            res.redirect('/userpage');
        }
    } catch (error) {
        return res.redirect('/userpage')
    }
})

module.exports = router;