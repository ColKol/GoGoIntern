const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/ensureUserIsLoggedIn')
const cookieParser = require('cookie-parser')

router.use(cookieParser())

router.get('/', (req, res)=>{
    res.render('index')
})

router.get('/userpage', ensureAuthenticated, (req,res)=>{
    res.render('userpage', {
        name: req.user.username
    })
})

module.exports = router;