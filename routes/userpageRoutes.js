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
    let searchQuery;
    let queryNames = [];
    const { placementType, internshipChoices, startDate, endDate, shiftStart, shiftEnd } = req.query;
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
        console.log(filter)
        searchQuery = await internshipCreator.find(filter)
        searchQuery.forEach(async (sQuery)=>{
            queryNames.push(sQuery)
        })
        res.render('searchInternships',{
            searchResults: queryNames,
        })
    } else {
        res.render('searchInternships',{
            searchResults: searchQuery
        })
    }
})

module.exports = router;