const router = require('express').Router();
const Googlepassport = require('passport')

router.get('/google', Googlepassport.authenticate("google", {scope: ['profile', 'email']}));

router.get('/google/redirect', Googlepassport.authenticate("google", {
    successRedirect:'/userpage',
    failureRedirect:'/users/login'
}))

module.exports = router