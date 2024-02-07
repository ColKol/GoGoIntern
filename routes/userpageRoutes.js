require('dotenv').config();
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

const { getDB } = require('../databased/database')


// const { userRestriction } = require('..//config/userRestriction')

const mongodb = require('mongodb')
const fs = require('fs');
const assert = require('assert')

const { studentInfo } = require('../config/studentInfo');

const passport = require('..//config/cookie+registration')

router.use(cookieParser())

const storage = multer.memoryStorage()
const upload = multer({ storage })


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
    res.render('internshipCreator')
})

router.post('/createOpportunity', checkUserType('business'), (req,res)=>{
    const checkedValues = [];
    const shiftArray = [];
    Object.keys(req.body).forEach(key => {
        if (req.body[key] === 'on') {
          checkedValues.push(key);
        }
    })

    shiftArray.push(req.body.timeStart)
    shiftArray.push(req.body.timeEnd)

    const newInternship = new internshipCreator({
        creator: req.user._id,
        creatorName: req.user.username,
        nameOfInternship: req.body.title,
        typeOfInternship: checkedValues,
        internshipTypeForWorking: req.body.internshipType,
        wageType: req.body.wageType,
        wage: req.body.wage,
        description: req.body.about,
        skillsRequired: req.body.skill,
        workplaceType: req.body.internshipPlace,
        addressForWork: req.body.addressOfWorkplace,
        shiftStart: req.body.timeStart,
        shiftEnd: req.body.timeEnd,
        startDate: req.body.dateStart,
        endDate: req.body.dateEnd,
        screeningQuestions: req.body.question
    })

    newInternship.save();

    res.redirect('/userpage')

})

router.get('/searchInternships', checkUserType('student'),async (req,res)=>{

    const itemsPerPage = 1;
    const currentPage = req.query.page;
    const skipItems = (currentPage - 1) * itemsPerPage;

    let numberOfPages;
    let pageCount = [];


    let searchQuery;
    let queryNames = [];
    const { placementType, internshipChoices, startDate, endDate, wageType, shiftStart, shiftEnd } = req.query;
    const filter = {};

    if(placementType){
        filter.workplaceType = placementType;
    }

    if(internshipChoices){
        filter.typeOfInternship = internshipChoices;
    }

    if(startDate){
        filter.startDate = {$gte: startDate}
    }

    if(endDate){
        filter.endDate = {$lte: endDate}
    }

    if(wageType){
        filter.wageType = wageType
    }

    if(shiftStart){
        filter.shiftStart = {$gte: shiftStart}
    }

    if(shiftEnd){
        filter.shiftEnd = {$lte: shiftEnd}
    }


    if(req.query.searchBar != undefined){
        const query = stemmer.stem(req.query.searchBar)
        const searchedItem = new RegExp(query, 'i')
        filter.nameOfInternship = searchedItem;
        filter.personWhoSignedUp = undefined;
        console.log(filter)
        searchQuery = await internshipCreator.find(filter).skip(skipItems).limit(itemsPerPage);
        numberOfInternships = await internshipCreator.countDocuments(filter)



        searchQuery.forEach(async (sQuery)=>{
            queryNames.push(sQuery)
        })

        numberOfPages = Math.ceil(numberOfInternships/itemsPerPage);

        for(let i = 0; i <= numberOfPages; i++){
            pageCount.push(i)
        }

        pageCount.shift();

        res.render('searchInternships',{
            searchResults: queryNames,
            currentPage: req.query.page,
            searchBar: req.query.searchBar,
            placementType: placementType,
            internshipChoices: internshipChoices,
            startDate: startDate,
            endDate: endDate,
            shiftStart: shiftStart,
            shiftEnd: shiftEnd,
            wageType: wageType,
            numberOfPages: pageCount,
        })
    } else {
        res.render('searchInternships',{
            searchResults: searchQuery,
            currentPage: 1,
            numberOfPages: undefined
        })
    }
})

router.get('/businessProfile', checkUserType('student'), async (req,res)=>{
    console.log(req.query.business)
    const businessProfile = await userInfo.findOne({_id: req.query.business})
    res.render('businessProfile',{
        businessName: businessProfile.username,
        businessType: businessProfile.interests,
        businessDescription: businessProfile.description,
        businessAddress: businessProfile.address,
        businessContacts: businessProfile.email
    })
})

router.get('/signup', checkUserType('student'), checkIfSignUppable, async(req,res)=>{
    const signupFormat = await internshipCreator.findOne({_id: req.query.signupForm})
    res.render('signupForm',{
        questions: signupFormat.screeningQuestions,
        id: req.query.signupForm
    })
})

router.post('/signup', checkUserType('student'), async(req,res)=>{
    const signupFormat = await internshipCreator.findOne({_id: req.body.idForsignUp})
    
    const emailForFirms = await userInfo.findOne({_id: signupFormat.creator})

    var { bodyOfEmail } = req.body

    const db = getDB()
    var bucket = new mongodb.GridFSBucket(db, {bucketName: 'cvStorage'})

    const downloadStream = bucket.openDownloadStream(new mongodb.ObjectId(req.user.cv));
    const chunks = []

    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });


    downloadStream.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      var htmlString = ' <h3>Dear '+emailForFirms.username+',</h3>    <h4>'+req.user.username+' has signed up for '+signupFormat.nameOfInternship+', here is their Cirriculum Vitae and their application email:</h4>     <p>'+bodyOfEmail+'</p>    <h4>Answers to screening questions</h4>'
      try {
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.Verification_Bot_Email,
              pass: process.env.Verification_Bot_pass
            }
          });

          req.body.questionAnswer.forEach((question, index)=>{
            htmlString += '<h4>Question '+(index+1)+': '+signupFormat.screeningQuestions[index]+'</h4>  <li>'+question+'</li>     '
          })

          console.log(htmlString)
    
          var mailOptions = {
            from: process.env.Verification_Bot_Email,
            to: emailForFirms.email,
            subject: 'Application for '+signupFormat.nameOfInternship,
            // text: req.body.bodyOfEmail,
            html: htmlString,
            attachments: [{
              filename: req.user.username+"'s Cirriculum Vitae.pdf",
              content: pdfBuffer,
              encoding: 'base64'
            }]
          };
      
          transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
          })     
      } catch (error) {
          console.error(error);
          res.redirect('/users/register');
      }
    });

    await internshipCreator.updateOne({_id: req.body.idForsignUp}, {personWhoSignedUp: req.user._id})

    req.session.completedForm = true;

    res.redirect('/userpage/signup/signupConfirm?signup=' + signupFormat.id)
})

router.get('/signup/signupConfirm', checkUserType('student'), checkIfCompleted, async(req,res)=>{
    const firm = await internshipCreator.findOne({_id: req.query.signup})
    console.log(firm)
    res.render('signupConfirm',{
        signupName: firm.nameOfInternship
    })
})


router.get('/editInformation', checkUserType('business'), async (req,res)=>{
    let foundInternships = await internshipCreator.find({creator: req.user._id})
    res.render('internshipEdit', {
        foundInternships: foundInternships,
        internshipDelete: req.session.internshipDelete
    })
})

router.get('/editInformation/editInfo', checkUserType('business'), async (req,res)=>{
    let internshipInfo = await internshipCreator.findOne({_id: req.query.info})
    res.render('editInfoOnInternship',{
        internshipInfo: internshipInfo
    })
})

router.get('/editInformation/deleteInfo', checkUserType('business'), async(req,res)=>{
    await internshipCreator.deleteOne({_id: req.query.info})
    req.session.internshipDelete = true;
    res.redirect('/userpage/editInformation')
})

module.exports = router;