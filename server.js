require ('dotenv').config();

//Importing libraries and files needed
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const bodyParser = require("body-parser");
const indexRoute = require(".//routes/index")
const userRoute = require("./routes/user")
const authRoute = require('./routes/authRoutes')
const mongoose = require('mongoose')
const userInfo = require('./models/userCreation')
const verificationCode = require ('./models/verificationCodes')
const bcrypt = require('bcrypt')
const passport = require('passport')
const passportSetup = require('./config/GoogleAuthentication')
const cookiePassport = require('./config/cookiePassportJS')
const flash = require('express-flash')
const session = require('express-session')

const { connectToDatabase } = require('./databased/database')

require('./config/authentication')(passport);


//Setting up cookies
app.use(cookieParser());

//Setup session
app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: true
}));

//Passport middleware
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());


//Setup stuff (basically defining some stuff regarding what files we are rendering)
app.set('view engine', 'ejs');
app.set('views', './views')
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json());

//Linking CSS and JS scripts
//Sidenote, if you ever need to add external files into your ejs file, follow this link for the MIME types area: 
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
app.use(express.static(path.join(__dirname, 'public')));

//Database Conenction Stuff
connectToDatabase().then((db)=>{
  console.log("it worked!")
}).catch((error)=>{
  console.error("Failed to establish database connection:", error);
  process.exit(1);
})

//Routes (Basically all the possible filepaths for the website, will add more as the website gets larger)
app.use('', indexRoute);
app.use('/users', userRoute);
app.use('/auth', authRoute);

//Setting up a local enviroment
app.listen(3000);