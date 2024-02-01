const router = require('express').Router();
const Googlepassport = require('passport')
const { studentInfo } = require('../config/studentInfo');
const cookieParser = require('cookie-parser');

router.get('/google', Googlepassport.authenticate("google", {scope: ['profile', 'email']}));

router.get('/google/redirect', Googlepassport.authenticate("google"), (req,res)=>{
    if(req.user){
        if(req.user.userType === "student" && req.user.firstTime == true){
            res.redirect('/users/registration/studentQuestionnare')
        } else if(req.user.userType === "business" && req.user.firstTime == true){
            res.redirect('/users/registration/businessQuestionnare')
        } else {
            const expirydate = new Date().getMonth() +1
            const oneMonth = 30 * 24 * 60 * 60 * 1000;
            res.cookie("userInfo", req.user.id, {maxAge: oneMonth, expires: new Date().setMonth(expirydate)})
            res.redirect('/userpage')
        }
    } else{
        res.redirect('/users/login')
    }
})

module.exports = router