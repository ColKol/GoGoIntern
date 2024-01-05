const router = require('express').Router();
const Googlepassport = require('passport')

router.get('/google', Googlepassport.authenticate("google", {scope: ['profile', 'email']}));

router.get('/google/redirect', Googlepassport.authenticate("google"), (req,res)=>{
    if(req.user){
        res.cookie("userInfo", req.user.id)
        res.redirect('/userpage')
    } else{
        res.redirect('/users/login')
    }
})

module.exports = router