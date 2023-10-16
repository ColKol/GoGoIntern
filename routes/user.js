const express = require('express');
const router = express.Router();
const userInfo = require('..//models/userCreation')
const bcrypt = require('bcrypt')
const passport = require('passport')

//Login Renderer
router.get('/login', (req, res)=>{
    res.render('login')
})

//Register Renderer
router.get('/register', (req,res)=>{
    res.render('register')
})

//Registration Handler
router.post('/register', (req, res)=>{
    const {name, email, password} = req.body;
    let errors = [];

    if(password.length < 6) {
        console.log("Password is too short!")
    }

    if(errors.length > 0){
        res.render('register',{
            errors,
            name,
            email,
            password
        })
    } else {
        userInfo.findOne({email: email})
        .then(user =>{
            if (user){
                console.log("Email is already in use!")
                res.render('register',{
                    errors,
                    name,
                    email,
                    password
                })
            } else {
                const newUser = new userInfo ({
                    username: name,
                    email: email,
                    password: password
                })
                console.log(newUser)
                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        if (err) throw err;

                        newUser.password = hash

                        newUser.save()
                            .then(user =>{
                                res.redirect('/users/login')
                            })
                            .catch(err => console.log(err));
                    })
                })
            }
        })
    }
});

//Login handle
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/userpage',
        failureRedirect: '/users/login',
        failureFlash: true
    })
     (req,res,next);
})

// Logout handle
router.get('/logout', function(req, res,next) {
    req.logout(function(err){
        if (err) {return next (err)}
        console.log("You Logged Out!")
        res.redirect('/')
    })
});

module.exports = router;
